const { buildSchema } = require('graphql');

const { UserTypeDefs } = require('./schemaType');
//console.log(UserTypeDefs);
const schema = buildSchema(`
  type User {
    ${UserTypeDefs}
  }

  input inputUser {
    ${UserTypeDefs}
  }

  type Team {
    _id: String
    readAndWrite: String
    readOnly: String
    user: User
  }

  input inputTeam {
    _id: String!
    readAndWrite: Boolean!
    readOnly: Boolean!
    user: inputUser!
  }

  type userInfoForTodo {
    owner: Boolean!
    ownerName: String!
    readAndWrite: Boolean!
    readOnly: Boolean!
  }

  type Comment {
    _id: String!
    userId: String!
    comment: String!
  }

  type Query {
    findUser(email: String!, userId: String!): [User]
    getMemberInfo(todoId: String!, userId: String!): userInfoForTodo
    getComments(todoId: String!): [Comment]
  }

  type Mutation {
    addUserToTodo(currentTeam: [inputTeam]!, newTeam: [inputTeam]!, todoId: String!, userId: String!) : [Team]!
    deleteUserToTodo(email: String!, todoId: String!, userId: String!): [Team]
    addComment(todoId: String!, comment: String!, userId: String!): Comment!
    deleteComment(commentId: String!, todoId: String!): String!
  }
`);

module.exports = schema;
