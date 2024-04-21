const { buildSchema } = require("graphql");
const { UserTypeDefs, CommentTypeDefs } = require('./schemaType');
const schema = buildSchema(`
  type User {
    ${UserTypeDefs}
  }  
  
  type Comment {
    ${CommentTypeDefs}
  }

  type Query {
    getComments(todoId: String!): [Comment]
  }

  type Mutation {
    addComment(todoId: String!, comment: String!, userId: String!): Comment!
    deleteComment(commentId: String!, todoId: String!): String!
  }
`);

module.exports = schema;
