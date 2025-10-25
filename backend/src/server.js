const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

// Import routes and middleware
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// Dynamic module loading
let appInstance = null;
const loadModules = (app) => {
  appInstance = app || appInstance;
  if (!appInstance) {
    console.error('App instance not available for module loading');
    return;
  }

  global.loadModules = () => loadModules(appInstance);

  const modulesPath = path.join(__dirname, 'modules');
  if (fs.existsSync(modulesPath)) {
    const moduleDirs = fs.readdirSync(modulesPath).filter(dir =>
      fs.statSync(path.join(modulesPath, dir)).isDirectory()
    );

    console.log(`Found ${moduleDirs.length} module directories:`, moduleDirs);

    moduleDirs.forEach(moduleDir => {
      const modulePath = path.join(modulesPath, moduleDir, 'routes.js');
      if (fs.existsSync(modulePath)) {
        try {
          // Clear require cache to allow reloading
          delete require.cache[require.resolve(modulePath)];
          const moduleRoutes = require(modulePath);
          const routePath = `/api/modules/${moduleDir}`;
          appInstance.use(routePath, moduleRoutes);
          console.log(`✅ Loaded routes for module: ${moduleDir} at ${routePath}`);
          console.log(`Available routes: GET ${routePath}/todos, POST ${routePath}/todos, etc.`);
        } catch (error) {
          console.warn(`❌ Failed to load routes for module ${moduleDir}:`, error);
        }
      } else {
        console.warn(`⚠️ No routes.js found for module ${moduleDir}`);
      }
    });
  }
};

// Import database
const { Sequelize } = require('sequelize');
const config = require('./database/config/config.json');

const sequelize = new Sequelize(config.development);

const app = express();
const PORT = process.env.PORT || 3001;

// Make app globally available for module reloading
global.app = app;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Custom middleware
app.use(logger);

// API Routes
app.use('/api', apiRoutes);

// Load dynamic modules AFTER other API routes
loadModules(app);

// TEMPORARY: Direct route for todo module until dynamic loading is fixed
try {
  const todoRoutes = require('./modules/1761371865208-todo-module/routes');
  app.use('/api/modules/1761371865208-todo-module', todoRoutes);
  console.log('✅ TEMPORARY: Todo module routes loaded at /api/modules/1761371865208-todo-module');
} catch (error) {
  console.warn('⚠️ Todo module routes not found, skipping temporary route setup');
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Import and initialize models
    const db = require('./database/models');
    const Module = db.Module;

    // Sync database (create tables)
    await sequelize.sync();
    console.log('Database synchronized successfully.');

    // Ensure required directories exist
    fs.ensureDirSync(path.join(__dirname, '../uploads'));
    fs.ensureDirSync(path.join(__dirname, '../modules'));
    fs.ensureDirSync(path.join(__dirname, 'modules'));

    // Load dynamic modules
    loadModules(app);

    // Start server
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  try {
    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
  process.exit(0);
});

startServer();