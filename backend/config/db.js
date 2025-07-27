const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const {
  DB_HOST = 'capstone',
  DB_USER = 'chris_database',
  DB_PASSWORD = 'bikeshots',
  DB_NAME = 'bikeshots_bikeshop',
} = process.env;

const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database.');
});

module.exports = db;
