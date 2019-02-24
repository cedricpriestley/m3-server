const billboard = require("billboard-top-100");

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