// SEQUENTIAL REQUESTS
var http = require('http')

function sequentialRequest(count){

  let query = 'Michael+Jackson';
  
  let urls = [
    `https://musicbrainz.org/ws/2/artist?limit=5&offset=0&fmt=json&query=${query}`,
    `https://musicbrainz.org/ws/2/release?limit=5&offset=0&fmt=json&query=${query}`,
    `https://musicbrainz.org/ws/2/recording?limit=5&offset=0&fmt=json&query=${query}`
  ];
  if (count == undefined) {count = 0}
  count++
  if (count > 3) {return}
    var request = {
      hostname: urls[count],
      headers: {'User-Agent': 'm3 server 100.115.92.202'},
      //path: '/delay/.'+  Math.floor(Math.random() * (5 - 1 + 1)) + 1
    }
    http.get(request, (res) => {
        var body = ''
        res.on('data', function (chunk) {
          body += chunk
        })
        res.on('end', function () {
          console.log(JSON.parse(body))
          sequentialRequest(count)
        })
    }).end()
}

console.log("Running sequential requests!")
sequentialRequest()
