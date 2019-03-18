//import { Area, AreaType, AreaAliasType } from './models/area';
const Area = require('./models/area');
const Artist = require('./models/artist');
const Label = require('./models/label');
const ReleaseGroup = require('./models/release-group');
const Release = require('./models/release');
//const Area = require('./schema');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');

//const validator = require('validator');

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

module.exports = {
  getAreas: async (args, obj, context, info) => { // the args object contains the GraphQL-parameters of the function
    // do the database stuff
    const limit = args.limit || '10';
    const offset = args.offset || '0';

    const areas = Area.find({
      "name": {
        $ne: null
      }
    })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({
        name: 1
      })
      .exec();

    if (!areas) {
      throw new Error('error');
    }

    return areas;
  },
  resetArea: async (args, obj, context, info) => {
    const id = args.id;

    let area = Area.find({
      id: id
    });

    if (area) {
      for (const key in area) {
        if (key != '_id' && key != 'id' && key != 'slug') {
          unsetValues[key] = '';
        }
      }
    }

    area.updateOne({
      id: document['id']
    }, {
        $unset: unsetValues
      }, (err, result) => { });
  },
  getArea: (obj, args, context, info) => {
    const id = args.id;

    let area = Area.find({
      id: id
    });

    return area;
  },
  getArtist: async (obj, args, context, info) => {
    const mbid = obj.mbid;

    let artist;
    const result = Artist.findOne({
      mbid: mbid
    })
      .then(result => {
        artist = result;
      });

    await result;

    if (artist) {
      return {
        _id: artist._id.toString(),
        mbid: artist.mbid,
        name: artist.name,
        slug: artist.slug,
        sortName: artist.sortName,
        disambiguation: artist.disambiguation,
        country: artist.country,
        type: artist.type,
        typeID: artist.typeID,
        rating: artist.rating,
        gender: artist.gender,
        genderID: artist.genderID,
        lifeSpan: artist.lifeSpan,
        area: artist.area,
        beginArea: artist.beginArea,
        endArea: artist.endArea,
        slug: artist.slug,
        aliases: artist.aliases,
        tags: artist.tags,
        relationships: artist.relationships,
        discogs: artist.discogs,
        lastUpdated: artist.lastUpdated,
        lastFM: artist.lastFM
      };
    }
  },
  createArea: async function (obj, args, context, info) {
    // const mbid = areaInput.mbid
    console.log(obj);
    return;

    const existingArea = await Area.findOne({
      mbid: areaInput.mbid
    });
    if (existingArea) {
      //const error = new Error("Area exists already!");
      //throw error;
    } else {
      //updateMbzArea({ areaInput }, req)
    }

    const errors = [];

    //if (!validator.isEmail(userInput.email)) {
    //errors.push({ message: 'E-Mail is invalid.' });
    //}

    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    var date = new Date();

    const area = new Area({
      mbid: areaInput.mbid,
      name: areaInput.name,
      updatedDate: date
    });

    const createdArea = await area.save();
    return {
      ...createdArea._doc,
      _id: createdArea._id.toString()
    };
  },
  saveArtist: async function (obj, args, context, info) {

    if (!obj.data) return;

    let document = JSON.parse(obj.data);

    if (!document) return;

    let mbid = document.mbid;

    if (!document) return;

    const errors = [];

    //if (!validator.isEmail(userInput.email)) {
    //errors.push({ message: 'E-Mail is invalid.' });
    //}

    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    let slug = ((document.name) ? document.name : document.title) + ((document.disambiguation) ?
      '-' + (document.disambiguation) : '').replace(/\//g, '-');

    document['slug'] = "artist/" +
      slugify(slug, {
        remove: /[*+~.()\'"!:@]/g
      }).toLowerCase();

    document['lastUpdated'] = new Date();

    const existingArtist = await Artist.findOne({
      mbid: mbid
    });

    if (existingArtist) {
      return {
        _id: existingArtist._id.toString(),
        mbid: existingArtist.mbid,
        name: existingArtist.name,
        slug: existingArtist.slug,
        sortName: existingArtist.sortName,
        disambiguation: existingArtist.disambiguation,
        country: existingArtist.country,
        type: existingArtist.type,
        typeID: existingArtist.typeID,
        rating: existingArtist.rating,
        gender: existingArtist.gender,
        genderID: existingArtist.genderID,
        lifeSpan: existingArtist.lifeSpan,
        area: existingArtist.area,
        beginArea: existingArtist.beginArea,
        endArea: existingArtist.endArea,
        slug: existingArtist.slug,
        aliases: existingArtist.aliases,
        tags: existingArtist.tags,
        relationships: existingArtist.relationships,
        discogs: existingArtist.discogs,
        lastUpdated: existingArtist.lastUpdated,
        lastFM: existingArtist.lastFM,
        ...existingArtist
      };
      //const error = new Error("Area exists already!");
      //throw error;
    } else {
      //updateMbzArea({ areaInput }, req)  

      if (document.relationships.areas.nodes.length > 0) {
        for (let node of document.relationships.areas.nodes) {
          let relationType = camelize(node.type);
          delete node.type;

          if (!document.relationships.areas[relationType]) {
            document.relationships.areas[relationType] = [];
          }

          document.relationships.areas[relationType].push(node);
        }
        delete document.relationships.areas.nodes;
      }

      if (document.relationships.artists.nodes.length > 0) {
        let i = 0;
        for (let node of document.relationships.artists.nodes) {
          let relationType = camelize(node.type);
          delete node.type;

          if (!document.relationships.artists[relationType]) {
            document.relationships.artists[relationType] = [];
          }

          //document.relationships.artists[relationType].push(node);
          document.relationships.artists[relationType][i] = node;
        }
        delete document.relationships.artists.nodes;
      }

      if (document.relationships.events.nodes.length > 0) {
        for (let node of document.relationships.events.nodes) {
          let relationType = camelize(node.type);
          delete node.type;

          if (!document.relationships.events[relationType]) {
            document.relationships.events[relationType] = [];
          }

          document.relationships.events[relationType].push(node);
        }
        delete document.relationships.events.nodes;
      }

      if (document.relationships.instruments.nodes.length > 0) {
        for (let node of document.relationships.instruments.nodes) {
          let relationType = camelize(node.type);
          delete node.type;

          if (!document.relationships.instruments[relationType]) {
            document.relationships.instruments[relationType] = [];
          }

          document.relationships.instruments[relationType].push(node);
        }
        delete document.relationships.instruments.nodes;
      }

      if (document.relationships.labels.nodes.length > 0) {
        for (let node of document.relationships.labels.nodes) {
          let relationType = camelize(node.type);
          delete node.type;

          if (!document.relationships.labels[relationType]) {
            document.relationships.labels[relationType] = [];
          }

          document.relationships.labels[relationType].push(node);
        }
        delete document.relationships.labels.nodes;
      }

      if (document.relationships.places.nodes.length > 0) {
        for (let node of document.relationships.places.nodes) {
          let relationType = camelize(node.type);
          delete node.type;

          if (!document.relationships.places[relationType]) {
            document.relationships.places[relationType] = [];
          }

          document.relationships.places[relationType].push(node);
        }
        delete document.relationships.places.nodes;
      }

      if (document.relationships.recordings.nodes.length > 0) {
        for (let node of document.relationships.recordings.nodes) {
          let relationType = camelize(node.type);
          delete node.type;

          if (!document.relationships.recordings[relationType]) {
            document.relationships.recordings[relationType] = [];
          }

          document.relationships.recordings[relationType].push(node);
        }
        delete document.relationships.recordings.nodes;
      }

      if (document.relationships.releases.nodes.length > 0) {
        for (let node of document.relationships.releases.nodes) {
          let relationType = camelize(node.type);
          delete node.type;

          if (!document.relationships.releases[relationType]) {
            document.relationships.releases[relationType] = [];
          }

          document.relationships.releases[relationType].push(node);
        }
        delete document.relationships.releases.nodes;
      }

      if (document.relationships.releaseGroups.nodes.length > 0) {
        let i = 0;
        for (let node of document.relationships.releaseGroups.nodes) {
          let relationType = camelize(node.type);
          delete node.type;

          if (!document.relationships.releaseGroups[relationType]) {
            document.relationships.releaseGroups[relationType] = [];
          }

          document.relationships.releaseGroups[relationType][i] = ['node.direction'];
          i++;
        }
        delete document.relationships.releaseGroups.nodes;
      }

      if (document.relationships.series.nodes.length > 0) {
        for (let node of document.relationships.series.nodes) {
          let relationType = camelize(node.type);
          delete node.type;

          if (!document.relationships.series[relationType]) {
            document.relationships.series[relationType] = [];
          }

          document.relationships.series[relationType].push(node);
        }
        delete document.relationships.series.nodes;
      }

      if (document.relationships.works.nodes.length > 0) {
        for (let node of document.relationships.works.nodes) {
          let relationType = camelize(node.type);
          delete node.type;

          if (!document.relationships.works[relationType]) {
            document.relationships.works[relationType] = [];
          }

          document.relationships.works[relationType].push(node);
        }
        delete document.relationships.works.nodes;
      }

      if (document.relationships.urls.nodes.length > 0) {
        for (let node of document.relationships.urls.nodes) {
          let relationType = camelize(node.type);
          delete node.type;

          if (!document.relationships.urls[relationType]) {
            document.relationships.urls[relationType] = [];
          }

          document.relationships.urls[relationType].push(node);
        }
        delete document.relationships.urls.nodes;
      }

      if (document.relationships.placeHolder) {
        delete document.relationships.placeHolder;
      }

      if (document.area && document.area.relationships.areas.nodes.length === 1) {
        document.area.area =
          document.area.relationships.areas.nodes[0].target;
        delete document.area.relationships;

        if (document.area.area.relationships.areas.nodes.length === 1) {
          document.area.area.area =
            document.area.area.relationships.areas.nodes[0].target;
          delete document.area.area.relationships;

          if (document.area.area.area.relationships.areas.nodes.length === 1) {
            document.area.area.area.area =
              document.area.area.area.relationships.areas.nodes[0].target;
            delete document.area.area.area.relationships;
            delete document.area.area.area.area.relationships;
          }
        }
      }

      if (document.beginArea && document.beginArea.relationships.areas.nodes.length === 1) {
        document.beginArea.area =
          document.beginArea.relationships.areas.nodes[0].target;
        delete document.beginArea.relationships;

        if (document.beginArea.area.relationships.areas.nodes.length === 1) {
          document.beginArea.area.area =
            document.beginArea.area.relationships.areas.nodes[0].target;
          delete document.beginArea.area.relationships;

          if (document.beginArea.area.area.relationships.areas.nodes.length === 1) {
            document.beginArea.area.area.area =
              document.beginArea.area.area.relationships.areas.nodes[0].target;
            delete document.beginArea.area.area.relationships;
            delete document.beginArea.area.area.area.relationships;
          }
        }
      }

      if (document.endArea && document.endArea.relationships.areas.nodes.length === 1) {
        document.endArea.area =
          document.endArea.relationships.areas.nodes[0].target;
        delete document.endArea.relationships;

        if (document.endArea.area.relationships.areas.nodes.length === 1) {
          document.endArea.area.area =
            document.endArea.area.relationships.areas.nodes[0].target;
          delete document.endArea.area.relationships;

          if (document.endArea.area.area.relationships.areas.nodes.length === 1) {
            document.endArea.area.area.area =
              document.endArea.area.area.relationships.areas.nodes[0].target;
            delete document.endArea.area.area.relationships;
            delete document.endArea.area.area.area.relationships;
          }
        }
      }

      let tags = [];
      for (let tag of document.tags.nodes) {
        if (tag.count > 0) {
          tags.push(tag);
        }
      }
      document.tags = tags;

      let similarArtists = [];
      for (let similarArtist of document.lastFM.similarArtists.nodes) {
        similarArtists.push(similarArtist);
      }
      document.lastFM.similarArtists = similarArtists;

      let topTags = [];
      for (let tag of document.lastFM.topTags.nodes) {
        topTags.push(tag);
      }
      document.lastFM.topTags = topTags;


      let artist = Artist(document);
      let createdArtist;
      const result = artist
        .save()
        .then(result => {
          createdArtist = result;
        })
        .catch(err => {
          console.log(err);
        });

      await result;

      return {
        _id: createdArtist._doc._id.toString(),
        mbid: createdArtist.mbid,
        name: createdArtist.name,
        slug: createdArtist.slug,
        sortName: createdArtist.sortName,
        disambiguation: createdArtist.disambiguation,
        country: createdArtist.country,
        type: createdArtist.type,
        typeID: createdArtist.typeID,
        rating: createdArtist.rating,
        gender: createdArtist.gender,
        genderID: createdArtist.genderID,
        lifeSpan: createdArtist.lifeSpan,
        area: createdArtist.area,
        beginArea: createdArtist.beginArea,
        endArea: createdArtist.endArea,
        slug: createdArtist.slug,
        aliases: createdArtist.aliases,
        tags: createdArtist.tags,
        relationships: createdArtist.relationships,
        discogs: createdArtist.discogs,
        lastUpdated: createdArtist.lastUpdated,
        lastFM: createdArtist.lastFM,
        ...createdArtist
      };

      //return {
      //  ...created_doc,
      //  _id: createdArtist._id.toString()
      //};
    }
  },
  getArtists: async (args, obj, context, info) => { // the args object contains the GraphQL-parameters of the function
    // do the database stuff
    const limit = args.limit || '10';
    const offset = args.offset || '0';

    const artists = Artist.find({
      "name": {
        $ne: null
      }
    })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({
        name: 1
      })
      .exec();

    if (!artists) {
      throw new Error('error');
    }

    return artists;
  },
  getLabels: async (args, obj, context, info) => { // the args object contains the GraphQL-parameters of the function
    // do the database stuff
    const limit = args.limit || '10';
    const offset = args.offset || '0';

    const labels = Label.find({
      "name": {
        $ne: null
      }
    })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({
        name: 1
      })
      .exec();

    if (!labels) {
      throw new Error('error');
    }

    return labels;
  },
  getReleaseGroups: async (args, obj, context, info) => { // the args object contains the GraphQL-parameters of the function
    // do the database stuff
    const limit = args.limit || '10';
    const offset = args.offset || '0';

    const release_groups = ReleaseGroup.find({
      "title": {
        $ne: null
      }
    })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({
        name: 1
      })
      .exec();

    if (!release_groups) {
      throw new Error('error');
    }

    return release_groups;
  },
  getReleases: async (args, obj, context, info) => { // the args object contains the GraphQL-parameters of the function
    // do the database stuff
    const limit = args.limit || '10';
    const offset = args.offset || '0';

    const releases = Release.find({
      "title": {
        $ne: null
      }
    })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({
        name: 1
      })
      .exec();

    if (!releases) {
      throw new Error('error');
    }

    return releases;
  },
};