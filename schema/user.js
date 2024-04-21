const { buildSchema } = require('graphql');

const { UserTypeDefs, TeamTypeDefs, TeamTypeDefsInput, userInfoDefsInput } = require('./schemaType');
//console.log(UserTypeDefs);
const schema = buildSchema(`
  type User {
    ${UserTypeDefs}
  }

  input inputUser {
    ${UserTypeDefs}
  }

  type Team {
    ${TeamTypeDefs}
  }

  input inputTeam {
    ${TeamTypeDefsInput}
  }

  type userInfoForTodo {
    ${userInfoDefsInput}
  }

  type Query {
    findUser(email: String!, userId: String!): [User]
    getMemberInfo(todoId: String!, userId: String!): userInfoForTodo
  }

  type Mutation {
    addUserToTodo(currentTeam: [inputTeam]!, newTeam: [inputTeam]!, todoId: String!, userId: String!) : [Team]!
    deleteUserToTodo(email: String!, todoId: String!, userId: String!): [Team]
  }
`);

module.exports = schema;
