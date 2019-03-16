const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const areaSchema = new Schema({
  type: {
    type: String
  },
  type_id: {
    type: String
  },
  mbid: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  disambiguation: {
    type: String
  },
  slug: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
}, {
  collection: "area",
  strict: false
});

if (mongoose.models.area) {
  module.exports = mongoose.models.area;
} else {
  module.exports = mongoose.model('area', areaSchema);
}
//module.exports.areaType = mongoose.model('AreaType', areaTypeSchema);
//module.exports.areaAliasType = mongoose.model('AreaAliasType', areaAliasTypeSchema);