const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { processCheckout } = require('../controllers/checkoutController');

router.post('/', authenticateToken, processCheckout);

module.exports = router;
