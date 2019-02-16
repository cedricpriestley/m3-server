const express = require('express');
const billboard = require("billboard-top-100");
const app = express();
const mongo = require('mongodb');
const amazon = require('amazon-product-api');
const assert = require('assert');
const request = require('request');
const Enum = require('./enums');
const config = require('config');
const { getCode, getName } = require('country-list');
const mongodbUrl = 'mongodb://localhost:27017';
const mongodbName = 'm3db';
var useMbJson = config.get('general.import.useMbJson');
const slugify = require('slugify');

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.listen(8000, () => {
  console.log('Server started!');
});

app.route('/api/artist/browse/:offset/:count').get((req, res) => {
  console.log('/api/artist/browse/:offset/:count');
  const offset = req.params['offset'];
  const count = req.params['count'];

  browseArtists(offset, count, (documents) => {
    if (documents && documents.length >= 0) {
      res.send(documents);
    }
  });
});

app.route('/api/:type/count').get((req, res) => {
  const type = req.params['type'];
  console.log('/api/:type/count', type);
  if (app.get('${type}Count')) {
    let count = app.get('${type}Count');
    res.send([{ count }]);
  } else {
    getEntityCount(type, (count) => {
      //if (typeof count == Number) {
      app.set('${type}Count', count);
      res.send([{ count }]);
      // }
    });
  }
});

app.route('/api/:type/reset/:id').get((req, res) => {
  const id = req.params['id'];
  const type = req.params['type'];
  console.log('/api/:type/reset/:id', id, type);
  resetEntity(id, type, () => {
    getEntity(id, type, (documents) => {
      if (documents && documents.length == 1) {
        entity = documents[0];
        res.send(entity);
      }
    });
  });
});

app.route('/api/:type/import/:id').get((req, res) => {
  const id = req.params['id'];
  const type = req.params['type'];
  console.log('/api/:type/import/:id', id, type);
  getEntity(id, type, (documents) => {
    if (documents && documents.length == 1) {
      entity = documents[0];

      importEntity(entity.id, type, entity.name, (importedEntity) => {
        res.send(importedEntity);
      });
    }
  });
});

app.route('/api/artist/search/:term/:offset/:count').get((req, res) => {
  const term = req.params['term'];
  const offset = req.params['offset'];
  const count = req.params['count'];
  console.log('/api/artist/search/:term/:offset/:count', term, offset, count);
  searchArtist(term, offset, count, (documents) => {
    res.send(documents);
  });
});

app.route('/api/:type/:id').get((req, res) => {
  const id = req.params['id'];
  const type = req.params['type'];
  console.log('/api/:type/:id', id, type);
  getEntity(id, type, (documents) => {
    if (documents && documents.length == 1) {
      entity = documents[0];

      let autoImport = config.get('general.import.autoImport');
      if (autoImport) {
        importEntity(entity.id, type, entity.name, (importedEntity) => {
          res.send(importedEntity);
        });
      } else {
        res.send(entity);
      }
    }
  });
});

app.route('/api/amazon/:asin').get((req, res) => {
  var asin = req.param['asin'];
  asin = "B0000029GA";
  console.log('/api/amazon/:asin', asin);
  var client = amazon.createClient({
    awsId: "AKIAJ2GKAP6QL6J4UISQ",
    awsSecret: "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",
    awsTag: "hakdras-20"
  });

  client.itemLookup({
    idType: "ASIN",
    itemId: asin,
    responseGroup: 'Large'
  }).then((results) => {
    res.send(JSON.stringify(results));
  }).catch((err) => {
    res.send(JSON.stringify(err));
  });
});

app.route('/api/charts/hot-100').get((req, res) => {
  console.log('/api/charts/hot-100');
  billboard.getChart('hot-100', '2019-01-26', (err, chart) => {
    if (err) {
      console.log(err);
      res.send({ 'error': err });
    }
    res.send({ chart });
  });
});

