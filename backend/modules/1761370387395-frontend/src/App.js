import React, { useState, useEffect } from 'react';
import ModuleLoader from './components/ModuleLoader';
import './App.css';

function App() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load modules from backend
    fetchModules();
  }, []);

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
          <ModuleLoader modules={modules} onModuleUploaded={fetchModules} />
        )}
      </main>
    </div>
  );
}

export default App;