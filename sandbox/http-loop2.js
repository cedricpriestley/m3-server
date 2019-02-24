const async = require('async');
const util = require('util');
const request = util.promisify(require("request"));

var httpGet = async (url) => {

  const options = {
    url: url,
    headers: {
      'User-Agent': 'm3 server 100.115.92.202'
    },
    json: true
  };

  await request(options,
    function (err, res, body) {
      //callback(err, body);
      console.log(body);
      return body;
    }
  );
}


const search = (query) => {
  let results = [];
  let urls = [
    `https://musicbrainz.org/ws/2/artist?limit=5&offset=0&fmt=json&query=${query}`,
    `https://musicbrainz.org/ws/2/release?limit=5&offset=0&fmt=json&query=${query}`,
    `https://musicbrainz.org/ws/2/recording?limit=5&offset=0&fmt=json&query=${query}`
  ];

  httpGet(urls[0]);
  httpGet(urls[1]);
  httpGet(urls[2]);
  //return results;
}

search('Michael Jackson');