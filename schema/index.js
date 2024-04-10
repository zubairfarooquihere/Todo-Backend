const movieSchema = require('./movies');
const gameSchema = require('./games');

const { mergeTypeDefs } = require('@graphql-tools/merge');
const mergedSchema = mergeTypeDefs([movieSchema, gameSchema]);

module.exports = mergedSchema;