const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  deleteUser,
  updateUserRole,
} = require('../controllers/adminController');

// Admin dashboard welcome (optional)
router.get('/dashboard', authenticateToken, authorizeRole('admin'), (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard', admin: req.user });
});

// Get all users (admin only)
router.get('/users', authenticateToken, authorizeRole('admin'), getAllUsers);

// Delete a user by ID (admin only)
router.delete('/users/:id', authenticateToken, authorizeRole('admin'), deleteUser);

// Update user role by ID (admin only)
router.patch('/users/:id/role', authenticateToken, authorizeRole('admin'), updateUserRole);

module.exports = router;
