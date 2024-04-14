const movieResolver = require('./movies');
const gameResolver = require('./games');
const userResolver = require('./user');
const { mergeResolvers } = require('@graphql-tools/merge');

const mergedResolvers = mergeResolvers([movieResolver, gameResolver, userResolver]);

module.exports = mergedResolvers;