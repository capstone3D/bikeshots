const Booking = require('../models/Booking');

// ✅ Create a new booking
exports.createBooking = (req, res) => {
  const { service_category, description, appointment_date, appointment_time } = req.body;

  if (!service_category || !description || !appointment_date || !appointment_time) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // ✅ Validate that the appointment is in the future
  const now = new Date();
  const selectedDateTime = new Date(`${appointment_date}T${appointment_time}:00`);
  if (selectedDateTime <= now) {
    return res.status(400).json({ message: 'Appointment must be in the future' });
  }

  const newBooking = {
    user_id: req.user.id,
    service_category,
    description,
    appointment_date,
    appointment_time
  };

  Booking.create(newBooking, (err, result) => {
    if (err) {
      console.error('Error creating booking:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    return res.status(201).json({
      message: 'Booking created successfully',
      bookingId: result.insertId
    });
  });
};

// ✅ Get bookings for the logged-in user
exports.getUserBookings = (req, res) => {
  Booking.findByUserId(req.user.id, (err, results) => {
    if (err) {
      console.error('Error fetching user bookings:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    return res.json(results);
  });
};

// ✅ Get all bookings (Admin & Staff)
exports.getAllBookings = (req, res) => {
  Booking.findAll((err, results) => {
    if (err) {
      console.error('Error fetching all bookings:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    return res.json(results);
  });
};

// ✅ Get bookings by date for conflict check
exports.getBookingsByDate = (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ message: 'Date query is required' });
  }

  Booking.findByDate(date, (err, results) => {
    if (err) {
      console.error('Error fetching bookings by date:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    return res.json(results);
  });
};

// ✅ Update booking status (Admin only)
exports.updateBookingStatus = (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!['Accepted', 'Declined'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  Booking.updateStatus(id, status, (err) => {
    if (err) {
      console.error('Error updating booking status:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    return res.json({ message: 'Status updated successfully' });
  });
};
