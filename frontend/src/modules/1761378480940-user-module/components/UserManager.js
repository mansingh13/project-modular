import React, { useState, useEffect } from 'react';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: '', email: '', age: '' });
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/modules/1761378480940-user-module/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) return;

    try {
      const response = await fetch('http://localhost:3001/api/modules/1761378480940-user-module/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setNewUser({ name: '', email: '', age: '' });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const updateUser = async (id, updates) => {
    try {
      const response = await fetch(`http://localhost:3001/api/modules/1761378480940-user-module/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchUsers();
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/modules/1761378480940-user-module/users/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="user-manager">
      <h2>User Manager</h2>

      {/* Add User Form */}
      <form onSubmit={createUser} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="User name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
            required
          />
          <input
            type="number"
            placeholder="Age"
            value={newUser.age}
            onChange={(e) => setNewUser({ ...newUser, age: e.target.value })}
            style={{ width: '100%', padding: '8px', minHeight: '40px' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
          Add User
        </button>
      </form>

      {/* User List */}
      <div className="user-list">
        {users.length === 0 ? (
          <p>No users yet. Add one above!</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="user-item" style={{
              border: '1px solid #ddd',
              padding: '15px',
              marginBottom: '10px',
              borderRadius: '8px',
              backgroundColor: 'white'
            }}>
              {editingUser === user.id ? (
                <div>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    style={{ width: '100%', padding: '5px', marginBottom: '5px' }}
                  />
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    style={{ width: '100%', padding: '5px', marginBottom: '5px' }}
                  />
                  <input
                    type="number"
                    value={editingUser.age}
                    onChange={(e) => setEditingUser({ ...editingUser, age: e.target.value })}
                    style={{ width: '100%', padding: '5px', minHeight: '30px', marginBottom: '5px' }}
                  />
                  <button onClick={() => updateUser(user.id, editingUser)} style={{ marginRight: '5px' }}>Save</button>
                  <button onClick={() => setEditingUser(null)}>Cancel</button>
                </div>
              ) : (
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>
                    {user.name}
                  </h3>
                  <p style={{ margin: '5px 0', color: '#666' }}>Email: {user.email}</p>
                  <p style={{ margin: '5px 0', color: '#666' }}>Age: {user.age}</p>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={() => setEditingUser(user)} style={{ padding: '4px 8px' }}>Edit</button>
                    <button onClick={() => deleteUser(user.id)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none' }}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserManager;