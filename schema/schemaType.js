exports.UserTypeDefs = `
    _id: ID
    name: String
    email: String
`;

exports.TeamTypeDefs = `
    _id: String
    readAndWrite: String
    readOnly: String
    user: User
`;

exports.TeamTypeDefsInput = `
    _id: String
    readAndWrite: String!
    readOnly: String!
    user: inputUser!
`;

exports.TeamTypeDefsInput = `
    _id: String
    readAndWrite: String!
    readOnly: String!
    user: inputUser!
`;

exports.userInfoDefsInput = `
    owner: Boolean!
    ownerName: String!
    readAndWrite: Boolean!
    readOnly: Boolean!
`;

exports.CommentTypeDefs = `
    _id: String!
    userId: User!
    comment: String!
`;

module.exports = exports;
