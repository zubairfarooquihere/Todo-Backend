const movieSchema = require('./movies');
const gameSchema = require('./games');
const userSchema = require('./user');
const commentSchema = require('./comments');

const { mergeTypeDefs } = require('@graphql-tools/merge');
const mergedSchema = mergeTypeDefs([movieSchema, gameSchema, userSchema, commentSchema]);

module.exports = mergedSchema;