const mongoose = require('mongoose');
//const Entity = require('../models/entity');
const mongodbUrl = 'mongodb://localhost:27017';
const mongodbName = 'mbz';
const slugify = require('slugify');
const Enum = require('../sandbox/enums');
const config = require('config');
const util = require('util');
//const async = require('async');
const request = util.promisify(require("request"));
//const request = require('request-promise');
//const request = require("request");
const assert = require('assert');
const Schema = mongoose.Schema;

const useMbJson = config.get('general.import.useMbJson');
const autoUpdateEntity = config.get('general.import.autoUpdateEntity');
const autoImportForeignEntities = config.get('general.import.autoImportRelations');

let entitySchema = new Schema(
  {
    _id: {
      type: Number,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: false
    },
  },
  {
    strict: false
  }
);

exports.getEntity = (req, res, next) => {
  const id = req.params.id;
  const type = req.params.type;
  console.log('/api/:type/:id', id, type);
  _getEntity(id, type, entity => {
    return res.send(entity);
  });
};

exports.importEntity = (req, res, next) => {
  const id = req.params['id'];
  const type = req.params['type'];
  console.log('/api/:type/import/:id', id, type);
  _getEntity(id, type, entity => {
    if (!entity) {
      console.log(`  ${type} ${id} not found`);
      _insertEntity(id, type, result => {
        console.log(`  ${type} ${id} insert`);
        _getEntity(id, type, entity => {
          if (entity) {
            console.log(`  ${type} ${id} found`);
          } else {
            console.log(`${type} ${id} not found`);
          }
          res.send(entity);
        });
      });
    } else {
      _resetEntity(entity, type, (result) => {
        console.log(`  ${type} ${id} resetted`);
        _updateEntity(entity.id, type, (result) => {
          console.log(`  ${type} ${id} updated`);
          _getEntity(id, type, (entity) => {
            console.log(`  ${type} ${id} found`);
            res.send(entity)
          });
        });
      });
    }
  });
};

exports.resetEntity = (req, res, next) => {
  const id = req.params['id'];
  const type = req.params['type'];
  console.log('/api/:type/reset/:id', id, type);

  _getEntity(id, type, (entity) => {
    if (entity) {
      _resetEntity(entity, type, (results) => {
      });
    }
  });
};

exports.getEntityCount = (req, res, next) => {
  const type = req.params['type'];
  console.log('/api/:type/count', type);
  if (app.get('${type}Count')) {
    let count = app.get('${type}Count');
    res.send([{ count }]);
  } else {
    _getEntityCount(type, count => {
      app.set('${type}Count', count);
      res.send([{ count }]);
    });
  }
};

/*
memberSchema.statics.findMax = function (callback) {

  this.findOne({ country_id: 10 }) // 'this' now refers to the Member class
    .sort('-score')
    .exec(callback);
}
*/
var _getNextId = (type, callback) => {

  entitySchema.options.collection = type.replace('-', '_');
  Entity = mongoose.model(type, entitySchema);

  Entity
    .find()
    .sort({ _id: -1 })
    .limit(1)
    .exec((error, result) => {
      let nextId = (result[0]) ? result[0]._id + 1 : 1;
      callback(nextId);
    });
}

var _updateLastFMArtist = (id, type, callback) => {

  similarArtists = [];

  addSimilarArtist = artist => {
    similarArtists.push(artist);
  }

  var options = _buildLastFMLookupUrl(id, type);

  request(options)
    .then(results => {
      let document = {};
      let artist = results['body']['artist'];
      for (const key in artist) {
        switch (key) {
          case 'image':
            for (const image of artist['image']) {
              if (image['size'] === 'mega') {
                document['image'] = image['#text'];
              }
            }
            break;
          case 'similar':

            for (const similar_artist of artist['similar']['artist']) {

              let imageUrl = '';
              let mbid = '';
              let name = similar_artist['name'];

              if (similar_artist['image']) {
                for (const image of similar_artist['image']) {
                  if (image['size'] === 'mega') {
                    imageUrl = image['#text']
                  }
                }
              }

              //_searchLastFMArtist(similar_artist['name'], 'artist')
              var options = _buildLastFMSearchUrl(name, type);
              request(options)
                .then(results => {
                  if (results['body'] && results['body']['artist']) {
                    let mbid = results['body']['artist']['mbid'];
                    addSimilarArtist({
                      id: mbid,
                      name: name,
                      image: imageUrl
                    });
                    //document['similar_artists'] = similarArtists;
                    document['similar_artists'] = {
                      id: mbid,
                      name: name,
                      image: imageUrl
                    };
                    //document['last_updated'] = new Date();
                    _getEntityModel(type, document)
                      .updateOne({ id: id }, document)
                      .then(result => {
                        callback(result);
                      })
                      .catch(err => {
                        console.log(err);
                        callback(err);
                      });
                  }
                })
            }
            break;
          default:
            break;
        }
      }
      return true;
    })
    .then(results => {
    })
    .catch(err => {
      if (err) {
        callback(err);
      }
    });
}

