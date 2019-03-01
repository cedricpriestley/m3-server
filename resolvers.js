//import { Area, AreaType, AreaAliasType } from './models/area';
const Area = require('./models/area');
//const Area = require('./schema');

const validator = require('validator');
module.exports = {
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
  resetArea: async (args, obj, context, info) => {
    const id = args.id;

    let area = Area.find({ id: id });

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

    let area = Area.find({ id: id });

    return area;
  },
  createArea: async function ({ areaInput }, req) {
    // const id = areaInput.id
    const existingArea = await Area.findOne({ id: areaInput.id });
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
      id: areaInput.id,
      name: areaInput.name,
      updatedDate: date
    });

    const createdArea = await area.save();
    return { ...createdArea._doc, _id: createdArea._id.toString() };
  },
  updateMbzArtist: async function ({ artistInput }, req) {

  }
};