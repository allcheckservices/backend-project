const express = require('express');
const app = express();
const pool = require('./db'); // Import the database connection
const PORT = 3000;

app.use(express.json()); // Middleware to parse JSON bodies

// Sample route to test database connection
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
