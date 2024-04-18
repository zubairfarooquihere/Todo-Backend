const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TodoList = require("../models/todo");

const commentSchema = new Schema({
  comment: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reply: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

commentSchema.post('deleteOne', async function() {
  try {
    // Find the ID of the deleted comment
    const deletedCommentId = this.getQuery()._id;
    console.log(deletedCommentId);
    // Find all TodoLists referencing the deleted comment and update them
    await TodoList.updateMany(
      { comments: deletedCommentId }, // Find TodoLists where the comment ID exists in the comments array
      { $pull: { comments: deletedCommentId } } // Remove the comment ID from the comments array
    );
  } catch (error) {
    console.error('Error removing comment from TodoList:', error);
  }
});

module.exports = mongoose.model("Comment", commentSchema);
