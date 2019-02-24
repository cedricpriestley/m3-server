var query = 'Michael+Jackson';
var http = require('http');
var urls = [
  `https://musicbrainz.org/ws/2/artist?limit=5&offset=0&fmt=json&query=${query}`,
//  `https://musicbrainz.org/ws/2/release?limit=5&offset=0&fmt=json&query=${query}`
];
var completed_requests = 0;

urls.forEach(function (url) {
console.log(url);  
  var responses = [];

  var options = {
    url: url,
    headers: {
      'User-Agent': 'm3 server 100.115.92.202'
    },
    json: true
  };

  http.get(options, function (res) {
    res.on('data', function (chunk) {
      responses.push(chunk);
    });

    res.on('end', function () {
      if (completed_requests++ == urls.length - 1) {
        // All downloads are completed
        console.log('body:', responses.join());
      }
    });
  });
  var hello = "Hello World";
  //setTimeout(() => { console.log(hello) }, 1000);
})