var _getEntity = (id, type, callback) => {
  entitySchema.options.collection = type.replace('-', '_');
  Entity = mongoose.model(type, entitySchema);
  Entity.findOne({ id: id })
    .then(entity => {
      if (!entity) {
        _insertEntity(id, type, result => {
          _getEntity(id, type, result => {
            switch (type) {
              case 'artist':
                _updateLastFMArtist(id, type, result => {
                });
              case 'release':
                break;
              default:
                break;
            }
          });
        });
      }
      callback(entity);
    })
    .catch(err => console.log(err));
}

var _searchLastFMArtist = (name, type, callback) => {
  // var options = _buildLastFMSearchUrl(name, type);
  // request(options, (err, res, entity) => {
  //   if (err) {
  //     console.log(name, err);
  //     callback(null);
  //   }
  //   if ((entity &&
  //     entity['error']
  //     && entity['message'])
  //     && !entity['artist']) {
  //     console.log(name, entity['message']);
  //     callback(null);
  //   }

  //   callback(entity['artist']['mbid']);
  // });
};

var _getEntityCount = (type, callback) => {

  entitySchema.options.collection = type.replace('-', '_');
  Entity = mongoose.model(type, entitySchema);
  Entity
    .countDocuments()
    .then(result => {
      callback(result);
    })
    .catch(err => {
      console.log(err);
      callback(err);
    });
}

var _insertEntity = (id, type, callback) => {
  var options = _buildEntityLookupUrl(id, type);

  request(options, (err, res, entity) => {

    if (err) { return console.log(err); }

    let document = {};
    for (const key in entity) {
      document[key] = entity[key];
    }

    let slug = ((entity.name) ? entity.name : entity.title) + ((entity.disambiguation)
      ? '-' + (entity.disambiguation) : '').replace(/\//g, '-');

    document['slug'] = type + "/" +
      slugify(slug, { remove: /[*+~.()\'"!:@]/g }).toLowerCase();

    document['last_updated'] = new Date();

    _getNextId(type, (nextId) => {
      document['_id'] = nextId;
      _getEntityModel(type, document)
        .save()
        .then(result => {
          if (autoImportForeignEntities) {
            _importForeignEntities(entity, type, (result) => {
            });
          }
          callback(result);
        })
        .catch(err => {
          console.log(err);
          callback(err);
        });
    });
  });
}

var _updateEntity = (id, type, callback) => {

  var options = _buildEntityLookupUrl(id, type);

  request(options, (err, res, entity) => {
    if (err) { return console.log(err); }

    let document = {};

    for (const key in entity) {
      if (key != 'id') {
        document[key] = entity[key];
      }
    }

    let slug = ((entity.name) ? entity.name : entity.title) + ((entity.disambiguation)
      ? '-' + (entity.disambiguation) : '').replace(/\//g, '-');

    //    updateValues['slug'] =
    //    slugify(slug, { remove: /[*+~.()\'"!:@]/g }).toLowerCase();

    document['last_updated'] = new Date();

    _getEntityModel(type, document)
      .updateOne({ id: id }, document)
      .then(result => {
        if (autoImportForeignEntities) {
          _importForeignEntities(entity, type, (foreignResult) => {
          });
        }
        callback(result);
      })
      .catch(err => {
        console.log(err);
        callback(err);
      });
  });
}

var _resetEntity = (document, type, callback) => {

  const MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(mongodbUrl, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);

    const entityType = type.replace('-', '_');
    const db = client.db(mongodbName);
    const collection = db.collection(entityType);

    let unsetValues = {};

    for (const key in document) {
      if (key != '_id' && key != 'id' && key != 'slug') {
        unsetValues[key] = '';
      }
    }

    collection.updateOne(
      { id: document['id'] },
      { $unset: unsetValues }
      , (err, result) => {
        callback();
      });
    client.close();
  });
}

var _importForeignEntities = (doc, type, callback) => {

  let foreignEntities = getForeignEntities(type);

  for (var foreignEntity of foreignEntities) {

    let key = Object.keys(foreignEntity)[0];
    let foreignType = Object.values(foreignEntity)[0];
    if (Object.prototype.hasOwnProperty.call(doc, key)) {
      if (doc[key]) {
        let id = doc[key]['id'];
        _getEntity(id, foreignType, (entity) => {
          if (!entity) {
            _insertEntity(id, foreignType, (result) => {
              callback(result);
            });
          } else {
            _resetEntity(entity, foreignType, () => {
              _updateEntity(entity.id, foreignType, (result) => {
                switch (type) {
                  case 'artist':
                  //_updateLastFMArtistData(id, type, result => {
                  //});
                  case 'release':
                    break;
                  default:
                    break;
                }
                callback(result);
              });
            });
          }
        });
      }
    }
  };
}

var _getEntityModel = (type, document) => {
  entitySchema.options.collection = type.replace('-', '_');
  let Entity = mongoose.model(type, entitySchema);
  let entity = new Entity(document);
  return entity;
}

var browseArtists = (offset, count, callback) => {
  const MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(mongodbUrl, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);
    //console.log("Connected successfully to server");

    const db = client.db(mongodbName);

    collection = db.collection("artist");
    collection.find({ "name": { $ne: null } })
      .limit(parseInt(count))
      .skip(parseInt(offset))
      .sort({ name: 1 }).toArray((err, documents) => {
        //assert.equal(err, null);
        callback(documents);
      });

    client.close();
  });
}

var searchArtist = (term, callback) => {

  const MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(mongodbUrl, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);
    //console.log("Connected successfully to server");

    const db = client.db(mongodbName);

    collection = db.collection("artist");
    term = '"' + term + '"';

    collection.find({
      $text: { $search: term, $caseSensitive: false }
    }).toArray((err, documents) => {
      //assert.equal(err, null);
      callback(documents);
    });

    client.close();
  });
}

