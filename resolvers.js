//import { Area, AreaType, AreaAliasType } from './models/area';
const Area = require('./models/area');

const validator = require('validator');
module.exports = {
  createArea: async function ({ areaInput: AreaInput }, req) {
    // const id = areaInput.id
    console.log(areaInput);
    const existingArea = await Area.findOne({ mbid: areaInput.mbid });
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
  getAreas: async (args, obj, context, info) => {  // the args object contains the GraphQL-parameters of the function
    // do the dastabase stuff
    const limit = args.limit || '10';
    const offset = args.offset || '0';

    const areas = Area.find({ "name": { $ne: null } })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ name: 1 })
      .exec();

    if (!areas) {
      throw new Error('error');
    }

    return areas;
  },
  getArea: (obj, args, context, info) => {
    // the args object contains the GraphQL-parameters of the function

    // do database stuff
    return {
      _id: 'ID!',
      mbid: args.mbid,
      name: 'Area ' + args.mbid,
      disambiguation: 'String',
      type: 'String!',
      typeId: 'String!',
      sortName: 'String!',
      aliases: ['String!'],
      lifeSpan: new LifeSpan({ begin: 'String', end: 'String', ended: false }),
      slug: 'String',
      lastUpdated: 'String'
    };
  },
  importMbzArtist: async function ({ areaInput: areaInput }, req) {
    // const id = areaInput.id
    const existingArea = await Area.findOne({ mbid: areaInput.mbid });
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
  updateMbzArtist: async function ({ artistInput }, req) {

  }
};