const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '2580',
  database: 'todoapp',
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL');
});

// ROUTES

// Get all tasks
app.get('/tasks', (req, res) => {
  db.query('SELECT * FROM tasks ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('❌ Failed to fetch tasks:', err);
      return res.status(500).json({ error: 'Database error while fetching tasks' });
    }
    res.json(results); // ✅ Must be an array
  });
});

// Add new task
app.post('/tasks', (req, res) => {
  const { title, deadline, priority, category, notes, recurring } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.query(
    'INSERT INTO tasks (title, deadline, priority, category, notes, recurring) VALUES (?, ?, ?, ?, ?, ?)',
    [title, deadline, priority, category, notes, recurring],
    (err, result) => {
      if (err) {
        console.error('❌ Failed to add task:', err);
        return res.status(500).json({ error: 'Database error while adding task' });
      }
      res.json({ id: result.insertId, message: 'Task added successfully' });
    }
  );
});

// Update task (including toggle completion or full edit)
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, deadline, priority, category, notes, recurring, completed } = req.body;

  db.query(
    `UPDATE tasks 
     SET title = ?, deadline = ?, priority = ?, category = ?, notes = ?, recurring = ?, completed = IFNULL(?, completed) 
     WHERE id = ?`,
    [title, deadline, priority, category, notes, recurring, completed, id],
    (err) => {
      if (err) {
        console.error('❌ Failed to update task:', err);
        return res.status(500).json({ error: 'Database error while updating task' });
      }
      res.json({ message: 'Task updated successfully' });
    }
  );
});

// Delete task
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM tasks WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('❌ Failed to delete task:', err);
      return res.status(500).json({ error: 'Database error while deleting task' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
