const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const areaSchema = new Schema(
  {
    typeId: {
      type: Schema.Types.ObjectId,
      ref: 'AreaType',
      required: true
    },
    type: { type: String },
    tag: [
      {
        name: { type: String, required: true },
        count: { type: Number, required: false }
      }
    ],
    mbid: { type: String, required: true },
    sortName: { type: String },
    name: { type: String, required: true },
    lifeSpan: {
      ended: { type: Boolean },
      begin: { type: String },
      end: { type: String }
    },
    aliases: [
      {
        begin: { type: String },
        type: { type: String },
        locale: { type: String },
        typeId: { type: String, ref: 'AreaAliasType' },
        sortName: { type: String },
        name: { type: String },
        end: { type: String },
        primary: { type: Boolean },
        ended: { type: Boolean }
      }
    ],
    disambiguation: { type: String },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    strict: false,
    collection: "area"
  }
);

const areaTypeSchema = new Schema(
  {
    mbid: { type: String, required: true },
    name: { type: String, required: true },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'AreaType',
    },
    childOrder: { type: Number },
    description: { type: String },
    lastUpdated: { type: Date, default: Date.now },
  }
);

const areaAliasTypeSchema = new Schema(
  {
    mbid: { type: String, required: true },
    name: { type: String, required: true },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'AreaAliasType',
    },
    childOrder: { type: Number },
    description: { type: String },
    lastUpdated: { type: Date, default: Date.now },
  }
);

module.exports = mongoose.model('area', areaSchema);
//module.exports.AreaType = mongoose.model('AreaType', areaTypeSchema);
//module.exports.AreaAliasType = mongoose.model('AreaAliasType', areaAliasTypeSchema);