const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type Query {
    listGames: [Game]
    findGame(name: String!): [Game]
  }

  type Mutation {
    addGame(name: String!): Game
  }

  type Game {
    id: ID!
    name: String!
  }
`);

module.exports = schema;
