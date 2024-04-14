const movieSchema = require('./movies');
const gameSchema = require('./games');
const userSchema = require('./user');

const { mergeTypeDefs } = require('@graphql-tools/merge');
const mergedSchema = mergeTypeDefs([movieSchema, gameSchema, userSchema]);

module.exports = mergedSchema;