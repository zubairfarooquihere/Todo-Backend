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
    required: true
  },
  list: [
    {
      type: Schema.Types.ObjectId,
      ref: "list",
    },
  ],
});

module.exports = mongoose.model("TodoList", todoListSchema);
