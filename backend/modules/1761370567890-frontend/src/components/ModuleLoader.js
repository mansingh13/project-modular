import React, { useState } from 'react';

const ModuleLoader = ({ modules, onModuleUploaded }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const executeModule = async (moduleId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/modules/${moduleId}/execute`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Module executed successfully!');
      } else {
        alert('Failed to execute module');
      }
    } catch (error) {
      console.error('Execute error:', error);
      alert('Error executing module');
    }
  };

  const deleteModule = async (moduleId) => {
    if (!confirm('Are you sure you want to delete this module?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/modules/${moduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Module deleted successfully!');
        if (onModuleUploaded) {
          onModuleUploaded();
        }
      } else {
        alert('Failed to delete module');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting module');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Accept both mime types for zip files
      if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.endsWith('.zip')) {
        setSelectedFile(file);
        await uploadModule(file);
      } else {
        alert('Please select a valid .zip file');
      }
    }
  };

  const uploadModule = async (file) => {
    const formData = new FormData();
    formData.append('module', file);

    try {
      const response = await fetch('http://localhost:3001/api/modules/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Module uploaded successfully!');
        // Refresh modules list
        if (onModuleUploaded) {
          onModuleUploaded();
        }
      } else {
        alert('Failed to upload module');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading module');
    }
  };

  return (
    <div className="module-loader">
      <h2>Module Management</h2>

      <div className="upload-section">
        <h3>Upload New Module</h3>
        <p>Select a .zip file containing your module</p>
        <input
          type="file"
          accept=".zip"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label
          htmlFor="file-input"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            margin: '10px 0',
            transition: 'background-color 0.2s',
            boxShadow: '0 2px 4px rgba(0,123,255,0.2)'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          📁 Choose Module File
        </label>
        {selectedFile && (
          <div style={{ marginTop: '10px' }}>
            <p><strong>Selected:</strong> {selectedFile.name}</p>
            <p><em>Uploading...</em></p>
          </div>
        )}
      </div>

      <div className="modules-list">
        <h3>Loaded Modules ({modules.length})</h3>
        {modules.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No modules loaded yet. Upload a .zip file to get started.</p>
        ) : (
          <div className="modules-grid">
            {modules.map((module, index) => (
              <div key={module.id || index} className="module-card">
                <h4>{module.name}</h4>
                {module.version && <p><strong>Version:</strong> {module.version}</p>}
                {module.description && <p>{module.description}</p>}
                {module.author && <p><em>By {module.author}</em></p>}
                <small>Uploaded: {new Date(module.createdAt || module.uploadedAt).toLocaleDateString()}</small>
                <div style={{ marginTop: '10px' }}>
                  <button
                    onClick={() => executeModule(module.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      marginRight: '5px'
                    }}
                  >
                    Execute
                  </button>
                  <button
                    onClick={() => deleteModule(module.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleLoader;