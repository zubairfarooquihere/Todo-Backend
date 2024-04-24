const TodoList = require("../models/todo");
const List = require("../models/list");
const User = require("../models/user");
const Comment = require("../models/comment");
const mongoose = require("mongoose");

const setupSocket = require("../socket/index");

exports.getPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: "TodoList",
      populate: [
        { path: "list" },
        { path: "myTeam.user", select: "name email" },
      ],
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
  const session = await mongoose.startSession();
  session.startTransaction();
  const todoId = req.params.todoId;
  //req.user.userId
  try {
    const todoList = await TodoList.findById(todoId).session(session);
    const myTeam = todoList.myTeam;

    if (!todoList) {
      return res.status(404).json({ error: "TodoList not found" });
    }

    await List.deleteMany({ _id: { $in: todoList.list } }).session(session);
    await Comment.deleteMany({ _id: { $in: todoList.comments } }).session(session);

    await TodoList.findByIdAndDelete(todoId).session(session);

    // const user = await User.findOneAndUpdate(
    //   { _id: todoList.userId },
    //   { $pull: { TodoList: todoId } },
    //   { new: true, session }
    // );
    let user = await User.findById(todoList.userId);
    const index = user.TodoList.findIndex((todo) => todo.equals(todoId));
    user = await User.findOneAndUpdate(
      { _id: todoList.userId },
      { $pull: { TodoList: todoId } },
      { new: true, session }
    );
    myTeam.map(async (team) => {
      return await User.findOneAndUpdate(
        { _id: team.user },
        { $pull: { TodoList: todoId } },
        { new: true, session }
      );
    })

    await session.commitTransaction();
    session.endSession();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ message: "Todo deleted successfully", index });
  } catch (error) {
    console.error("Error deleting todoList and lists:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.createList = async (req, res, next) => {
  try {
    const todoId = req.params.todoId;
    const text = req.body.text;
    const userId = req.body.userId;
    const status = "active";
    const todoList = await TodoList.findById(todoId);

    const list = new List({ text, status, TodoListId: todoList._id });
    const response = await list.save();
    todoList.list.push(response);
    await todoList.save();

    const io = setupSocket.io;
    io.emit(`list_update_${todoId}`, {list: list, userId: userId});  
    
    res.status(200).json({ message: "Created List successfully.", list });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    const listId = req.params.listId;
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }
    list.status = list.status === "active" ? "completed" : "active";
    await list.save();

    return res.json({
      message: "List status changed successfully",
      status: list.status,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.reorderList = async (req, res, next) => {
  const TodoListId = req.params.TodoListId;
  const newItems = req.body.newItems;

  try {
    // Find the TodoList by its ID and populate the list field
    const todoList = await TodoList.findById(TodoListId);

    if (!todoList) {
      const error = new Error("TodoList not found");
      error.statusCode = 404;
      throw error;
    }

    // Update the order of items in the list
    todoList.list = newItems;

    // Save the updated TodoList
    const updatedTodoList = await todoList.save();

    res.status(200).json({
      message: "TodoList reordered successfully",
      todoList: updatedTodoList,
    });
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
