const util = require('util');
const request = util.promisify(require("request"));
const Promise = require("bluebird");

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
        let imageUlr = '';
        for (const image of artist['image']) {
          if (image['size'] === 'mega') {
            document['image'] = image['#text'];
          }
        }

        let similarArtists = [];
        for (artist of artist['similar']['artist']) {
          similarArtists.push(artist['name']);
        }

      }
    })
    .then(results => {
      console.log(results);
      // document['similar_artists'] = [];
      // for (const similarArtist of artist['similar']['artist']) {
      //   let imageUrl = '';
      //   let mbid = similarArtist['mbid'];
      //   let name = similarArtist['name'];

      //   if (similarArtist['image']) {
      //     for (const image of similarArtist['image']) {
      //       //_searchLastFMArtist(name, 'artist');
      //       var options = _buildLastFMSearchUrl(name, 'artist');
      //       request(options)
      //         .then(results => {
      //           if (results['body']['artist']) {
      //             mbid = artist['mbid'];
      //           }
      //         });
      //       if (image['size'] === 'mega') {
      //         imageUrl = image['#text']
      //       }
      //     }
      //   }
      //   document['similar_artists'].push({
      //     name: name,
      //     image_url: imageUrl
      //   });
      // }
      // //console.log(document);
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

// var _searchLastFMArtist = (name, type) => {
//   var options = _buildLastFMSearchUrl(name, type);
//   request(options, (err, res, entity) => {
//     if (err) {
//       console.log(name, err);
//       callback(null);
//     }
//     if ((entity &&
//       entity['error']
//       && entity['message'])
//       && !entity['artist']) {
//       console.log(name, entity['message']);
//     }

//     callback(entity['artist']['mbid']);
//   });
// };

_updateLastFMArtist('5b11f4ce-a62d-471e-81fc-a69a8278c7da');