// schema.js
const { gql } = require('apollo-server');

const typeDefs = gql`
  type Movie {
    id: ID!
    title: String!
    genre: String!
    year: String!
  }

  type Query {
    movies: [Movie]
    demo: String!
  }

  type Mutation {
    addMovie(title: String!, genre: String!, year: String!): Movie
  }
`;

module.exports = typeDefs;
