import React, { useState, useEffect } from 'react';
import ModuleLoader from './components/ModuleLoader';
import './App.css';

// Dynamic module loading
const loadModuleComponents = async () => {
  const modulesPath = './modules';
  const components = {};

  try {
    // Get list of module directories
    const response = await fetch('http://localhost:3001/api/modules');
    const modules = await response.json();

    // Filter active modules and sort by creation date (newest first)
    const activeModules = modules.filter(module => module.active !== false);
    const latestModule = activeModules.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    if (latestModule) {
      try {
        const moduleName = latestModule.path;
        const modulePath = `${modulesPath}/${moduleName}`;

        console.log(`Loading latest module: ${moduleName}`);

        // Try to load components dynamically
        try {
          const moduleComponents = await import(modulePath + '/components/index.js');
          components[moduleName] = moduleComponents;
          console.log(`Loaded components for latest module: ${moduleName}`);
        } catch (e) {
          // Try alternative paths
          try {
            const altComponents = await import(modulePath + '/components/TodoManager.js');
            components[moduleName] = { default: altComponents.default };
            console.log(`Loaded TodoManager for latest module: ${moduleName}`);
          } catch (e2) {
            console.warn(`No components found for latest module ${moduleName}`);
          }
        }
      } catch (error) {
        console.warn(`Failed to load components for latest module ${latestModule.name}:`, error);
      }
    }
  } catch (error) {
    console.warn('Error loading module components:', error);
  }

  return components;
};

function App() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleComponents, setModuleComponents] = useState({});

  useEffect(() => {
    // Load modules from backend
    fetchModules();
    // Load module components
    loadModuleComponents().then(setModuleComponents);
  }, []);

  // Reload components when modules change
  useEffect(() => {
    if (modules.length > 0) {
      loadModuleComponents().then(setModuleComponents);
    }
  }, [modules]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/modules');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setModules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading modules:', error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Modular Project Frontend</h1>
        <p>Upload and manage zip-based modules</p>
      </header>
      <main>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading modules...</div>
        ) : (
          <>
            <ModuleLoader modules={modules} onModuleUploaded={fetchModules} />
            {/* Render dynamic module components - only latest one */}
            {Object.keys(moduleComponents).map(moduleName => {
              const ModuleComponent = moduleComponents[moduleName]?.default || moduleComponents[moduleName];
              return ModuleComponent ? (
                <div key={moduleName} className="module-section">
                  <h3>Latest Module: {moduleName}</h3>
                  <ModuleComponent modules={modules} onModuleUploaded={fetchModules} />
                </div>
              ) : null;
            })}
          </>
        )}
      </main>
    </div>
  );
}

export default App;