const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const releaseGroupSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  releases: {
    type: [{}],
    required: true
  },
  primary_type: {
    type: String,
    required: false
  },
  slug: {
    type: String,
    required: true
  },
  last_updated: {
    type: Date,
    default: Date.now
  },
}, {
  collection: "release_group",
  strict: false
});

if (mongoose.models.release_group) {
  module.exports = mongoose.models.release_group;
} else {
  module.exports = mongoose.model('release_group', releaseGroupSchema);
}