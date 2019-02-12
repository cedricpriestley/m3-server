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

const artistFields = [
  'name',
  'sort-name',
  'gender-id',
  'gender',
  'isnis',
  'type',
  'country',
  'relations',
  'disambiguation',
  'end_area',
  'type-id',
  'type',
  'area',
  'life-span',
  'aliases',
  'tags',
  'begin_area',
  'last_updated',
  'slug'
];

app.use((req, res, next) => {
  //console.log('made it here 1');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.listen(8000, () => {
  console.log('Server started!');
});

app.route('/api/artist/browse/:offset/:count').get((req, res) => {
  const offset = req.params['offset'];
  const count = req.params['count'];

  browseArtists(offset, count, (documents) => {
    if (documents && documents.length >= 0) {
      res.send(documents);
    }
  });
});

app.route('/api/artist/count').get((req, res) => {
  if (app.get('artistCount')) {
    let count = app.get('artistCount');
    res.send([{ count }]);
  } else {
    getArtistCount((count) => {
      //if (typeof count == Number) {
      app.set('artistCount', count);
      res.send([{ count }]);
      // }
    });
  }
});

app.route('/api/artist/reset/:id').get((req, res) => {
  const id = req.params['id'];
  resetArtist(id, () => {
    getArtist(id, (documents) => {
      if (documents && documents.length == 1) {
        artist = documents[0];
        res.send(artist);
      }
    });
  });
});

app.route('/api/artist/import/:id').get((req, res) => {
  const id = req.params['id'];
  getArtist(id, (documents) => {
    if (documents && documents.length == 1) {
      artist = documents[0];

      importArtist(artist.id, artist.name, (importedArtist) => {
        res.send(importedArtist);
      });
    }
  });
});

app.route('/api/artist/search/:term/:offset/:count').get((req, res) => {
  const term = req.params['term'];
  const offset = req.params['offset'];
  const count = req.params['count'];

  searchArtist(term, offset, count, (documents) => {
    res.send(documents);
  });
});

app.route('/api/artist/:id').get((req, res) => {
  const id = req.params['id'];
  getArtist(id, (documents) => {
    if (documents && documents.length == 1) {
      artist = documents[0];

      let autoImport = config.get('general.import.autoImport');
      if (autoImport) {
        importArtist(artist.id, artist.name, (importedArtist) => {
          res.send(importedArtist);
        });
      } else {
        res.send(artist);
      }
    }
  });
});

app.route('/api/amazon/:asin').get((req, res) => {
  var asin = req.param['asin'];
  asin = "B0000029GA";
  //console.log(asin);
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
    //console.log(results);
    res.send(JSON.stringify(results));
  }).catch((err) => {
    //console.log(err);
    res.send(JSON.stringify(err));
  });
});

app.route('/api/charts/hot-100').get((req, res) => {
  billboard.getChart('hot-100', '2019-01-26', (err, chart) => {
    if (err) {
      console.log(err);
      res.send({ 'error': err });
    }
    res.send({ chart });
  });
});

app.route('/api/charts/r-b-hip-hop-songs').get((req, res) => {
  billboard.getChart('r-b-hip-hop-songs', '2019-01-26', (err, chart) => {
    if (err) {
      console.log(err);
      res.send({ 'error': err });
    }
    res.send({ chart });
  });
});

app.route('/api/charts/billboard-200').get((req, res) => {
  billboard.getChart('billboard-200', '2019-01-26', (err, chart) => {
    if (err) {
      console.log(err);
      res.send({ 'error': err });
    }
    res.send({ chart });
  });
});

app.route('/api/charts/artist-100').get((req, res) => {
  billboard.getChart('artist-100', '2019-01-26', (err, chart) => {
    if (err) {
      console.log(err);
      res.send({ 'error': err });
    }
    res.send({ chart });
  });
});

app.route('/api/charts/list').get((req, res) => {
  var listCharts = require('billboard-top-100').listCharts;

  listCharts((err, charts) => {
    if (err) {
      console.log(err);
      res.send({});
    }
    console.log(charts);
  });
});

var importArtist = (id, name, callback) => {
  console.log(`${name} is being imported`);
  let mbid = id;
  const mburl = `https://musicbrainz.org/ws/2/artist/${mbid}?inc=aliases+tags+artist-rels+label-rels+url-rels+tags&fmt=json`;

  var options = {
    url: mburl,
    headers: {
      'User-Agent': 'm3 server 100.115.92.202'
    },
    json: true
  };

  request(options, (err, res2, artist) => {
    if (err) { return console.log(err); }

    let updateValues = {};

    artistFields.forEach((field) => {
      if (field != 'tags' || field != 'slug') {
        if (eval("artist['" + field + "']")) {
          updateValues[field] = eval("artist['" + field + "']");
        }
      }
    });

    if (artist.tags) {
      updateValues['tags'] = [];
      artist.tags.forEach((tag) => {
        if (tag.count > 0) {
          updateValues['tags'].push({ name: tag.name, count: tag.count });
        }
      });
    }

    // remove *+~.()'"!:@/\ from slug
    let slug = artist.name + ((artist.disambiguation)
      ? '-' + (artist.disambiguation) : '').replace(/\//g, '-');

    updateValues['slug'] =
      slugify(slug, { remove: /[*+~.()\'"!:@]/g }).toLowerCase();

    updateValues['last_updated'] = new Date();

    let document = [
      { id: mbid },
      { $set: updateValues }];

    updateArtists([document], (result) => {
      if (useMbJson) {
        callback(artist);
      } else {
        getArtist(mbid, (documents) => {
          if (documents && documents.length == 1) {
            artist = documents[0];
            callback(artist);
          }
        });
      }
    });
  });
}

var getArtist = (id, callback) => {

  const MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(mongodbUrl, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(mongodbName);

    collection = db.collection("artist");
    collection.find({ id: id }).toArray((err, documents) => {
      //assert.equal(err, null);
      callback(documents);
    });

    client.close();
  });
}

var getArtistCount = (callback) => {
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

var updateArtists = (documents, callback) => {
  if (documents.length == 0) return;

  const MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(mongodbUrl, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);

    const db = client.db(mongodbName);
    const collection = db.collection('artist');

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

var resetArtist = (id, callback) => {

  const MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(mongodbUrl, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);

    const db = client.db(mongodbName);
    const collection = db.collection('artist');

    let unsetValues = {};
    artistFields.forEach((field) => {
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

function removeLastComma(str) {
  return str.replace(/,(\s+)?$/, '');
}