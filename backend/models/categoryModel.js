// models/categoryModel.js
const db = require('../config/db');

const getAllCategories = (callback) => {
  const sql = 'SELECT * FROM categories ORDER BY name ASC';
  db.query(sql, callback);
};

module.exports = {
  getAllCategories,
};
