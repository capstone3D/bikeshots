const {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../models/productModel');

const getProducts = (req, res) => {
  const categoryId = req.query.category_id; // match frontend query param

  const callback = (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  };

  if (categoryId) {
    getProductsByCategory(categoryId, callback);
  } else {
    getAllProducts(callback);
  }
};

const getProduct = (req, res) => {
  const id = req.params.id;
  getProductById(id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(results[0]);
  });
};

const addProduct = (req, res) => {
  const { name, price, description, category_id, quantity } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || price === undefined || !category_id || quantity === undefined) {
    return res.status(400).json({ message: 'Name, price, category, and quantity are required' });
  }

  createProduct(name, price, description || null, image, category_id, quantity, (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(201).json({ message: 'Product created', id: result.insertId });
  });
};

const editProduct = (req, res) => {
  const id = req.params.id;
  const { name, price, description, category_id, quantity } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || price === undefined || !category_id || quantity === undefined) {
    return res.status(400).json({ message: 'Name, price, category, and quantity are required' });
  }

  updateProduct(id, name, price, description || null, image, category_id, quantity, (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product updated' });
  });
};

const removeProduct = (req, res) => {
  const id = req.params.id;
  deleteProduct(id, (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  });
};

module.exports = {
  getProducts,
  getProduct,
  addProduct,
  editProduct,
  removeProduct,
};