const async = require('async');
const request = require('request');

/*
function httpGet(url, callback) {
  const options = {
    url: url,
    headers: {
      'User-Agent': 'm3 server 100.115.92.202'
    },
    json: true
  };

  request(options,
    function (err, res, body) {
      callback(err, body);
    }
  );
}


let query = 'Michael Jackson';

const search = (query) => {
  let urls = [
    `https://musicbrainz.org/ws/2/artist?limit=5&offset=0&fmt=json&query=${query}`,
    `https://musicbrainz.org/ws/2/release?limit=5&offset=0&fmt=json&query=${query}`,
    `https://musicbrainz.org/ws/2/recording?limit=5&offset=0&fmt=json&query=${query}`
  ];

  async.map(urls, httpGet, function (err, res) {

    if (err) return console.log(err);

    console.log(res);
  });
}

search();

let urls = [
  `https://musicbrainz.org/ws/2/artist?limit=5&offset=0&fmt=json&query=${query}`,
  `https://musicbrainz.org/ws/2/release?limit=5&offset=0&fmt=json&query=${query}`,
  `https://musicbrainz.org/ws/2/recording?limit=5&offset=0&fmt=json&query=${query}`
];

for (url in urls) {
  let options = {
    url: url,
    headers: {
      'User-Agent': 'm3 server 100.115.92.202'
    },
    json: true
  };

  request(options,
    function (err, res, body) {
      console.log(body);
    }
  );
}
*/



function search(url, callback) {
  request({
    url: url,
    json: true
  }, function (error, response, body) {
    // some code...
    //if (!error && response.statusCode === 200) {
      // some code    
      callback(body);
    //}
  })
}

let query = 'Michael Jackson';
let urls = [
  `https://musicbrainz.org/ws/2/artist?limit=5&offset=0&fmt=json&query=${query}`,
  `https://musicbrainz.org/ws/2/release?limit=5&offset=0&fmt=json&query=${query}`,
  `https://musicbrainz.org/ws/2/recording?limit=5&offset=0&fmt=json&query=${query}`
];

for (url in urls) {
  search(url, (res) => {
    console.log(res);
  })
}