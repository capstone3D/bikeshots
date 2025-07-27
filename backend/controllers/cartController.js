const {
  getCartByUserId,
  addOrUpdateCartItem,
  updateCartItemQuantity,
  removeCartItem,
} = require('../models/cartModel');

const getCart = (req, res) => {
  const userId = req.user.id; // Assuming user is authenticated and user info in req.user
  getCartByUserId(userId, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(results);
  });
};

const addToCart = (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  if (!productId || !quantity) return res.status(400).json({ message: 'ProductId and quantity are required' });

  addOrUpdateCartItem(userId, productId, quantity, (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json({ message: 'Product added to cart successfully' });
  });
};

const updateQuantity = (req, res) => {
  const cartItemId = req.params.id;
  const { quantity } = req.body;
  if (quantity == null) return res.status(400).json({ message: 'Quantity is required' });

  updateCartItemQuantity(cartItemId, quantity, (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json({ message: 'Quantity updated successfully' });
  });
};

const removeItem = (req, res) => {
  const cartItemId = req.params.id;
  removeCartItem(cartItemId, (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json({ message: 'Item removed from cart successfully' });
  });
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
};
