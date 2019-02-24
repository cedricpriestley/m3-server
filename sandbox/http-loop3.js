const request = require('request');
const query = 'Michael Jackson'
const urls = [
  `https://musicbrainz.org/ws/2/artist?limit=5&offset=0&fmt=json&query=${query}`,
  `https://musicbrainz.org/ws/2/release?limit=5&offset=0&fmt=json&query=${query}`,
  `https://musicbrainz.org/ws/2/recording?limit=5&offset=0&fmt=json&query=${query}`
];
const totalSearchResults = [];
for (let url in urls) {

  const options = {
    url: url,
    headers: {
      'User-Agent': 'm3 server 100.115.92.202'
    },
    json: true
  };

  await request(options,
    function (err, res, body) {
      callback(err, body);
    });
  totalSearchResults.push(url + 1)
}