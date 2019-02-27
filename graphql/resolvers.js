//const Area = require('../models/area');
const validator = require('validator');

module.exports = {
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