app.route('/api/charts/r-b-hip-hop-songs').get((req, res) => {
  console.log('/api/charts/r-b-hip-hop-songs');
  billboard.getChart('r-b-hip-hop-songs', '2019-01-26', (err, chart) => {
    if (err) {
      console.log(err);
      res.send({ 'error': err });
    }
    res.send({ chart });
  });
});

app.route('/api/charts/billboard-200').get((req, res) => {
  console.log('/api/charts/billboard-200');
  billboard.getChart('billboard-200', '2019-01-26', (err, chart) => {
    if (err) {
      console.log(err);
      res.send({ 'error': err });
    }
    res.send({ chart });
  });
});

app.route('/api/charts/artist-100').get((req, res) => {
  console.log('/api/charts/artist-100');
  billboard.getChart('artist-100', '2019-01-26', (err, chart) => {
    if (err) {
      console.log(err);
      res.send({ 'error': err });
    }
    res.send({ chart });
  });
});

app.route('/api/charts/list').get((req, res) => {
  console.log('/api/charts/list');
  var listCharts = require('billboard-top-100').listCharts;

  listCharts((err, charts) => {
    if (err) {
      console.log(err);
      res.send({});
    }
    console.log(charts);
  });
});

var importEntity = (id, type, name, callback) => {
  console.log(`${name} is being imported`);
  let mbid = id;
  let incs = getEntityIncludes(type).join("+");
  const mburl = `https://musicbrainz.org/ws/2/${type}/${mbid}?inc=${incs}&fmt=json`;
  console.log(mburl);
  var options = {
    url: mburl,
    headers: {
      'User-Agent': 'm3 server 100.115.92.202'
    },
    json: true
  };

  request(options, (err, res2, entity) => {
    if (err) { return console.log(err); }

    let updateValues = {};
    let entityFields = getEntityFields(type);
    entityFields.forEach((field) => {
      if (field != 'slug') {
        if (eval("entity['" + field + "']")) {
          updateValues[field] = eval("entity['" + field + "']");
        }
      }
    });

    if (entity.tags && entity.tags.length > 0) {
      updateValues['tags'] = [];
      entity.tags.forEach((tag) => {
        // if (tag.count > 0) {
        updateValues['tags'].push(tag);//updateValues['tags'].push({ name: tag.name, count: tag.count });
        //}
      });
    }

    if (entity.aliases && entity.aliases.length > 0) {
      updateValues['aliases'] = [];
      entity.aliases.forEach((alias) => {
        //if (alias.count > 0) {
        updateValues['aliases'].push(alias);//updateValues['aliases'].push({ name: alias.name, count: alias.count });
        //}
      });
    }

    // remove *+~.()'"!:@/\ from slug
    let slug = ((entity.name) ? entity.name : entity.title) + ((entity.disambiguation)
      ? '-' + (entity.disambiguation) : '').replace(/\//g, '-');

    updateValues['slug'] =
      slugify(slug, { remove: /[*+~.()\'"!:@]/g }).toLowerCase();

    updateValues['last_updated'] = new Date();

    let document = [
      { id: mbid },
      { $set: updateValues }];

    updateEntities(type, [document], (result) => {
      if (useMbJson) {
        callback(entity);
      } else {
        getEntity(mbid, type, (documents) => {
          if (documents && documents.length == 1) {
            entity = documents[0];
            callback(entity);
          }
        });
      }
    });
  });
}

var getEntity = (id, type, callback) => {

  const MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(mongodbUrl, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(mongodbName);
    const entityType = type.replace('-', '_');
    collection = db.collection(entityType);
    collection.find({ id: id }).toArray((err, documents) => {
      //assert.equal(err, null);
      callback(documents);
    });

    client.close();
  });
}

var getEntityCount = (callback) => {
  const MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(mongodbUrl, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(mongodbName);

    collection = db.collection("artist");
    collection.countDocuments((err, count) => {
      //assert.equal(err, null);
      callback(count);
    });

    client.close();
  });
}

var browseArtists = (offset, count, callback) => {
  const MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(mongodbUrl, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");

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
    console.log("Connected successfully to server");

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

var updateEntities = (type, documents, callback) => {
  if (documents.length == 0) return;

  const MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(mongodbUrl, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);

    const db = client.db(mongodbName);
    const entityType = type.replace('-', '_');
    const collection = db.collection(entityType);

    documents.forEach((document) => {
      collection.updateOne(
        document[0], document[1]
        , (err, result) => {
          callback(result);
        });
    });
    client.close();
  });
}

var resetEntity = (id, type, callback) => {

  const MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(mongodbUrl, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);

    const entityType = type.replace('-', '_');
    const db = client.db(mongodbName);
    const collection = db.collection(entityType);

    let unsetValues = {};
    let entityFields = getEntityFields(type);
    entityFields.forEach((field) => {
      //if (field != 'slug') {
      unsetValues[field] = '';
      //}
    });

    collection.updateOne(
      { id: id },
      { $unset: unsetValues }
      , (err, result) => {
        callback();
      });
    client.close();
  });
}