var _buildLastFMSearchUrl = (name, type) => {
  const url = `http://ws.audioscrobbler.com/2.0/?method=${type}.getinfo&${type}=${name}&api_key=e1182eaac16ae88fec850af3a0e7ab19&format=json`;
  var options = {
    url: url,
    headers: {
      'User-Agent': 'm3 server 100.115.92.202'
    },
    json: true
  };

  return options;
}

var _buildLastFMLookupUrl = (mbid, type) => {
  const url = `http://ws.audioscrobbler.com/2.0/?method=${type}.getinfo&mbid=${mbid}&format=json&api_key=e1182eaac16ae88fec850af3a0e7ab19&format=json`;

  var options = {
    url: url,
    headers: {
      'User-Agent': 'm3 server 100.115.92.202'
    },
    json: true
  };

  return options;
}

function _buildEntityLookupUrl(id, type) {
  let incs = getEntityIncludes(type).join("+");
  const mburl = `https://musicbrainz.org/ws/2/${type}/${id}?inc=${incs}&fmt=json`;
  //console.log(mburl);
  var options = {
    url: mburl,
    headers: {
      'User-Agent': 'm3 server 100.115.92.202'
    },
    json: true
  };

  return options;
}

/*
"area-rels", "artist-rels", "event-rels",
"label-rels", "place-rels", "recording-rels", "release-group-rels",
"release-rels", "series-rels", "url-rels", "work-rels"
*/
const getEntityIncludes = type => {
  switch (type) {
    case "area":
      return ["aliases", "ratings", "tags"];
    case "artist":
    case "label":
    case "work":
      return ["aliases", "ratings", "tags"];
    case "event":
    case "place":
    case "recording":
    case "release":
      return ["artist-credits", "ratings", "tags"];
    case "release-group":
      return ["artist-credits", "ratings", "tags"];
    case "series":
    case "url":
      return ["ratings", "tags"];
    default:
      break;
  }
}

const getForeignEntities = type => {
  switch (type) {
    case "area":
      return [];
    case "artist":
      return [{ "area": "area" }, { "begin_area": "area" }, { "end_area": "area" }];
    case "label":
    case "work":
      return [];
    case "event":
    case "place":
    case "recording":
    case "release":
      return ["artist-credits"];
    case "release-group":
      return ["artist-credits"];
    case "series":
    case "url":
      return [];
    default:
      break;
  }
}

const getEntitySubqueries = type => {
  switch (type) {
    case "artist":
      return ["recordings", "releases", "release-groups", "works"];
    case "label":
      return ["releases"];
    case "recording":
      return ["artists", "releases"];
    case "release":
      return ["artists", "collections", "labels", "recordings", "release-groups"];
    case "release-group":
      return ["artists", "releases"];
    default:
      break;
  }
}

const getEntitySubqueryIncludes = type => {
  switch (type) {
    case "recordings":
      return ["artist-credits", "isrcs"];
    case "releases":
      return ["artist-credits", "discids", "media"];
    case "release-groups":
      return ["artists", "releases"];
    default:
      break;
  }
}