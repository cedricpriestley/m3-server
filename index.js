const express = require('express');
const { ApolloServer, gql, makeExecutableSchema, addSchemaLevelResolveFunction } = require('apollo-server-express');
const mongoose = require('mongoose');
//const request = require('request');
const util = require('util');
const request = util.promisify(require("request"));

const Schema = mongoose.Schema;

const artistSchema = new Schema({
  mbid: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
}, {
    collection: "artist",
    strict: false
  });

Artist = mongoose.model('artist', artistSchema);

const typeDefs = gql`
  type Artist {
    _id: ID!
    mbid: String!
    name: String!
    type: String
    typeId: String
  }

  # the schema allows the following query:
  type Query {
    artist(mbid: String): Artist
  }
`;

const resolvers = {
  Query: {
    artist: async (_, { mbid }) => {
      let artist;
      let results = Artist.findOne({ mbid: mbid })
        .then(results => {
          artist = results;
        })

      await results;

      if (!artist) {
        var options = _buildEntityLookupUrl(mbid, 'artist');
        let document;
        let results = request(options)
          .then(results => {
            let body = results.body;

            document = {
              mbid: body.id,
              name: body.name
            };

            let artist = Artist(document);
            artist.save();
          });

        await results;
        return document;

      } else {
        return artist;
      }
    },
  }
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const rootResolveFunction = (parent, args, context, info) => {
  //perform action before any other resolvers
};

addSchemaLevelResolveFunction(schema, rootResolveFunction)

const server = new ApolloServer({ schema });

const app = express();

const cors = require('cors');

mongoose
  .connect(
    'mongodb://localhost:27017/mbz', {
      useNewUrlParser: true
    }
  )
  .then(result => {
    app.use(cors());

    server.applyMiddleware({ app });

    app.listen({ port: 8000 }, () =>
      console.log(`🚀 Server ready at http://localhost:8000${server.graphqlPath}`)
    );
  })
  .catch(err => {
    console.log(err);
  });


var _buildEntityLookupUrl = (id, type) => {
  let incs = getEntityIncludes(type).join("+");
  let subs = getEntitySubqueries(type).join("+");
  let subIncs = getEntitySubqueryIncludes(type).join("+");
  let relIncs = getRelIncludes(type).join("+");

  let mburl = `https://musicbrainz.org/ws/2/${type}/${id}?inc=${incs}+${relIncs}+${subs}+${subIncs}&fmt=json`;

  var options = {
    url: mburl,
    headers: {
      'User-Agent': 'm3 server 100.115.92.202'
    },
    json: true
  };

  return options;
}

/*
$relIncs = ["area-rels", "artist-rels", "event-rels",
"label-rels", "place-rels", "recording-rels", "release-group-rels",
"release-rels", "series-rels", "url-rels", "work-rels"]
*/
const getRelIncludes = type => {
  switch (type) {
    case "area":
      return ["area-rels"];
    case "artist":
    case "label":
    case "place":
    case "recording":
    case "release":
    case "release-group":
    case "series":
    case "url":
      return ["area-rels", "artist-rels", "event-rels",
        "label-rels", "place-rels", "recording-rels", "release-group-rels",
        "release-rels", "series-rels", "url-rels", "work-rels"
      ];
    default:
      return [];
  }
}

const getEntityIncludes = type => {
  switch (type) {
    case "area":
      return ["aliases", "ratings", "tags"];
    case "artist":
    case "label":
    case "work":
      return ["aliases", "ratings", "tags"];
    case "event":
    case "place":
    case "recording":
    case "release":
      return ["artist-credits", "ratings", "tags"];
    case "release-group":
      return ["artist-credits", "ratings", "tags"];
    case "series":
    case "url":
      return ["ratings", "tags"];
    default:
      break;
  }
}

const getForeignEntities = type => {
  switch (type) {
    case "area":
      return [];
    case "artist":
      return [{
        "area": "area"
      }, {
        "beginArea": "area"
      }, {
        "endArea": "area"
      }];
    case "label":
    case "work":
      return [];
    case "event":
    case "place":
    case "recording":
    case "release":
      return [{
        "label_info": "label"
      }];
    case "release-group":
      return []; //["artist-credits"];
    case "series":
    case "url":
      return [];
    default:
      return [];
  }
}

const getEntitySubqueries = type => {
  switch (type) {
    case "artist":
      return [];
      return ["media", "recordings", "releases", "release-groups", "works"];
    case "label":
      return ["releases"];
    case "recording":
      return ["artists", "releases"];
    case "release":
      return ["artists", "isrcs", "labels", "recordings", "release-groups"];
    case "release-group":
      return ["artists", "media", "releases"];
    default:
      return [];
  }
}

const getEntitySubqueryIncludes = type => {
  switch (type) {
    case "recordings":
      return ["artist-credits", "isrcs"];
    case "release":
      return ["artist-credits", "media"];
    default:
      return [];
  }
}