const TodoList = require("../models/todo");
const List = require("../models/list");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: "TodoList",
      populate: { path: "list" },
    });

    res.status(200).json({
      message: "Todo lists fetched successfully",
      todoLists: user.TodoList,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createTodo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: "TodoList",
      populate: { path: "list" },
    });
    const title = "My List";
    const todoList = new TodoList({ title, userId: req.user.userId });
    const response = await todoList.save();
    user.TodoList.push(response);
    await user.save();
    res.status(200).json({
      message: "Created TodoList successfully.",
      todoList: user.TodoList,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteTodo = async (req, res, next) => {
  const todoId = req.params.todoId;
  try {
    // Find the TodoList document by its ID using Mongoose's findById method
    const todoList = await TodoList.findById(todoId);

    if (!todoList) {
      return res.status(404).json({ error: "TodoList not found" });
    }

    let listIds = [];
    if (todoList.list && todoList.list.length > 0) {
      listIds = todoList.list.map((item) => item._id);
    }

    // Delete the associated list documents
    await List.deleteMany({ _id: { $in: listIds } });

    // Delete the TodoList document using Mongoose's remove method
    await todoList.deleteOne();

    const user = await User.findOne({ _id: req.user.userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the index of the todoList in the user's TodoList array
    const index = user.TodoList.findIndex((todo) => todo.equals(todoId));
    if (index === -1) {
      return res
        .status(404)
        .json({ error: "TodoList not found in user's TodoList" });
    }

    // Remove the todoList from the User document
    user.TodoList.splice(index, 1);
    await user.save();

    return res.json({ message: "Todo deleted successfully", index });
  } catch (error) {
    console.error("Error deleting todoList and lists:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.createList = async (req, res, next) => {
  try {
    const todoId = req.params.todoId;
    const text = req.body.text;
    const status = "active";
    const todoList = await TodoList.findById(todoId);

    const list = new List({ text, status, TodoListId: todoList._id });
    const response = await list.save();
    todoList.list.push(response);
    await todoList.save();
    res.status(200).json({ message: "Created List successfully.", list });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteList = async (req, res, next) => {
  try {
    const listId = req.params.listId;
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }
    const TodoListId = list.TodoListId;
    const todoList = await TodoList.findById(TodoListId);
    if (!todoList) {
      return res.status(404).json({ error: "Todo list not found" });
    }
    const index = todoList.list.indexOf(listId);
    if (index === -1) {
      return res.status(404).json({ error: "List ID not found in todo list" });
    }
    todoList.list.splice(index, 1);

    await todoList.save();
    const deleteResponse = await List.deleteOne({ _id: listId });
    if (deleteResponse.deletedCount === 1) {
      return res.json({ message: "List deleted successfully", list, index });
    }

    return res.status(404).json({ error: "List not found or already deleted" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
