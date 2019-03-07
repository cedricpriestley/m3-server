const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const labelSchema = new Schema({
  type: {
    type: String
  },
  type_id: {
    type: String
  },
  tags: [{
    _id: {
      require: false
    },
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
  isnis: {
    type: [String]
  },
  ipis: {
    type: [String]
  },
  country: {
    type: String
  },
  label_code: {
    type: String,
    required: false
  },
  /*
  releases: {
    type: [{}],
    required: true
  },
  */
  slug: {
    type: String,
    required: true
  },
  last_updated: {
    type: Date,
    default: Date.now
  },
}, {
  collection: "label",
  strict: false
});

if (mongoose.models.label) {
  module.exports = mongoose.models.label;
} else {
  module.exports = mongoose.model('label', labelSchema);
}
