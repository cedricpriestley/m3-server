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
  },
  disambiguation: {
    type: String,
    required: false
  },
  area: {
    id: { type: Schema.Types.ObjectId, ref: 'Area', required: false },
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  last_updated: {
    type: String,
    required: true
  }
},
  {
    strict: true
  }
);

module.exports = mongoose.model('artist', artistSchema);