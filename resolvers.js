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

let entitySchema = new Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: false
  },
}, {
  strict: false
});

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
    }, (err, result) => {});
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
      //  ...createdArtist._doc,
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