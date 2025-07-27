const db = require('../config/db');

// Get cart items for a user
const getCartByUserId = (userId, callback) => {
  const sql = `
    SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image, p.description
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `;
  db.query(sql, [userId], callback);
};

// Add or update cart item
const addOrUpdateCartItem = (userId, productId, quantity, callback) => {
  const sql = `
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
  `;
  db.query(sql, [userId, productId, quantity], callback);
};

// Update cart item quantity
const updateCartItemQuantity = (cartItemId, quantity, callback) => {
  const sql = `UPDATE cart_items SET quantity = ? WHERE id = ?`;
  db.query(sql, [quantity, cartItemId], callback);
};

// Remove item from cart
const removeCartItem = (cartItemId, callback) => {
  const sql = `DELETE FROM cart_items WHERE id = ?`;
  db.query(sql, [cartItemId], callback);
};

module.exports = {
  getCartByUserId,
  addOrUpdateCartItem,
  updateCartItemQuantity,
  removeCartItem,
};
