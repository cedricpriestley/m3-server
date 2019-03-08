const express = require('express');
const mongoose = require('mongoose');
const Area = require('../models/area');
const Artist = require('../models/artist');
const Label = require('../models/label');
const Release = require('../models/release');
const ReleaseGroup = require('../models/release-group');
const slugify = require('slugify');
const Enum = require('../sandbox/enums');
const config = require('config');
const util = require('util');
var Promise = require("bluebird");
//const async = require('async');
const request = util.promisify(require("request"));
//const request = require('request-promise');
const assert = require('assert');
const Schema = mongoose.Schema;

const useMbJson = config.get('general.import.useMbJson');
const autoUpdateEntity = config.get('general.import.autoUpdateEntity');
const autoImportForeignEntities = config.get('general.import.autoImportRelations');

const app = express();

/*
const entities = ['area', 'artist'];
const Entities = [];
for (entity of entities) {
  var entitySchema = new Schema({
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: false
    },
  }, {
    collection: entity,
    strict: false
  });

  if (!Entities[entity] ) {
    Entities[entity] = mongoose.model(entity, entitySchema);
  }
}
*/
exports.getEntity = (req, res, next) => {
  const id = req.params.id;
  const type = req.params.type;
  console.log('/api/:type/:id', id, type);
  _getEntity(id, type, true, entity => {
    return res.send(entity);
  });
};

exports.browseEntities = (req, res, next) => {
  console.log('/api/artist/browse/:offset/:count');
  const type = req.params['type'].toLowerCase();
  const offset = req.params['offset'];
  const count = req.params['count'];

  _browseEntities(type, offset, count, (documents) => {
    if (documents && documents.length >= 0) {
      res.send(documents);
    }
  });
}

exports.importEntity = (req, res, next) => {
  const id = req.params['id'];
  const type = req.params['type'];
  console.log('/api/:type/import/:id', id, type);
  //_getEntity(id, type, entity => {
  _getEntity(id, type, false, () => {
      ;
    })
    .then(entity => {
      return entity;
    })
    .then(entity => {
      if (!entity) {
        console.log(`  ${type} ${id} not found`);
        _insertEntity(id, type, (result, ent) => {
          console.log(`  ${type} ${id} insert`);
          _getEntity(id, type, false, entity => {
            if (entity) {
              console.log(`  ${type} ${id} found`);
            } else {
              console.log(`${type} ${id} not found`);
            }

            if (autoImportForeignEntities) {
              _importForeignEntities(entity, type, (result) => {});
            }
            res.send(entity);
          });
        });
      } else {
        _resetEntity(entity, type, (result) => {
          console.log(`  ${type} ${id} resetted`);
          _updateEntity(entity.id, type, (result, ent) => {
            console.log(`  ${type} ${id} updated`);
            _getEntity(id, type, false, (entity) => {
              console.log(`  ${type} ${id} found`);
              if (autoImportForeignEntities) {
                _importForeignEntities(ent, type, (result) => {});
              }
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

  _getEntity(id, type, false, (entity) => {
    if (entity) {
      _resetEntity(entity, type, (results) => {});
    }
  });
};

exports.getEntityCount = (req, res, next) => {
  const type = req.params['type'];
  console.log('/api/:type/count', type);
  if (app.get('${type}Count')) {
    let count = app.get('${type}Count');
    res.send([{
      count
    }]);
  } else {
    _getEntityCount(type, count => {
      app.set('${type}Count', count);
      res.send([{
        count
      }]);
    });
  }
};

var _getNextId = (type, callback) => {

  _getEntityModel3(type)
    .find()
    .sort({
      _id: -1
    })
    .limit(1)
    .exec((error, result) => {
      let nextId = (result[0]) ? result[0]._id + 1 : 1;
      callback(nextId);
    });
}

var _updateLastFMArtist = (id) => {
  var options = _buildLastFMLookupUrl(id, 'artist');

  request(options)
    .then(results => {
      if (results['body']['error']) {
        console.log(results['body']['message']);
      }
      if (results['body']['artist']) {
        let document = {};
        document['images'] = [];
        let artist = results['body']['artist'];

        if (artist['image']) {
          //document['images'] = artist['image'];
        }

        for (const image of artist['image']) {
          //if (image['size'] === 'mega') {
          document['images'].push({
            url: image['#text'],
            size: image['size']
          });
          //}
        }

        let similarArtists = [];
        document['similar_artists'] = [];
        for (simArtist of artist['similar']['artist']) {
          similarArtists.push(simArtist['name']);
        }

        Promise.try(function () {
          if (artist['similar']['artist'].length == 0) return [];
          return _searchLastFMArtist(similarArtists);

        }).then(function (results) {
          // Now `results` is an array that contains the response for each HTTP request made.
          for (const simArtist of results) {
            if (!simArtist || !simArtist['mbid']) continue;
            let name = simArtist['name'];
            let mbid = simArtist['mbid'];
            let simImages = [];
            for (const image of simArtist['image']) {
              simImages.push({
                url: image['#text'],
                size: image['size']
              });
              //   if (image['size'] === 'mega') {
              //     imageUrl = image['#text'];
              //   }
            }
            document['similar_artists'].push({
              name: name,
              images: simImages,
              id: mbid
            });
          }

          document['last_updated'] = new Date();

          _getEntityModel3('artist')
            .updateOne({
              id: id
            }, {
              $set: {
                images: document['images'],
                similar_artists: document['similar_artists']
              }
            })
            .then(result => {
              console.log(result);
            })
            .catch(err => {
              console.log(err);
            });
        })
      }
    })
    .catch(err => {
      console.log(err);
    });
};

var _getEntity = (id, type, autoImport = false, callback) => {
  return Promise.try(function () {
    _getEntityModel3(type.replace('-', '_'))
      .findOne({
        id: id
      })
      .then(entity => {
        if (!entity && autoImport) {
          _insertEntity(id, type, (result, ent) => {
            _getEntity(id, type, false, entity => {
              switch (type) {
                case 'artist':
                  _updateLastFMArtist(id, result => {});
                case 'release':
                  break;
                default:
                  break;
              }
              if (autoImportForeignEntities) {
                _importForeignEntities(entity, type, (result) => {});
              }
            });
          });
        }
        callback(entity);
      })
      .catch(err => {
        console.log(err)
      });
  });
}

var _searchLastFMArtist = (similarArtists) => {
  return Promise.try(function () {
    //similarArtists.reverse();
    let name = similarArtists[similarArtists.length - 1];
    let options = _buildLastFMSearchUrl(name, 'artist');
    return request(options);
  }).then(function (response) {
    similarArtists.pop();
    if (similarArtists.length > 0) {
      return Promise.try(function () {
        return _searchLastFMArtist(similarArtists);
      }).then(function (recursiveResults) {
        if (response.body.artist) {
          return [response.body.artist].concat(recursiveResults);
        } else {
          return recursiveResults;
        }
      });
    } else {
      // Done looping
      if (response.body.artist) {
        return [response.body.artist];
      } else {
        return [response.body.artist];
      }
    }
  });
}

var _getEntityCount = (type, callback) => {

  _getEntityModel3(type.replace("-", "_"))
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

  request(options)
    .then(entity => {

      let document = {};
      for (const key in entity.body) {
        document[key.replace('-', '_')] = entity.body[key];
      }

      let slug = ((entity.body.name) ? entity.body.name : entity.body.title) + ((entity.body.disambiguation) ?
        '-' + (entity.body.disambiguation) : '').replace(/\//g, '-');

      document['slug'] = type + "/" +
        slugify(slug, {
          remove: /[*+~.()\'"!:@]/g
        }).toLowerCase();

      document['last_updated'] = new Date();

      if (type === 'release') {
        //var coverArtUrl = _getReleaseCoverArt(id)
        //document['coverart_url'] = coverArtUrl;


        let coverArtUrl = `http://coverartarchive.org/release/${id}`;
        var options = {
          url: coverArtUrl,
          headers: {
            'User-Agent': 'm3 server 100.115.92.202'
          },
          json: true
        };
        request(options)
          .then(results => {
            if (!results.body.images) {
              return document;
            }
            for (const image of results.body.images) {
              if (image['front'] === true) {
                document['coverart_url'] = image['image'];
                //return image['image'];
              }
            }
            return document;
          })
          .then(document => {
            Entity = _getEntityModel3(type.replace('-', '_'));
            ent = new Entity(document);
            ent
              .save()
              .then(result => {
                callback(result, entity);
              })
              .then(results => {})
              .catch(err => {
                console.log(err);
                callback(err);
                return;
              });
          })
          .catch(err => {
            console.log(err);
          })
      } else {
        return document;
      }
    })
    .then(document => {
      Entity = _getEntityModel3(type.replace('-', '_'));
      ent = new Entity(document);
      ent
        .save()
        .then(result => {
          callback(result, document);
        })
        .then(results => {})
        .catch(err => {
          console.log(err);
          callback(err);
        });
      //});
    })
    .catch(err => {
      console.log(err);
    });
}

var _getReleaseCoverArt = async (id) => {
  let coverArtUrl = `http://coverartarchive.org/release/${id}`;
  var options = {
    url: coverArtUrl,
    headers: {
      'User-Agent': 'm3 server 100.115.92.202'
    },
    json: true
  };
  await request(options)
    .then(results => {
      for (const image of results.body.images) {
        if (image['front'] === true) {
          //document['coverart_url'] = image['image'];
          return image['image'];
        }
      }
    })
    .catch(err => {
      console.log(err);
    })
};

var _updateEntity = (id, type, callback) => {

  var options = _buildEntityLookupUrl(id, type);

  request(options, (err, res, entity) => {
    if (err) {
      return console.log(err);
    }

    let document = {};

    for (const key in entity) {
      if (key != 'id') {
        document[key.replace('-', '_')] = entity[key];
      }
    }

    let slug = ((entity.name) ? entity.name : entity.title) + ((entity.disambiguation) ?
      '-' + (entity.disambiguation) : '').replace(/\//g, '-');

    //    updateValues['slug'] =
    //    slugify(slug, { remove: /[*+~.()\'"!:@]/g }).toLowerCase();

    document['last_updated'] = new Date();

    _getEntityModel3(type.replace("-", "_"))
      .updateOne({
        id: id
      }, document)
      .then(result => {
        callback(result, entity);
      })
      .catch(err => {
        console.log(err);
        callback(err);
      });
  });
}

var _resetEntity = (document, type, callback) => {

  const entityType = type.replace('-', '_');

  let unsetValues = {};

  for (const key in document) {
    if (key != '_id' && key != 'id' && key != 'slug') {
      unsetValues[key] = '';
    }
  }

  _getEntityModel3(entityType)
    .updateOne({
      id: document['id']
    }, {
      $unset: unsetValues
    }, (err, result) => {
      callback();
    });
}

var _importForeignEntities = (doc, type, callback) => {

  let foreignEntities = getForeignEntities(type);

  for (var foreignEntity of foreignEntities) {

    let key = Object.keys(foreignEntity)[0];
    let foreignType = Object.values(foreignEntity)[0];
    if (Object.prototype.hasOwnProperty.call(doc, key)) {
      if (doc[key]) {
        let id;
        if (type == 'release' && key == 'label_info') {
          id = doc[key][0]['label']['id'];
        } else {
          id = doc[key]['id'];
        }
        _getEntity(id, foreignType, false, (entity) => {
          if (!entity) {
            _insertEntity(id, foreignType, (result) => {
              callback(result);
            });
          } else {
            _resetEntity(entity, foreignType, () => {
              _updateEntity(entity.id, foreignType, (result, entity) => {
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

var _getEntityModel = (type) => {
  entitySchema.options.collection = type.replace('-', '_');
  return mongoose.model(type, entitySchema);
}

var _getEntityModel2 = (type, document) => {
  entitySchema.options.collection = type.replace('-', '_');
  let e = mongoose.model(type, entitySchema);
  return new e(document);
}

var _getEntityModel3 = (type) => {

  switch (type) {
    case "area":
      return Area;
    case "artist":
      return Artist;
      case "label":
      return Label;
    case "release":
      return Release;
    case "release_group":
      return ReleaseGroup;
    default:
      throw new Error('Entity model not found.');
  }
}

var _browseEntities = (type, offset, count, callback) => {

  _getEntityModel3(type.replace("-", "_"))
    .find({
      "name": {
        $ne: null
      }
    })
    .limit(parseInt(count))
    .skip(parseInt(offset))
    .sort({
      name: 1
    }).toArray((err, documents) => {
      //assert.equal(err, null);
      callback(documents);
    });
}

var searchArtist = (term, callback) => {

  term = '"' + term + '"';

  _getEntityModel3('artist'.replace("-", "_"))
    .find({
      $text: {
        $search: term,
        $caseSensitive: false
      }
    }).toArray((err, documents) => {
      //assert.equal(err, null);
      callback(documents);
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
  console.log(url);
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
  let subs = getEntitySubqueries(type).join("+");
  let subIncs = getEntitySubqueryIncludes(type).join("+");
  let relIncs = getRelIncludes(type).join("+");

  const mburl = `https://musicbrainz.org/ws/2/${type}/${id}?inc=${incs}+${relIncs}+${subs}+${subIncs}&fmt=json`;
  console.log(mburl);
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
$relIncs = ["area-rels", "artist-rels", "event-rels",
"label-rels", "place-rels", "recording-rels", "release-group-rels",
"release-rels", "series-rels", "url-rels", "work-rels"]
*/
const getRelIncludes = type => {
  switch (type) {
    case "area":
    case "artist":
    case "label":
    case "place":
    case "recording":
    case "release":
    case "release-group":
    case "series":
    case "url":
      return ["area-rels", "artist-rels", "event-rels",
        "label-rels", "place-rels", "recording-rels", "release-group-rels",
        "release-rels", "series-rels", "url-rels", "work-rels"
      ];
    default:
      return [];
  }
}

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
      return [{
        "area": "area"
      }, {
        "begin_area": "area"
      }, {
        "end_area": "area"
      }];
    case "label":
    case "work":
      return [];
    case "event":
    case "place":
    case "recording":
    case "release":
      return [{
        "label_info": "label"
      }];
    case "release-group":
      return [];//["artist-credits"];
    case "series":
    case "url":
      return [];
    default:
      return [];
  }
}

const getEntitySubqueries = type => {
  switch (type) {
    case "artist":
      return ["media", "recordings", "releases", "release-groups", "works"];
    case "label":
      return ["releases"];
    case "recording":
      return ["artists", "releases"];
    case "release":
      return ["artists", "isrcs", "labels", "recordings", "release-groups"];
    case "release-group":
      return ["artists", "media", "releases"];
    default:
      return [];
  }
}

const getEntitySubqueryIncludes = type => {
  switch (type) {
    case "recordings":
      return ["artist-credits", "isrcs"];
    case "release":
      return ["artist-credits", "media"];
    default:
      return [];
  }
}