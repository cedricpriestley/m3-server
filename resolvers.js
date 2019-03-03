//import { Area, AreaType, AreaAliasType } from './models/area';
//const Area = require('./models/area');
//const Artist = require('./models/artist');
//const Area = require('./schema');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const validator = require('validator');

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
  getAreas: async (args, obj, context, info) => {  // the args object contains the GraphQL-parameters of the function
    // do the dastabase stuff
    const limit = args.limit || '10';
    const offset = args.offset || '0';

    entitySchema.options.collection = 'area';
    Entity = mongoose.model('area', entitySchema);

    const areas = Entity.find({ "name": { $ne: null } })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ name: 1 })
      .exec();

    if (!areas) {
      throw new Error('error');
    }

    return areas;
  },
  resetArea: async (args, obj, context, info) => {
    const id = args.id;

    entitySchema.options.collection = 'area';
    Entity = mongoose.model('area', entitySchema);

    let area = Entity.find({ id: id });

    if (area) {
      for (const key in area) {
        if (key != '_id' && key != 'id' && key != 'slug') {
          unsetValues[key] = '';
        }
      }
    }

    area.updateOne(
      { id: document['id'] },
      { $unset: unsetValues }
      , (err, result) => { }
    );
  },
  getArea: (obj, args, context, info) => {
    const id = args.id;

    entitySchema.options.collection = 'area';
    Entity = mongoose.model('area', entitySchema);

    let area = Entity.find({ id: id });

    return area;
  },
  createArea: async function (obj, args, context, info) {
     // const mbid = areaInput.mbid
     console.log(obj);
     return;
     entitySchema.options.collection = 'area';
     Entity = mongoose.model('area', entitySchema);
    const existingArea = await Entity.findOne({ mbid: areaInput.mbid });
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
    return { ...createdArea._doc, _id: createdArea._id.toString() };
  },
  getArtists: async (args, obj, context, info) => {  // the args object contains the GraphQL-parameters of the function
    // do the dastabase stuff
    const limit = args.limit || '10';
    const offset = args.offset || '0';

    entitySchema.options.collection = 'artist';
    Entity = mongoose.model('artist', entitySchema);

    const artists = Entity.find({ "name": { $ne: null } })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ name: 1 })
      .exec();

    if (!artists) {
      throw new Error('error');
    }

    return artists;
  },
};