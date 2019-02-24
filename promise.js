var Promise = require("bluebird");
const util = require('util');
const request = util.promisify(require("request"));

function _searchLastFMArtist(similarArtists) {
  return Promise.try(function () {
    //similarArtists.reverse();
    let name = similarArtists[similarArtists.length - 1];
    let options = _buildLastFMSearchUrl(name, 'artist');
    return request(options);
  }).then(function (response) {
    similarArtists.pop();
    if (similarArtists.length > 0) {
      return Promise.try(function () {
        return _searchLastFMArtist(similarArtists);
      }).then(function (recursiveResults) {
        if (response.body.artist.mbid) {
          return [response.body.artist].concat(recursiveResults);
        } else {
          return;
        }
      });
    } else {
      // Done looping
      if (response.body.artist.mbid) {
        return [response.body.artist];
      } else {
        return;
      }
    }
  });
}

var _updateLastFMArtist = (id) => {
  var options = _buildLastFMLookupUrl(id, 'artist');

  request(options)
    .then(results => {
      if (results['body']['error']) {
        console.log(results['body']['message']);
      }
      if (results['body']['artist']) {
        let document = {};
        let artist = results['body']['artist'];
        let name = artist['name'];
        let imageUrl = '';
        for (const image of artist['image']) {
          if (image['size'] === 'mega') {
            document['image_url'] = image['#text'];
          }
        }

        let similarArtists = [];
        document['similar_artists'] = [];
        for (artist of artist['similar']['artist']) {
          similarArtists.push(artist['name']);
        }

        Promise.try(function () {
          //similarArtists = ['nas', 'mobb deep', 'AZ', 'Foxy Brown', 'Raekwon'];
          return _searchLastFMArtist(similarArtists);
        }).then(function (results) {
          // Now `results` is an array that contains the response for each HTTP request made.
          //console.log(results);
          for (artist of results) {
            let name = artist['name'];
            let mbid = artist['mbid']
            let imageUrl = '';
            for (const image of artist['image']) {
              if (image['size'] === 'mega') {
                imageUrl = image['#text'];
              }
            }
            document['similar_artists'].push({
              name: name,
              image_url: imageUrl,
              mbid: mbid
            });
          }
          console.log(document);
        })
      }
    })
    .catch(err => {
      console.log(err);
    });
};

var _buildLastFMLookupUrl = (mbid, type) => {
  const url = `http://ws.audioscrobbler.com/2.0/?method=${type}.getinfo&mbid=${mbid}&format=json&api_key=e1182eaac16ae88fec850af3a0e7ab19&format=json`;

  var options = {
    url: url,
    headers: {
      'User-Agent': 'm3 server 100.115.92.202'
    },
    json: true
  };

  return options;
}

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

_updateLastFMArtist('5b11f4ce-a62d-471e-81fc-a69a8278c7da');