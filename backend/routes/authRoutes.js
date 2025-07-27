const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');

// Register a new user
router.post('/register', register);

// User login
router.post('/login', login);

// Test route to verify auth routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

module.exports = router;
