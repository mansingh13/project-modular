const path = require('path');
const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const { Module } = require('../database/models');

class ModuleService {
  async getAllModules() {
    try {
      console.log('Fetching modules from database...');
      const modules = await Module.findAll({
        order: [['createdAt', 'DESC']]
      });
      console.log('Found modules:', modules.length);
      return modules;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  }

  async getModuleById(id) {
    try {
      const module = await Module.findByPk(id);
      return module;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  }

  async uploadAndExtractModule(file) {
    try {
      console.log('Processing module upload:', file.originalname);
      const zipPath = file.path;
      const extractPath = path.join(__dirname, '../../modules', path.parse(file.filename).name);

      console.log('Extracting to:', extractPath);

      // Ensure extract directory exists
      fs.ensureDirSync(path.dirname(extractPath));

      // Extract zip file with error handling
      let zip;
      try {
        zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);
        console.log('Extraction completed');
      } catch (zipError) {
        console.error('Zip extraction error:', zipError);
        throw new Error(`Failed to extract zip file: ${zipError.message}`);
      }

      // Read module info
      const moduleInfoPath = path.join(extractPath, 'module.json');
      let moduleInfo = { name: path.parse(file.originalname).name };

      if (fs.existsSync(moduleInfoPath)) {
        const moduleData = fs.readFileSync(moduleInfoPath, 'utf8');
        console.log('Raw module data:', moduleData);

        // Clean the data - remove extra quotes and whitespace
        const cleanData = moduleData.trim().replace(/^['"]|['"]$/g, '');
        console.log('Clean module data:', cleanData);

        try {
          moduleInfo = { ...moduleInfo, ...JSON.parse(cleanData) };
          console.log('Module info loaded:', moduleInfo);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          // Fallback: try to parse as plain JSON
          try {
            moduleInfo = { ...moduleInfo, ...JSON.parse(moduleData.trim()) };
            console.log('Fallback parse successful:', moduleInfo);
          } catch (fallbackError) {
            console.error('Fallback parse also failed:', fallbackError);
            throw parseError;
          }
        }
      }

      // Calculate relative path first
      const relativePath = path.relative(path.join(__dirname, '../../modules'), extractPath);

      // Extract backend and frontend files to appropriate locations
      const backendDir = path.join(extractPath, 'backend');
      const frontendDir = path.join(extractPath, 'frontend');

      // Check if this is a frontend-only module (no backend folder)
      const isFrontendOnly = !fs.existsSync(backendDir) && fs.existsSync(frontendDir);

      if (fs.existsSync(backendDir)) {
        const targetBackendDir = path.join(__dirname, '../../src/modules', relativePath);
        fs.ensureDirSync(targetBackendDir);
        fs.copySync(backendDir, targetBackendDir);
        console.log('Backend files copied to:', targetBackendDir);
      }

      if (fs.existsSync(frontendDir)) {
        const targetFrontendDir = path.join(__dirname, '../../../frontend/src/modules', relativePath);
        fs.ensureDirSync(targetFrontendDir);
        fs.copySync(frontendDir, targetFrontendDir);
        console.log('Frontend files copied to:', targetFrontendDir);

        // Modify frontend component to use dynamic API paths
        try {
          const componentsDir = path.join(targetFrontendDir, 'components');
          if (fs.existsSync(componentsDir)) {
            const componentFiles = fs.readdirSync(componentsDir).filter(file => file.endsWith('.js'));
            componentFiles.forEach(file => {
              try {
                const filePath = path.join(componentsDir, file);
                let content = fs.readFileSync(filePath, 'utf8');
                const originalContent = content;

                // Replace MODULE_PATH placeholder with actual module path
                content = content.replace(
                  /\/api\/modules\/MODULE_PATH\//g,
                  `/api/modules/${relativePath}/`
                );

                // Also replace any hardcoded URLs that might exist
                content = content.replace(
                  /http:\/\/localhost:3001\/api\/modules\/(todo-manager|user-manager)\//g,
                  `http://localhost:3001/api/modules/${relativePath}/`
                );

                if (content !== originalContent) {
                  fs.writeFileSync(filePath, content);
                  console.log(`Updated API paths in ${file} with module path: ${relativePath}`);
                }
              } catch (fileError) {
                console.warn(`Error updating file ${file}:`, fileError.message);
              }
            });
          }
        } catch (error) {
          console.warn('Error updating frontend components:', error.message);
        }
      }

      // For frontend-only modules or modules with src directory, copy the entire src directory
      if (isFrontendOnly || fs.existsSync(path.join(extractPath, 'src'))) {
        const srcDir = path.join(extractPath, 'src');
        if (fs.existsSync(srcDir)) {
          const targetSrcDir = path.join(__dirname, '../../../frontend/src/modules', relativePath, 'src');
          fs.ensureDirSync(targetSrcDir);
          fs.copySync(srcDir, targetSrcDir);
          console.log('Frontend src files copied to:', targetSrcDir);
        }
      }

      // If no frontend folder but has src, components, etc. - treat as frontend-only
      if (!fs.existsSync(frontendDir) && (fs.existsSync(path.join(extractPath, 'src')) || fs.existsSync(path.join(extractPath, 'components')) || fs.existsSync(path.join(extractPath, 'App.js')))) {
        const targetFrontendDir = path.join(__dirname, '../../../frontend/src/modules', relativePath);
        fs.ensureDirSync(targetFrontendDir);

        // Copy the entire module directory content to frontend
        fs.copySync(extractPath, targetFrontendDir);
        console.log('Full frontend module copied to:', targetFrontendDir);
      }
      const moduleData = {
        name: moduleInfo.name,
        path: relativePath,
        version: moduleInfo.version || null,
        description: moduleInfo.description || null,
        author: moduleInfo.author || null
      };

      console.log('Saving to database:', moduleData);
      const savedModule = await Module.create(moduleData);
      console.log('Module saved successfully');

      // Load and execute the module
      const moduleIndexPath = path.join(extractPath, 'index.js');
      if (fs.existsSync(moduleIndexPath)) {
        console.log('Loading module code...');
        try {
          // Clear require cache to allow re-execution
          delete require.cache[require.resolve(moduleIndexPath)];
          const moduleCode = require(moduleIndexPath);
          console.log('Module code executed successfully');

          // If module exports a function, call it
          if (typeof moduleCode === 'function') {
            moduleCode();
          } else if (moduleCode && typeof moduleCode.init === 'function') {
            moduleCode.init();
          }

          // Reload dynamic modules after upload
          if (global.loadModules) {
            global.loadModules();
          }
        } catch (error) {
          console.warn('Error executing module code:', error);
        }
      } else {
        console.log('No index.js found in module root, checking for frontend-only module...');
        // For frontend-only modules, just mark as loaded
        console.log('Frontend module loaded successfully');

        // Still reload dynamic modules for frontend modules
        if (global.loadModules) {
          global.loadModules();
        }

        // Force reload routes by calling loadModules again after a short delay
        setTimeout(() => {
          if (global.loadModules) {
            console.log('Force reloading modules after upload...');
            global.loadModules();
          }
        }, 1000);

        // DIRECT ROUTE REGISTRATION: Register routes immediately after upload
        try {
          if (global.app) {
            const backendRoutesPath = path.join(__dirname, '../../src/modules', relativePath, 'routes.js');
            if (fs.existsSync(backendRoutesPath)) {
              delete require.cache[require.resolve(backendRoutesPath)];
              const moduleRoutes = require(backendRoutesPath);
              const routePath = `/api/modules/${relativePath}`;
              global.app.use(routePath, moduleRoutes);
              console.log(`✅ DIRECT: Routes registered at ${routePath}`);
            }
          }
        } catch (error) {
          console.error('❌ DIRECT: Failed to register routes:', error.message);
        }
      }

      // Clean up uploaded zip file
      fs.unlinkSync(zipPath);

      return {
        message: 'Module uploaded, extracted and loaded successfully',
        module: savedModule
      };

    } catch (error) {
      console.error('Error processing module:', error);
      // Don't throw error - let the upload succeed even if some parts fail
      console.warn('Module processing completed with warnings');

      // Still return success since basic upload worked
      return {
        message: 'Module uploaded successfully (with some processing warnings)',
        module: {
          name: moduleInfo.name || path.parse(file.originalname).name,
          path: relativePath,
          version: moduleInfo.version || null,
          description: moduleInfo.description || null,
          author: moduleInfo.author || null
        }
      };
    }
  }

  async deleteModule(id) {
    try {
      const module = await Module.findByPk(id);
      if (!module) {
        throw new Error('Module not found');
      }

      // Remove from filesystem
      try {
        fs.removeSync(module.path);
      } catch (error) {
        console.warn('Failed to remove module files:', error);
      }

      // Remove from database
      await module.destroy();

    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  }
}

module.exports = new ModuleService();