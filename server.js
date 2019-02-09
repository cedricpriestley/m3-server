const express = require('express');
const billboard = require("billboard-top-100")
const app = express();
const mongo = require('mongodb');
const amazon = require('amazon-product-api');
const assert = require('assert');
const request = require('request');
const https = require('https');

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.listen(8000, () => {
  console.log('Server started!');
});

app.route('/api/charts/hot-100').get((req, res) => {
  //const requestedCatName = req.params['name'];

  // date format YYYY-MM-DD

  billboard.getChart('hot-100', '2019-01-26', function (err, chart) {
    if (err) {
      console.log(err);
      res.send({ 'error': err });
    }
    /*
    console.log(chart.week) // prints the week of the chart in the date format YYYY-MM-DD
    console.log(chart.previousWeek.url) // prints the URL of the previous week's chart
    console.log(chart.previousWeek.date) // prints the date of the previous week's chart in the date format YYYY-MM-DD
    console.log(chart.nextWeek.url) // prints the URL of the next week's chart
    console.log(chart.nextWeek.date) // prints the date of the next week's chart in the date format YYYY-MM-DD
    console.log(chart.songs); // prints array of top 100 songs for week of August 27, 2016
    console.log(chart.songs[3]); // prints song with rank: 4 for week of August 27, 2016
    console.log(chart.songs[0].title); // prints title of top song for week of August 27, 2016
    console.log(chart.songs[0].artist); // prints artist of top songs for week of August 27, 2016
    console.log(chart.songs[0].rank) // prints rank of top song (1) for week of August 27, 2016
    console.log(chart.songs[0].cover) // prints URL for Billboard cover image of top song for week of August 27, 2016
    */
    res.send({ chart });
  });
});

app.route('/api/charts/r-b-hip-hop-songs').get((req, res) => {
  //const requestedCatName = req.params['name'];

  // date format YYYY-MM-DD

  billboard.getChart('r-b-hip-hop-songs', '2019-01-26', function (err, chart) {
    if (err) {
      console.log(err);
      res.send({ 'error': err });
    }
    res.send({ chart });
  });
});

app.route('/api/charts/billboard-200').get((req, res) => {
  //const requestedCatName = req.params['name'];

  // date format YYYY-MM-DD

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

app.route('/api/artist/:id').get((req, res) => {
  const id = req.params['id'];

  getArtist(id, function (documents) {
    if (documents && documents.length == 1) {
      artist = documents[0];

      if (artist.last_update) {
        res.send(artist);
      } else {
        console.log(`${artist.name} is being imported`);
        let mbid = artist.gid;
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

          //var genderEnum = new Enum(['A', 'B', 'C'], { name: 'MyEnum' });

          let updateValues = {};

          let disambiguation = artist.disambiguation;
          if (disambiguation) {
            updateValues['disambiguation'] = disambiguation;
          }

          let sortName = artist['sort-name'];
          if (sortName) {
            updateValues['sort_name'] = sortName;
          }

          let gender = artist.gender == 'Male' ? 'm' : (artist.gender == 'Female' ? 'f' : null);
          if (gender) {
            updateValues['gender'] = gender;
          }

          updateValues['last_update'] = new Date();

          let document = [
            { _id: parseInt(id) },
            { $set: updateValues }];

          updateArtist([document], (res) => {
          });

          //getArtist(id, function (documents) {
          //getArtistCallback(documents);
          //});

          res.send(artist);
        });
      }
    }
  });
});

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

function getArtist(id, callback) {

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
    collection.find({ _id: parseInt(id) }).toArray(function (err, documents) {
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

function updateArtist(documents, callback) {
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