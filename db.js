const { Pool } = require('pg');

const pool = new Pool({
  user: 'allcheck_user', // Your database user
  host: 'localhost',
  database: 'allcheck_db', // Your database name
  password: 'Acs@2024', // Your database password
  port: 5432, // Default PostgreSQL port
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err);
  } else {
    console.log('Connected to PostgreSQL database');
  }
});

module.exports = pool;

