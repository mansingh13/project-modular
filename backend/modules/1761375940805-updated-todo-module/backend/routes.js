const express = require('express');
const todoController = require('./controllers/todoController');

const router = express.Router();

// Todo CRUD routes
router.get('/todos', todoController.getAllTodos);
router.post('/todos', todoController.createTodo);
router.get('/todos/:id', todoController.getTodoById);
router.put('/todos/:id', todoController.updateTodo);
router.delete('/todos/:id', todoController.deleteTodo);

module.exports = router;