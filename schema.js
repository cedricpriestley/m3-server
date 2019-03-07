const {
  buildSchema
} = require('graphql');

module.exports = buildSchema(`
  type LifeSpan {
    begin: String
    end: String
    ended: Boolean
  }

  type Area {
    _id: ID!
    id: String!
    name: String!
    disambiguation: String
    type: String
    typeId: String!
    sortName: String!
    aliases: [String!]
    lifeSpan: LifeSpan
    slug: String!
    lastUpdated: String!
  }

  type Artist {
    _id: ID!
    id: String!
    name: String!
    disambiguation: String
    type: String
    images: [ArtistImage]
    releases: [Release]
    similar_artists: [Artist]
  }

  type Label {
    _id: ID!
    id: String!
    name: String!
    disambiguation: String
    type: String
    country: String
  }

  type ArtistImage {
    url: String
    size: String
  }

  type ReleaseGroup {
    _id: ID!
    id: String!
    title: String!
    releases: [Release]
    primary_type: String
  }

  type Release {
    _id: ID!
    id: String!
    title: String!
    coverart_url: String
    country: String
    disambiguation: String
    status: String
  }

  input LifeSpanInput {
    begin: String
    end: String
    ended: Boolean
  }

  input AreaInput {
    id: String!
    name: String!
    disambiguation: String
    type: String!
    typeId: String!
    sortName: String!
    aliases: [String!]
    lifeSpan: LifeSpanInput
  }

  type Query {
    getAreas(limit: Int, offset: Int) : [Area]
    getArea(id: String!) : Area
    getLabels(limit: Int, offset: Int) : [Label]
    getLabel(id: String!) : Label
    getArtists(limit: Int, offset: Int) : [Artist]
    getReleases(limit: Int, offset: Int) : [Release]
    getReleaseGroups(limit: Int, offset: Int) : [ReleaseGroup]
  }

  type Mutation {
    createArea(area: AreaInput!): Area
    updateArea(area: AreaInput!): Area
    deleteArea(id: Int!): Boolean
  }

  `);