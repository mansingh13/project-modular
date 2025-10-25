const Todo = require('../models/todo');

class TodoController {
  async getAllTodos(req, res) {
    try {
      const todos = await Todo.findAll({
        order: [['createdAt', 'DESC']]
      });
      res.json(todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
      res.status(500).json({ error: 'Failed to fetch todos' });
    }
  }

  async createTodo(req, res) {
    try {
      const { title, description } = req.body;
      const todo = await Todo.create({
        title,
        description,
        completed: false
      });
      res.status(201).json(todo);
    } catch (error) {
      console.error('Error creating todo:', error);
      res.status(500).json({ error: 'Failed to create todo' });
    }
  }

  async getTodoById(req, res) {
    try {
      const todo = await Todo.findByPk(req.params.id);
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      res.json(todo);
    } catch (error) {
      console.error('Error fetching todo:', error);
      res.status(500).json({ error: 'Failed to fetch todo' });
    }
  }

  async updateTodo(req, res) {
    try {
      const { title, description, completed } = req.body;
      const todo = await Todo.findByPk(req.params.id);
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      await todo.update({ title, description, completed });
      res.json(todo);
    } catch (error) {
      console.error('Error updating todo:', error);
      res.status(500).json({ error: 'Failed to update todo' });
    }
  }

  async deleteTodo(req, res) {
    try {
      const todo = await Todo.findByPk(req.params.id);
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      await todo.destroy();
      res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
      console.error('Error deleting todo:', error);
      res.status(500).json({ error: 'Failed to delete todo' });
    }
  }
}

module.exports = new TodoController();