const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const partOfArea = {
  areas: {
    nodes: {
      target: {
        mbid: {
          type: String
        },
        name: {
          type: String
        }
      }
    }
  }
};
const artistSchema = new Schema({
  mbid: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  sortName: {
    type: String,
  },
  disambiguation: {
    type: String,
  },
  country: {
    type: String,
  },
  type: {
    type: String,
  },
  typeID: {
    type: String,
  },
  rating: {
    voteCount: {
      type: Number
    },
    value: {
      type: String
    }
  },
  gender: {
    type: String,
  },
  genderID: {
    type: String,
  },
  lifeSpan: {
    begin: {
      type: String
    },
    end: {
      type: String
    },
    ended: {
      type: Boolean
    }
  },
  tags: [{
    name: {
      type: String
    },
    count: {
      type: Number
    }
  }],
  aliases: [{
    name: {
      type: String
    },
    type: {
      type: String
    }
  }],
  area: {
    mbid: {
      type: String
    },
    name: {
      type: String
    },
    sortName: {
      type: String
    },
    disambiguation: {
      type: String
    },
    area: {
      mbid: {
        type: String
      },
      name: {
        type: String
      },
      area: {
        mbid: {
          type: String
        },
        name: {
          type: String
        },
        area: {
          mbid: {
            type: String
          },
          name: {
            type: String
          }
        }
      }
    }
  },
  beginArea: {
    mbid: {
      type: String
    },
    name: {
      type: String
    },
    sortName: {
      type: String
    },
    disambiguation: {
      type: String
    },
    beginArea: {
      mbid: {
        type: String
      },
      beginArea: {
        type: String
      },
      beginArea: {
        mbid: {
          type: String
        },
        name: {
          type: String
        },
        beginArea: {
          mbid: {
            type: String
          },
          name: {
            type: String
          }
        }
      }
    }
  },
  endArea: {
    mbid: {
      type: String
    },
    name: {
      type: String
    },
    sortName: {
      type: String
    },
    disambiguation: {
      type: String
    },
    endArea: {
      mbid: {
        type: String
      },
      endArea: {
        type: String
      },
      endArea: {
        mbid: {
          type: String
        },
        name: {
          type: String
        },
        endArea: {
          mbid: {
            type: String
          },
          name: {
            type: String
          }
        }
      }
    }
  },
  relationships: {
    artists: {
      teacher: [{
        direction: String,
        begin: String,
        end: String,
        ended: Boolean,
        targetCredit: String,
        sourceCredit: String,
        target: {
          mbid: String,
          name: String
        },
        attributes: {
          type: [String]
        }
      }]
    }
  },
  lastUpdated: {
    type: String,
    required: true
  },
  lastFM: {
    url: {
      type: String
    },
    smallImage: {
      type: String
    },
    mediumImage: {
      type: String
    },
    largeImage: {
      type: String
    },
    extraLargeImage: {
      type: String
    },
    megaImage: {
      type: String
    },
    similarArtists: [{
      mbid: {
        type: String
      },
      name: {
        type: String
      },
      image: {
        type: String
      }
    }],
    biography: {
      summaryHTML: String
    },
    topTags: [{
      name: {
        type: String
      },
      url: {
        type: String
      }
    }]
  }
}, {
    collection: "artist",
    strict: false
  });

if (mongoose.models.artist) {
  module.exports = mongoose.models.artist;
} else {
  module.exports = mongoose.model('artist', artistSchema);
}