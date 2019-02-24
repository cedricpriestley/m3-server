const async = require('async');
const util = require('util');
const request = util.promisify(require("request"));

async function search(query) {
  const urls = [
    `https://musicbrainz.org/ws/2/artist?limit=5&offset=0&fmt=json&query=${query}`,
    `https://musicbrainz.org/ws/2/release?limit=5&offset=0&fmt=json&query=${query}`,
    `https://musicbrainz.org/ws/2/recording?limit=5&offset=0&fmt=json&query=${query}`
  ];

  let results = [];
  let i = 0;

  for (var url in urls) {
    var options = {
      url: url,
      headers: {
        'User-Agent': 'm3 server 100.115.92.202'
      },
      json: true
    };

    results[i] = await request(options,
      function (err, res, body) {
      }
    );
    i++;
  }

  return results;
}

let query = 'Michael Jackson';

let results = search(query).then((results) => {
  console.log('hello');
});

//console.log(results);