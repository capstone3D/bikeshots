const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const {
  authenticateToken,
  allowedRoles,
  isAdmin
} = require('../middleware/authMiddleware');

// ✅ User Routes
router.post('/', authenticateToken, bookingController.createBooking);
router.get('/my-bookings', authenticateToken, bookingController.getUserBookings);

// ✅ Check conflicts for a date
router.get('/conflicts', authenticateToken, bookingController.getBookingsByDate);

// ✅ Admin & Staff Routes
router.get('/', authenticateToken, allowedRoles('admin', 'staff'), bookingController.getAllBookings);
router.put('/:id/status', authenticateToken, isAdmin, bookingController.updateBookingStatus);

module.exports = router;
