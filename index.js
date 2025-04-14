const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 3000;

const db = mysql.createConnection({
  user: 'read_only_user',
  password: '',
  database: 'bob_ross_db',
  socketPath: '/var/run/mysqld/mysqld.sock'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ', err.stack);
    return;
  }
  console.log('Connected to the MySQL database as if', db.threadId);
});

// Route to fetch all episodes (with optional filtering via query params)
app.get('/episodes', (req, res) => {
  // Get query params
  const { season, painting_title, air_date } = req.query;

  // Build base SQL query
  let query = 'SELECT * FROM episode_data WHERE 1=1'; // 1=1 is a placeholder

  // Add filters based on query parameters
  if (season) {
    query += ` AND season = ${mysql.escape(season)}`;
  }
  if (painting_title) {
    query += ` AND painting_title LIKE ${mysql.escape('%' + painting_title + '%')}`;
  }
  if (air_date) {
    query += ` AND air_date = ${mysql.escape(air_date)}`;
  }

  // Run the query
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error running query: ', err.stack);
    }
    // Send results as JSON
    res.json(results);
  });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
