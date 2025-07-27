// controllers/categoryController.js
const { getAllCategories } = require('../models/categoryModel');

const getCategories = (req, res) => {
  getAllCategories((err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
};

module.exports = {
  getCategories,
};
