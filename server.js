const express = require('express');
const billboard = require("billboard-top-100")
const app = express();
const mongo = require('mongodb');
const amazon = require('amazon-product-api');

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

app.route('/api/cats/:name').get((req, res) => {
  const requestedCatName = req.params['name'];
  res.send({ name: requestedCatName });
});

app.route('/api/artist/:mbid').get((req, res) => {
  const mbid = req.params['mbid'];
  const url = `https://musicbrainz.org/ws/2/artist/${mbid}?inc=aliases+tags+artist-rels+label-rels+url-rels+tags+release-groups&fmt=json`;

  // connect to mongodb and get artist document
  res.send({ name: 'My Fav Artist' });
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