const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = 3001;

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Your MySQL username
  password: 'Rituj@12345', // Your MySQL password
  database: 'CollegeProject', // Your database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database!');
});

app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// API to register a user
app.post('/api/register', async (req, res) => {
  const { first_name, last_name, email, password, department, course, gender } = req.body;

  // Validate inputs
  if (!first_name || !last_name || !email || !password || !department || !course || !gender) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL query to insert user
    const query = 'INSERT INTO users (first_name, last_name, email, password, department, course, gender) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [first_name, last_name, email, hashedPassword, department, course, gender], (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Email already exists!' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'User registered successfully!' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = db;
