const db = require('../config/db');

/**
 * Create a new user in the database.
 * @param {string} username
 * @param {string} email
 * @param {string} hashedPassword
 * @param {string} role - default 'user'
 * @param {function} callback - callback function(err, results)
 */
const createUser = (username, email, hashedPassword, role = 'user', callback) => {
  const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(sql, [username, email, hashedPassword, role], (err, results) => {
    callback(err, results);
  });
};

/**
 * Find a user by their email address.
 * @param {string} email
 * @param {function} callback - callback function(err, results)
 */
const findUserByEmail = (email, callback) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    callback(err, results);
  });
};

/**
 * Update user role by user ID.
 * @param {number} id
 * @param {string} role
 * @param {function} callback - callback function(err, results)
 */
const updateUserRoleById = (id, role, callback) => {
  const sql = 'UPDATE users SET role = ? WHERE id = ?';
  db.query(sql, [role, id], (err, results) => {
    callback(err, results);
  });
};

module.exports = {
  createUser,
  findUserByEmail,
  updateUserRoleById,
};
