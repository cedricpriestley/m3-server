const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const artistSchema = new Schema({
  type: {
    type: String
  },
  type_id: {
    type: String
  },
  tags: [{
    name: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      required: false
    }
  }],
  id: {
    type: String,
    required: true
  },
  sort_name: {
    type: String
  },
  name: {
    type: String,
    required: true
  },
  life_span: {
    ended: {
      type: Boolean
    },
    begin: {
      type: String
    },
    end: {
      type: String
    }
  },
  aliases: [{
    _id: {
      require: false
    },
    begin: {
      type: String
    },
    type: {
      type: String
    },
    locale: {
      type: String
    },
    type_id: {
      type: String
    },
    sortName: {
      type: String
    },
    name: {
      type: String
    },
    end: {
      type: String
    },
    primary: {
      type: Boolean
    },
    ended: {
      type: Boolean
    }
  }],
  disambiguation: {
    type: String
  },
  images: {
    type: [],
    required: false
  },
  releases: {
    type: [{}],
    required: true
  },
  similar_artists: {
    type: [],
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
  collection: "artist",
  strict: false
});

if (mongoose.models.artist) {
  module.exports = mongoose.models.artist;
} else {
  module.exports = mongoose.model('artist', artistSchema);
}
//module.exports.areaType = mongoose.model('AreaType', areaTypeSchema);
//module.exports.areaAliasType = mongoose.model('AreaAliasType', areaAliasTypeSchema);