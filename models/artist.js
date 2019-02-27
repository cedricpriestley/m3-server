const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const artistSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    require: true
  }
},
  {
    strict: true
  }
);

module.exports = mongoose.model('artist', artistSchema); {
  strict: false
}