var Promise = require("bluebird");
var http = require("http");
const util = require('util');
const request = util.promisify(require("request"));

var _buildLastFMSearchUrl = (name, type) => {
  const url = `http://ws.audioscrobbler.com/2.0/?method=${type}.getinfo&${type}=${name}&api_key=e1182eaac16ae88fec850af3a0e7ab19&format=json`;
  var options = {
    url: url,
    headers: {
      'User-Agent': 'm3 server 100.115.92.202'
    },
    json: true
  };

  return options;
}

function _getLastFMSimilarArtists(similarArtists) {
  return Promise.try(function () {
    //similarArtists.reverse();
    let name = similarArtists[similarArtists.length - 1];
    //console.log(name)
    //let url = `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${name}&api_key=e1182eaac16ae88fec850af3a0e7ab19&format=json`;
    let options = _buildLastFMSearchUrl(name, 'artist');
    //console.log(options);
    return request(options);
  }).then(function (response) {
    //console.log(response.body);
    similarArtists.pop();
    //console.log(similarArtists);
    if (similarArtists.length > 0) {
      //console.log(response.body);
      return Promise.try(function () {
        return _getLastFMSimilarArtists(similarArtists);
      }).then(function (recursiveResults) {
        if (response.body.artist.mbid) {
          return [response.body.artist.mbid].concat(recursiveResults);
        } else {
          return;
        }
      });
    } else {
      // Done looping
      if (response.body.artist.mbid) {
        return [response.body.artist.mbid];
      } else {
        return;
      }
    }
  });
}

Promise.try(function () {
  similarArtists = ['nas', 'mobb deep', 'AZ', 'Foxy Brown', 'Raekwon'];
  return _getLastFMSimilarArtists(similarArtists);
}).then(function (results) {
  // Now `results` is an array that contains the response for each HTTP request made.
  console.log(results);
})