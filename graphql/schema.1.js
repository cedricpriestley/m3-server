const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  schema {
    query: RootQuery
  }

  type RootQuery {
    hello: TestData
  }

  type TestData {
    text: String!
    views: Int!
  }
`);