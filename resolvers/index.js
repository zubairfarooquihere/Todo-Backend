const movieResolver = require('./movies');
const gameResolver = require('./games');
const userResolver = require('./user');
const commentResolver = require('./comments');
const { mergeResolvers } = require('@graphql-tools/merge');

const mergedResolvers = mergeResolvers([movieResolver, gameResolver, userResolver, commentResolver]);

module.exports = mergedResolvers;