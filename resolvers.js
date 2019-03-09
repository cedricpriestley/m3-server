//import { Area, AreaType, AreaAliasType } from './models/area';
const Area = require('./models/area');
const Artist = require('./models/artist');
const Label = require('./models/label');
const ReleaseGroup = require('./models/release-group');
const Release = require('./models/release');
//const Area = require('./schema');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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