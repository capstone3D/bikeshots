const db = require('../config/db');

/**
 * Get all users from the database (for admin dashboard)
 * @param {function} callback - callback function(err, results)
 */
const getAllUsers = (callback) => {
  const sql = 'SELECT id, username, email, role FROM users';
  db.query(sql, (err, results) => {
    callback(err, results);
  });
};

/**
 * Delete a user by ID
 * @param {number} id
 * @param {function} callback - callback function(err, results)
 */
const deleteUserById = (id, callback) => {
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    callback(err, results);
  });
};

/**
 * Update a user's role by ID
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
  getAllUsers,
  deleteUserById,
  updateUserRoleById,
};
