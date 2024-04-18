const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todoListSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  myTeam: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference the User model
        required: true,
      },
      readAndWrite: {
        type: Boolean,
        default: false, // Set default value to false
      },
      readOnly: {
        type: Boolean,
        default: false, // Set default value to false
      },
    },
  ],
  list: [
    {
      type: Schema.Types.ObjectId,
      ref: "list",
    },
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

module.exports = mongoose.model("TodoList", todoListSchema);
