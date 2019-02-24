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