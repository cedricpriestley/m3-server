const express = require('express');
const billboard = require("billboard-top-100");
const app = express();
const mongo = require('mongodb');
const amazon = require('amazon-product-api');
const assert = require('assert');
const request = require('request');
const Enum = require('./enums');
const config = require('config');

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.listen(8000, () => {
  console.log('Server started!');
});

app.route('/api/charts/hot-100').get((req, res) => {
  billboard.getChart('hot-100', '2019-01-26', function (err, chart) {
    if (err) {
      console.log(err);
      res.send({ 'error': err });
    }
    res.send({ chart });
  });
});

app.route('/api/charts/r-b-hip-hop-songs').get((req, res) => {

  billboard.getChart('r-b-hip-hop-songs', '2019-01-26', function (err, chart) {
    if (err) {
      console.log(err);
      res.send({ 'error': err });
    }
    res.send({ chart });
  });
});

app.route('/api/charts/billboard-200').get((req, res) => {

  billboard.getChart('billboard-200', '2019-01-26', function (err, chart) {
    if (err) {
      console.log(err);
      res.send({ 'error': err });
    }
    res.send({ chart });
  });
});

app.route('/api/charts/artist-100').get((req, res) => {

  // date format YYYY-MM-DD

  billboard.getChart('artist-100', '2019-01-26', function (err, chart) {
    if (err) {
      console.log(err);
      res.send({ 'error': err });
    }
    res.send({ chart });
  });
});

app.route('/api/charts/list').get((req, res) => {
  var listCharts = require('billboard-top-100').listCharts;

  listCharts(function (err, charts) {
    if (err) {
      console.log(err);
      res.send({});
    }
    console.log(charts); // prints array of all charts
  });
});


app.route('/api/artist/reset/:gid').get((req, res) => {
  const gid = req.params['gid'];
  console.log('hello');
  resetArtist(gid, () => {
    getArtist(gid, (documents) => {
      if (documents && documents.length == 1) {
        artist = documents[0];
        res.send(artist);
      }
    });
  });
});

app.route('/api/artist/import/:gid').get((req, res) => {
  const gid = req.params['gid'];
  getArtist(gid, function (documents) {
    if (documents && documents.length == 1) {
      artist = documents[0];

      importArtist(artist.gid, artist.name, (importedArtist) => {
        res.send(importedArtist);
      });
    }
  });
});

app.route('/api/artist/:gid').get((req, res) => {
  const gid = req.params['gid'];
  getArtist(gid, function (documents) {
    if (documents && documents.length == 1) {
      artist = documents[0];

      let autoImport = config.get('general.import.autoImport');
      if (autoImport) {
        importArtist(artist.gid, artist.name, (importedArtist) => {
          res.send(importedArtist);
        });
      } else {
        res.send(artist);
      }
    }
  });
});


function importArtist(gid, name, callback) {
  console.log(`${name} is being imported`);
  let mbid = gid;
  const mburl = `https://musicbrainz.org/ws/2/artist/${mbid}?inc=aliases+tags+artist-rels+label-rels+url-rels+tags+release-groups&fmt=json`;

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

    let disambiguation = artist.disambiguation;
    if (disambiguation) {
      updateValues['disambiguation'] = disambiguation;
    }

    let sortName = artist['sort-name'];
    if (sortName) {
      updateValues['sort_name'] = sortName;
    }

    if (artist['gender-id']) {
      updateValues['gender'] = Enum.Gender.get(artist['gender-id']).value;
    }

    if (artist['type-id']) {
      updateValues['type'] = Enum.ArtistType.get(artist['type-id']).value;
    }

    updateValues['tags'] = [];
    artist.tags.forEach((tag) => {
      if (tag.count > 0) {
        updateValues['tags'].push(tag.name);
      }
    });

    updateValues['last_update'] = new Date();

    let document = [
      { gid: mbid },
      { $set: updateValues }];

    updateArtists([document], (result) => {
      getArtist(mbid, (documents) => {
        if (documents && documents.length == 1) {
          artist = documents[0];
          callback(artist);
        }
      })
    });
  });
}
//app.route('/api/search/artist').get((req, res) => {
//const term = req.params['term'];
//res.send({ term: term });
//});

app.route('/api/search/artist/:term/:offset/:count').get((req, res) => {
  const term = req.params['term'];
  const offset = req.params['offset'];
  const count = req.params['count'];

  searchArtist(term, function (documents) {
    res.send(documents);
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
  }).then(function (results) {
    //console.log(results);
    res.send(JSON.stringify(results));
  }).catch(function (err) {
    //console.log(err);
    res.send(JSON.stringify(err));
  });
});

function getArtist(gid, callback) {

  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');

  // Connection URL
  const url = 'mongodb://localhost:27017';

  // Database Name
  const dbName = 'm3db';

  // Use connect method to connect to the server
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    collection = db.collection("artist");
    collection.find({ gid: gid }).toArray(function (err, documents) {
      //assert.equal(err, null);
      callback(documents);
    });

    client.close();
  });
}

function searchArtist(term, callback) {

  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');

  // Connection URL
  const url = 'mongodb://localhost:27017';

  // Database Name
  const dbName = 'm3db';

  // Use connect method to connect to the server
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    collection = db.collection("artist");
    term = '"' + term + '"';

    collection.find({ $text: { $search: term, $caseSensitive: false } }).toArray(function (err, documents) {
      //assert.equal(err, null);
      callback(documents);
    });

    client.close();
  });
}

function updateArtists(documents, callback) {
  if (documents.length == 0) return;

  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');

  // Connection URL
  const url = 'mongodb://localhost:27017';

  // Database Name
  const dbName = 'm3db';
  const collectionName = 'artist';

  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    assert.equal(null, err);

    const db = client.db('m3db');
    const collection = db.collection(collectionName);

    documents.forEach(function (document) {
      collection.updateOne(
        document[0], document[1]
        , function (err, result) {
          //console.log(`Updated ${documents.length} documents in the collection`);
          callback(result);
        });
    });
    client.close();
  });
}

function resetArtist(gid, callback) {

  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');

  // Connection URL
  const url = 'mongodb://localhost:27017';

  // Database Name
  const dbName = 'm3db';
  const collectionName = 'artist';

  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    assert.equal(null, err);

    const db = client.db('m3db');
    const collection = db.collection(collectionName);

    collection.updateOne(
      { gid: gid },
      {
        $unset: {
          last_update: '',
          tags: '',
          gender: '',
          sort_name: '',
          type: ''
        }
      }
      , function (err, result) {
        //console.log(`Resetted ${documents.length} documents in the collection`);
        callback();
      });
    client.close();
  });
}