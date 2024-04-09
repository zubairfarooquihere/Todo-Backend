const express = require("express");

const todoController = require("../controllers/todo");
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get("/getTodos", isAuth, todoController.getPosts);

router.post("/createTodo", isAuth, todoController.createTodo);

router.delete("/deleteTodo/:todoId", isAuth, todoController.deleteTodo);

router.post("/createList/:todoId", isAuth, todoController.createList);

router.put("/changeStatus/:listId", isAuth, todoController.changeStatus);

router.put("/reorderList/:TodoListId", isAuth, todoController.reorderList);

router.delete("/deleteList/:listId", isAuth, todoController.deleteList);

module.exports = router;
