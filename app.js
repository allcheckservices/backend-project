require('dotenv').config(); // Add this at the top of your app.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db'); // Import the database connection

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET; // Load the JWT secret from the .env file

app.use(express.json());

// ... rest of the code remains the same ...


// User registration route
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if the user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the new user to the database
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error('Error registering user', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT
    const token = jwt.sign({ id: user.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error('Error logging in', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to verify the token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Expecting "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Protected route to get all users
app.get('/users', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
