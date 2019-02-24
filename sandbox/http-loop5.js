const async = require('async');
const util = require('util');
const request = util.promisify(require("request"));

const search = async (query, callback) => {
  var results = [];
  var urls = [
    `https://musicbrainz.org/ws/2/artist?limit=5&offset=0&fmt=json&query=${query}`,
    `https://musicbrainz.org/ws/2/release?limit=5&offset=0&fmt=json&query=${query}`,
    `https://musicbrainz.org/ws/2/recording?limit=5&offset=0&fmt=json&query=${query}`
  ];

  for (var url in urls) {
    var options = {
      url: url,
      headers: {
        'User-Agent': 'm3 server 100.115.92.202'
      },
      json: true
    };

    const response = await request(options,
      function (err, res, body) {
        return body;
        //console.log(body);
        results.push(body);;
      }
    );

    console.log(response);
    //return results;
  }

  //async.map(urls, httpGet, function (err, res) {

    //if (err) return console.log(err);

  //});
}

console.log(search('Michael Jackson'), (res) => {
  //console.log(res);
});