const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const entitySchema = new Schema({
  _id: {
    type: Number,
    required: true
  },
  id: {
    type: String,
    required: true
  },
},
  {
    strict: false
  }
);

module.exports = mongoose.model('', entitySchema); {
  strict: false
}