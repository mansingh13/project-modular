const ModuleService = require('../services/moduleService');
const path = require('path');
const fs = require('fs');

class ModuleController {
  async getAllModules(req, res) {
    try {
      const modules = await ModuleService.getAllModules();
      // Return all modules - frontend will handle active/inactive display
      res.json(modules);
    } catch (error) {
      console.error('Error fetching modules:', error);
      res.status(500).json({ error: 'Failed to fetch modules' });
    }
  }

  async uploadModule(req, res) {
    console.log('Upload request received');
    console.log('File:', req.file);

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Send immediate response to prevent connection reset
    res.json({
      message: 'Upload started - processing in background',
      success: true,
      file: req.file.originalname
    });

    // Process upload in background
    try {
      console.log('Calling ModuleService.uploadAndExtractModule');
      const result = await ModuleService.uploadAndExtractModule(req.file);
      console.log('Upload result:', result);
    } catch (error) {
      console.error('Error uploading module:', error);
      // Background processing - no response to send
    }
  }

  async deleteModule(req, res) {
    try {
      const moduleId = req.params.id;
      await ModuleService.deleteModule(moduleId);
      res.json({ message: 'Module removed successfully' });
    } catch (error) {
      console.error('Error deleting module:', error);
      res.status(500).json({ error: 'Failed to delete module' });
    }
  }

  async getModuleById(req, res) {
    try {
      const moduleId = req.params.id;
      const module = await ModuleService.getModuleById(moduleId);

      if (!module) {
        return res.status(404).json({ error: 'Module not found' });
      }

      res.json(module);
    } catch (error) {
      console.error('Error fetching module:', error);
      res.status(500).json({ error: 'Failed to fetch module' });
    }
  }

  async executeModule(req, res) {
    try {
      const moduleId = req.params.id;
      const module = await ModuleService.getModuleById(moduleId);

      if (!module) {
        return res.status(404).json({ error: 'Module not found' });
      }

      // Execute module code - check multiple possible locations
      let modulePath = null;
      const possiblePaths = [];

      if (path.isAbsolute(module.path)) {
        // Handle legacy absolute paths
        possiblePaths.push(path.join(module.path, 'index.js'));
      } else {
        // Handle relative paths - check all possible locations
        possiblePaths.push(
          path.join(__dirname, '../modules', module.path, 'index.js'), // backend/src/modules
          path.join(__dirname, '../../modules', module.path, 'index.js'), // backend/modules
          path.join(__dirname, '../../../frontend/src/modules', module.path, 'index.js') // frontend/src/modules
        );
      }

      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          modulePath = testPath;
          break;
        }
      }

      console.log('Looking for module at possible paths:', possiblePaths);
      console.log('Found module at:', modulePath);
      console.log('Module path from DB:', module.path);

      if (modulePath && fs.existsSync(modulePath)) {
        console.log('Module file exists, executing...');
        try {
          // Clear require cache to allow re-execution
          delete require.cache[require.resolve(modulePath)];
          const moduleCode = require(modulePath);
          console.log('Module executed successfully');

          // If module exports a function, call it
          if (typeof moduleCode === 'function') {
            moduleCode();
          } else if (moduleCode && typeof moduleCode.init === 'function') {
            moduleCode.init();
          }

          res.json({ message: 'Module executed successfully', module: module.name });
        } catch (execError) {
          console.error('Error executing module:', execError);
          res.status(500).json({ error: 'Error executing module code', details: execError.message });
        }
      } else {
        console.log('Module file not found at any location, but module is loaded');
        // For frontend-only modules or modules without executable code
        // Still trigger dynamic loading for frontend components
        if (global.loadModules) {
          global.loadModules();
        }
        res.json({ message: 'Module is loaded and integrated successfully', module: module.name });
      }
    } catch (error) {
      console.error('Error executing module:', error);
      res.status(500).json({ error: 'Failed to execute module' });
    }
  }

  async reloadModules(req, res) {
    try {
      console.log('Reloading modules...');
      if (global.loadModules && global.app) {
        global.loadModules(global.app);
        res.json({ message: 'Modules reloaded successfully' });
      } else {
        res.status(500).json({ error: 'loadModules function or app not available' });
      }
    } catch (error) {
      console.error('Error reloading modules:', error);
      res.status(500).json({ error: 'Failed to reload modules' });
    }
  }

  async toggleModule(req, res) {
    try {
      const moduleId = req.params.id;
      const module = await ModuleService.getModuleById(moduleId);

      if (!module) {
        return res.status(404).json({ error: 'Module not found' });
      }

      // Toggle active status
      const newActiveStatus = !module.active;
      await module.update({ active: newActiveStatus });

      // If deactivating, we might want to unload routes, but for simplicity
      // we'll just hide from frontend and keep routes loaded

      res.json({
        message: `Module ${newActiveStatus ? 'activated' : 'deactivated'} successfully`,
        module: { ...module.toJSON(), active: newActiveStatus }
      });
    } catch (error) {
      console.error('Error toggling module:', error);
      res.status(500).json({ error: 'Failed to toggle module' });
    }
  }
}

module.exports = new ModuleController();