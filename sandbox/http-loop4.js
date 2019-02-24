const request = require('request');

function search(callback) {

  let query = 'Michael Jackson';
  let url = `https://musicbrainz.org/ws/2/artist?limit=5&offset=0&fmt=json&query=${query}`;
  let options = {
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
};

var myResults = search(function (err, res) {
  console.log(res);
  
});

console.log(myResults);