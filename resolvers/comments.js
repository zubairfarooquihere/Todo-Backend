const Comment = require("../models/comment");
const TodoList = require("../models/todo");
const auth = require('./middleware/is-authGraph');

const setupSocket = require("../socket/index");

const resolvers = {
  Query: {
    getComments: async (_, { todoId }, context) => {
      try {
        //const token = context.req.headers.authorization;
        //auth(token);
        // Find the TodoList by its ID and populate the 'comments' field
        const todoList = await TodoList.findById(todoId).populate("comments");

        if (!todoList) {
          throw new Error("Todo list not found");
        }

        // Extract the comments array from the populated 'todoList' object
        const comments = todoList.comments;
        const UpdatedComment = comments.map(async(cmt) => {
            cmt = await cmt.populate("userId");
            return cmt
        })
        return UpdatedComment;
      } catch (error) {
        throw new Error(`Failed to get comments: ${error.message}`);
      }
    },
  },
  Mutation: {
    addComment: async (_, { todoId, comment, userId }, context) => {
      try {
        const token = context.req.headers.authorization;
        auth(token);
        const newComment = new Comment({
          comment: comment,
          userId: userId,
        });
        const savedComment = await newComment.save();
        const todoList = await TodoList.findById(todoId);
        if (!todoList) {
          throw new Error("Todo list not found");
        }
        todoList.comments.push(savedComment);
        await todoList.save();
        const io = setupSocket.io;
        io.emit(`comment_update_${todoId}`, {comment: savedComment.comment, userId: userId});
        return { userId, comment: savedComment.comment, _id: savedComment._id };
      } catch (error) {
        throw new Error(`Failed to add comment: ${error.message}`);
      }
    },
    deleteComment: async (_, { commentId, todoId }, context) => {
      try {
        // Find the comment by its ID
        const token = context.req.headers.authorization;
        auth(token);
        const comment = await Comment.findById(commentId);
        if (!comment) {
          // If the comment doesn't exist, return an error or handle accordingly
          throw new Error("Comment not found");
        }

        // Remove the comment
        await comment.deleteOne();
        // The middleware in the Comment model will take care of removing it from associated TodoLists
        console.log("Comment removed successfully");

        const todoList = await TodoList.findById(todoId);
        if (!todoList) {
          throw new Error("Todo list not found");
        }

        return commentId;
      } catch (error) {
        console.error("Error removing comment:", error);
      }
    },
  },
};

module.exports = resolvers;
