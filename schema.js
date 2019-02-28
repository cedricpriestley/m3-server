const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type LifeSpan {
    begin: String
    end: String
    ended: Boolean
  }

  type Area {
    _id: ID!
    mbid: String!
    name: String!
    disambiguation: String
    type: String!
    typeId: String!
    sortName: String!
    aliases: [String!]
    lifeSpan: LifeSpan
    slug: String!
    lastUpdated: String!
  }

  input LifeSpanInput {
    begin: String
    end: String
    ended: Boolean
  }

  input AreaInput {
    mbid: String!
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
    getArea(mbid: String!) : Area
  }

  type Mutation {
    createArea(area: AreaInput!): Area
    updateArea(area: AreaInput!): Area
    deleteArea(_id: Int!): Boolean
  }
`);