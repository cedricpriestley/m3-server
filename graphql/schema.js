const { buildSchema } = require('graphql');

module.exports = buildSchema(`

  type Area {
    _id: ID!
    mbid: String!
    name: String!
    type: String
    lastUpdated: String
  }

  input AreaInputData{
    mbid: String!
    name: String!
    type: String
  }

  type RootMutation {
    createArea(areaInput: AreaInputData): Area
    updateArea(areaInput: AreaInputData): Area
  }

  type RootQuery{
    hello: String
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);