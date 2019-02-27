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
        name: { type: Sting },
        end: { type: String },
        primary: { type: Boolean },
        ended: { type: Boolean }
      }
    ],
    disambiguation: { type: String },
    lastUpdated: { type: Date, default: Date.now },
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
    childOrder: { type: Integer },
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
    childOrder: { type: Integer },
    description: { type: String },
    lastUpdated: { type: Date, default: Date.now },
  }
);

module.exports.area = mongoose.model('Area', areaSchema);
module.exports.areaType = mongoose.model('AreaType', areaTypeSchema);
module.exports.areaAliasType = mongoose.model('AreaAliasType', areaAliasTypeSchema);