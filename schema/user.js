const { buildSchema } = require('graphql');

const { UserTypeDefs } = require('./schemaType');
//console.log(UserTypeDefs);
const schema = buildSchema(`
  type Query {
    findUser(email: String!): [User]
    getMemberInfo(todoId: String!, userId: String!): userInfoForTodo
  }

  type Mutation {
    addUserToTodo(emails: [String!]!, todoId: String!): [Team]
    deleteUserToTodo(email: String!, todoId: String!): [Team]
  }

  type User {
    ${UserTypeDefs}
  }

  type Team {
    _id: String
    user: User
    readAndWrite: String
    readOnly: String
  }

  type userInfoForTodo {
    owner: Boolean
    ownerName: String
    readAndWrite: Boolean
    readOnly: Boolean
  }
`);

module.exports = schema;
