const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const releaseSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  coverart_url: {
    type: String,
    required: false
  },
  slug: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: false
  },
  disambiguation: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: false
  },
  last_updated: {
    type: Date,
    default: Date.now
  },
}, {
  collection: "release",
  strict: false
});

if (mongoose.models.release) {
  module.exports = mongoose.models.release;
} else {
  module.exports = mongoose.model('release', releaseSchema);
}