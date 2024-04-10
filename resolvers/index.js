const movieResolver = require('./movies');
const gameResolver = require('./games');
const { mergeResolvers } = require('@graphql-tools/merge');

const mergedResolvers = mergeResolvers([movieResolver, gameResolver]);

module.exports = mergedResolvers;