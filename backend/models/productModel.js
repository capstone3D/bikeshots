const db = require('../config/db');

// Get all products with their category names
const getAllProducts = (callback) => {
  const sql = `
    SELECT 
      products.*, 
      categories.name AS category
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
  `;
  console.log(`[${new Date().toISOString()}] Executing query: ${sql}`);
  db.query(sql, (err, results) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error fetching all products:`, err);
      return callback(err, null);
    }
    // Calculate is_out_of_stock in code
    const products = results.map(product => ({
      ...product,
      is_out_of_stock: product.quantity === 0 ? 1 : 0
    }));
    console.log(`[${new Date().toISOString()}] Fetched ${products.length} products`);
    callback(null, products);
  });
};

// Get products by category ID
const getProductsByCategory = (categoryId, callback) => {
  const sql = `
    SELECT 
      products.*, 
      categories.name AS category
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
    WHERE products.category_id = ?
  `;
  console.log(`[${new Date().toISOString()}] Executing query: ${sql} with params:`, [categoryId]);
  db.query(sql, [categoryId], (err, results) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error fetching products for category ${categoryId}:`, err);
      return callback(err, null);
    }
    // Calculate is_out_of_stock in code
    const products = results.map(product => ({
      ...product,
      is_out_of_stock: product.quantity === 0 ? 1 : 0
    }));
    console.log(`[${new Date().toISOString()}] Fetched ${products.length} products for category ${categoryId}`);
    callback(null, products);
  });
};

// Get a single product by ID
const getProductById = (id, callback) => {
  const sql = `
    SELECT 
      products.*, 
      categories.name AS category
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
    WHERE products.id = ?
  `;
  console.log(`[${new Date().toISOString()}] Executing query: ${sql} with params:`, [id]);
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error fetching product ${id}:`, err);
      return callback(err, null);
    }
    // Calculate is_out_of_stock in code
    const products = results.map(product => ({
      ...product,
      is_out_of_stock: product.quantity === 0 ? 1 : 0
    }));
    console.log(`[${new Date().toISOString()}] Fetched product ${id}:`, products.length ? 'Found' : 'Not found');
    callback(null, products);
  });
};

// Create a new product (with quantity)
const createProduct = (name, price, description, image, category_id, quantity, callback) => {
  const sql = 'INSERT INTO products (name, price, description, image, category_id, quantity) VALUES (?, ?, ?, ?, ?, ?)';
  console.log(`[${new Date().toISOString()}] Executing query: ${sql} with params:`, [name, price, description, image, category_id, quantity]);
  db.query(sql, [name, price, description, image, category_id, quantity], (err, result) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error creating product:`, err);
      return callback(err, null);
    }
    console.log(`[${new Date().toISOString()}] Created product with ID ${result.insertId}`);
    callback(null, result);
  });
};

// Update a product (optionally with image)
const updateProduct = (id, name, price, description, image, category_id, quantity, callback) => {
  console.log(`[${new Date().toISOString()}] Updating product ${id}`);
  if (image) {
    const sql = 'UPDATE products SET name = ?, price = ?, description = ?, image = ?, category_id = ?, quantity = ? WHERE id = ?';
    db.query(sql, [name, price, description, image, category_id, quantity, id], (err, result) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Error updating product ${id}:`, err);
        return callback(err, null);
      }
      console.log(`[${new Date().toISOString()}] Updated product ${id}: Affected rows ${result.affectedRows}`);
      callback(null, result);
    });
  } else {
    const sql = 'UPDATE products SET name = ?, price = ?, description = ?, category_id = ?, quantity = ? WHERE id = ?';
    db.query(sql, [name, price, description, category_id, quantity, id], (err, result) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Error updating product ${id}:`, err);
        return callback(err, null);
      }
      console.log(`[${new Date().toISOString()}] Updated product ${id}: Affected rows ${result.affectedRows}`);
      callback(null, result);
    });
  }
};

// Delete a product by ID
const deleteProduct = (id, callback) => {
  const sql = 'DELETE FROM products WHERE id = ?';
  console.log(`[${new Date().toISOString()}] Executing query: ${sql} with params:`, [id]);
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error deleting product ${id}:`, err);
      return callback(err, null);
    }
    console.log(`[${new Date().toISOString()}] Deleted product ${id}: Affected rows ${result.affectedRows}`);
    callback(null, result);
  });
};

// Decrease product quantity when order is approved
const decreaseProductQuantity = (productId, quantity, connection, callback) => {
  const query = `
    UPDATE products
    SET quantity = quantity - ?
    WHERE id = ? AND quantity >= ?
  `;
  console.log(`[${new Date().toISOString()}] Executing query: ${query} with params:`, [quantity, productId, quantity]);
  (connection || db).query(query, [quantity, productId, quantity], (err, result) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error decreasing quantity for product ${productId}:`, err);
      return callback(err, null);
    }
    if (result.affectedRows === 0) {
      console.error(`[${new Date().toISOString()}] No rows updated for product ${productId}. Product not found or quantity < ${quantity}`);
      return callback(new Error('Not enough stock or product not found'), null);
    }
    console.log(`[${new Date().toISOString()}] Successfully decreased quantity for product ${productId}. Affected rows: ${result.affectedRows}`);
    // Check new quantity to determine stock status
    const checkQuery = 'SELECT quantity FROM products WHERE id = ?';
    (connection || db).query(checkQuery, [productId], (err, results) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Error checking quantity for product ${productId}:`, err);
        return callback(err, null);
      }
      const newQuantity = results[0].quantity;
      const isOutOfStock = newQuantity === 0 ? 1 : 0;
      console.log(`[${new Date().toISOString()}] Product ${productId} new quantity: ${newQuantity}, is_out_of_stock: ${isOutOfStock}`);
      callback(null, { ...result, is_out_of_stock: isOutOfStock });
    });
  });
};

module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  decreaseProductQuantity,
};