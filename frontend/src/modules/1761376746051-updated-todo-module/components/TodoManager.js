import React, { useState, useEffect } from 'react';

const TodoManager = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });
  const [editingTodo, setEditingTodo] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/modules/1761376746051-updated-todo-module/todos');
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    try {
      const response = await fetch('http://localhost:3001/api/modules/1761376746051-updated-todo-module/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTodo),
      });

      if (response.ok) {
        setNewTodo({ title: '', description: '' });
        fetchTodos();
      }
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const response = await fetch(`http://localhost:3001/api/modules/1761376746051-updated-todo-module/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchTodos();
        setEditingTodo(null);
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/modules/1761376746051-updated-todo-module/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const toggleComplete = (todo) => {
    updateTodo(todo.id, { ...todo, completed: !todo.completed });
  };

  if (loading) {
    return <div>Loading todos...</div>;
  }

  return (
    <div className="todo-manager">
      <h2>Todo Manager</h2>

      {/* Add Todo Form */}
      <form onSubmit={createTodo} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Todo title"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={newTodo.description}
            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
            style={{ width: '100%', padding: '8px', minHeight: '60px' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
          Add Todo
        </button>
      </form>

      {/* Todo List */}
      <div className="todo-list">
        {todos.length === 0 ? (
          <p>No todos yet. Add one above!</p>
        ) : (
          todos.map((todo) => (
            <div key={todo.id} className="todo-item" style={{
              border: '1px solid #ddd',
              padding: '15px',
              marginBottom: '10px',
              borderRadius: '8px',
              backgroundColor: todo.completed ? '#f8f9fa' : 'white'
            }}>
              {editingTodo === todo.id ? (
                <div>
                  <input
                    type="text"
                    value={editingTodo.title}
                    onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                    style={{ width: '100%', padding: '5px', marginBottom: '5px' }}
                  />
                  <textarea
                    value={editingTodo.description}
                    onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                    style={{ width: '100%', padding: '5px', minHeight: '40px', marginBottom: '5px' }}
                  />
                  <button onClick={() => updateTodo(todo.id, editingTodo)} style={{ marginRight: '5px' }}>Save</button>
                  <button onClick={() => setEditingTodo(null)}>Cancel</button>
                </div>
              ) : (
                <div>
                  <h3 style={{ textDecoration: todo.completed ? 'line-through' : 'none', margin: '0 0 5px 0' }}>
                    {todo.title}
                  </h3>
                  {todo.description && (
                    <p style={{ margin: '5px 0', color: '#666' }}>{todo.description}</p>
                  )}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleComplete(todo)}
                      />
                      Completed
                    </label>
                    <button onClick={() => setEditingTodo(todo)} style={{ padding: '4px 8px' }}>Edit</button>
                    <button onClick={() => deleteTodo(todo.id)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none' }}>Delete</button>
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

export default TodoManager;