const getEntityFields = type => {

  switch (type) {
    case "area":
      return [
        "aliases", "disambiguation", "last_updated", "life-span", "name",
        "ratings", "relations", "slug", "sort-name", "tags", "type", "type-id"];
    case "artist":
      return [
        "aliases", "area", "begin_area", "country", "disambiguation",
        "end_area", "gender", "gender-id", "isnis", "last_updated",
        "life-span", "name", "ratings", "relations", "slug", "sort-name",
        "tags", "type", "type-id"];
    case "event":
      return [
        "aliases", "cancelled", "disambiguation", "genres", "last_updated",
        "life-span", "name", "rating", "relations", "setlist", "slug", "tags",
        "time", "type", "type-id"];
    case "label":
      return [
        "aliases", "area", "country", "disambiguation", "genres", "ipis", "isnis",
        "label-code", "last_updated", "life-span", "name", "rating", "relations",
        "slug", "sort-name", "tags", "type", "type-id"];
    case "place":
      return [
        "address", "aliases", "area", "coordinates", "disambiguation",
        "genres", "last_updated", "life-span", "name", "relations",
        "slug", "tags", "type", "type-id"];
    case "release":
      return [
        "aliases", "artist-credit", "asin", "barcode", "country", "cover-art-archive",
        "date", "disambiguation", "genres", "gid", "last_updated", "packaging",
        "packaging-id", "quality", "relations", "release-events", "release-group", "slug",
        "status", "status-id", "tags", "text-representation", "title"];
    case "release-group":
      return [
        "aliases", "artist-credit", "disambiguation", "last_updated", "primary-type",
        "primary-type-id", "ratings", "relations", "secondary-type-ids",
        "secondary-types", "secondary-types", "slug", "tags", "title"];
    case "url":
      return [];
    case "work":
      return [];
    default:
      break;
  }
}

const getEntityIncludes = type => {
  console.log(type);
  switch (type) {
    case "area":
      return [
        "aliases", "area-rels", "artist-rels", "event-rels", "genres",
        "label-rels", "place-rels", "ratings", "release-group-rels",
        "release-rels", "series-rels", "tags", "url-rels", "work-rels"];
    case "place":
      return [
        "aliases", "area-rels", "artist-rels", "event-rels", "genres",
        "label-rels", "place-rels", "recording-rels",
        "release-group-rels", "release-rels", "series-rels", "tags",
        "url-rels", "work-rels"];
    case "artist":
    case "event":
    case "label":
    case "release":
      return [
        "aliases", "area-rels", "artist-credits", "artist-rels", "event-rels", "genres",
        "label-rels", "place-rels", "ratings", "recording-rels", "release-groups", 
        "release-group-rels", "release-rels", "series-rels", "tags",
        "url-rels", "work-rels"];
    case "release-group":
      return [
        "aliases", "area-rels", , "artist-credits", "artist-rels", "event-rels", "genres",
        "label-rels", "place-rels", "ratings", "recording-rels",
        "release-group-rels", "release-rels", "series-rels", "tags",
        "url-rels", "work-rels"];
    default:
      break;
  }
}

const removeLastComma = str => {
  return str.replace(/,(\s+)?$/, '');
}
