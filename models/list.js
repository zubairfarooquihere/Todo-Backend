const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  TodoListId: {
    type: Schema.Types.ObjectId,
    ref: 'TodoList',
    required: true,
  },
});

module.exports = mongoose.model("list", listSchema);
