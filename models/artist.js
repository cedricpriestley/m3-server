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
  tags: {
    tags: [{
      name: {
        type: String
      },
      count: {
        type: Number
      }
    }]
  },
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
    partOfArea: {
      areas: {
        nodes: [{
          target: {
            mbid: {
              type: String
            },
            name: {
              type: String
            },
            partOfArea: {
              areas: {
                nodes: [{
                  target: {
                    mbid: {
                      type: String
                    },
                    name: {
                      type: String
                    },
                    partOfArea: {
                      areas: {
                        nodes: [{
                          target: {
                            mbid: {
                              type: String
                            },
                            name: {
                              type: String
                            },
                            partOfArea: {
                              areas: {
                                nodes: [{
                                  target: {
                                    mbid: {
                                      type: String
                                    },
                                    name: {
                                      type: String
                                    }
                                  }
                                }]
                              }
                            }
                          }
                        }]
                      }
                    }
                  }
                }]
              }
            }
          }
        }]
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
    }
  },
  relationships: {
    artists: {
      nodes: [{
        type: {
          type: String
        },
        targetType: String,
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
    },
    labels: {
      nodes: [{
        type: {
          type: String
        },
        targetType: String,
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
    },
    places: {
      nodes: [{
        type: {
          type: String
        },
        targetType: String,
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
    },
    recordings: {
      nodes: [{
        type: {
          type: String
        },
        targetType: String,
        direction: String,
        begin: String,
        end: String,
        ended: Boolean,
        targetCredit: String,
        sourceCredit: String,
        target: {
          mbid: String,
          title: String
        },
        attributes: {
          type: [String]
        }
      }]
    },
    releases: {
      nodes: [{
        type: {
          type: String
        },
        targetType: String,
        direction: String,
        begin: String,
        end: String,
        ended: Boolean,
        targetCredit: String,
        sourceCredit: String,
        target: {
          mbid: String,
          title: String
        },
        attributes: {
          type: [String]
        }
      }]
    },
    releaseGroups: {
      nodes: [{
        type: {
          type: String
        },
        targetType: String,
        direction: String,
        begin: String,
        end: String,
        ended: Boolean,
        targetCredit: String,
        sourceCredit: String,
        target: {
          mbid: String,
          title: String
        },
        attributes: {
          type: [String]
        }
      }]
    },
    series: {
      nodes: [{
        type: {
          type: String
        },
        targetType: String,
        direction: String,
        begin: String,
        end: String,
        ended: Boolean,
        targetCredit: String,
        sourceCredit: String,
        target: {
          mbid: String,
          title: String
        },
        attributes: {
          type: [String]
        }
      }]
    },
    works: {
      nodes: [{
        type: {
          type: String
        },
        targetType: String,
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
    },
    urls: {
      nodes: [{
        type: {
          type: String
        },
        targetType: String,
        direction: String,
        begin: String,
        end: String,
        ended: Boolean,
        targetCredit: String,
        sourceCredit: String,
        target: {
          mbid: String,
          resource: String
        },
        attributes: {
          type: [String]
        }
      }]
    },
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
    similarArtists: {
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
      }]
    },
    biography: {
      summaryHTML: String
    },
    tags: {
      tags: [{
        name: {
          type: String
        },
        url: {
          type: String
        }
      }]
    }
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