const express = require('express');
const router = express.Router();

const {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
} = require('../controllers/cartController');

const { authenticateToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateQuantity);
router.delete('/:id', removeItem);

module.exports = router;
