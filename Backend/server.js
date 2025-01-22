const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = 3001;

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', // Your MySQL username
  password: process.env.DB_PASSWORD || 'Rituj@12345', // Your MySQL password
  database: process.env.DB_NAME || 'CollegeProject', // Your database name
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
    // Check if email already exists
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database query error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'Email already exists!' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      const insertQuery =
        'INSERT INTO users (first_name, last_name, email, password, department, course, gender) VALUES (?, ?, ?, ?, ?, ?, ?)';
      db.query(
        insertQuery,
        [first_name, last_name, email, hashedPassword, department, course, gender],
        (err, results) => {
          if (err) {
            return res.status(500).json({ error: 'Database insertion error' });
          }
          res.status(201).json({ message: 'User registered successfully!' });
        }
      );
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
