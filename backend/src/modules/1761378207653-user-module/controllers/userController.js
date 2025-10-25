const { Sequelize } = require('sequelize');
const config = require('../../../database/config/config.json').development;
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// Initialize the User model directly
const User = require('../models/user')(sequelize, Sequelize.DataTypes);

// Sync the model
User.sync({ force: false }).then(() => {
  console.log('User table synced successfully');
}).catch(err => {
  console.error('Error syncing User table:', err);
});

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        order: [['createdAt', 'DESC']]
      });
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  async createUser(req, res) {
    try {
      const { name, email, age } = req.body;
      const user = await User.create({
        name,
        email,
        age
      });
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  async updateUser(req, res) {
    try {
      const { name, email, age } = req.body;
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({ name, email, age });
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  async deleteUser(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.destroy();
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}

module.exports = new UserController();