const db = require('../config/db'); // MySQL DB connection

const Booking = {
  // ✅ Create a new booking
  create: (data, callback) => {
    const query = `
      INSERT INTO bookings (user_id, service_category, description, appointment_date, appointment_time, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `;
    db.query(
      query,
      [
        data.user_id,
        data.service_category,
        data.description,
        data.appointment_date,
        data.appointment_time
      ],
      callback
    );
  },

  // ✅ Find bookings by user ID
  findByUserId: (userId, callback) => {
    const query = `
      SELECT * FROM bookings 
      WHERE user_id = ? 
      ORDER BY appointment_date DESC, appointment_time ASC
    `;
    db.query(query, [userId], callback);
  },

  // ✅ Find all bookings (for admin/staff)
  findAll: (callback) => {
    const query = `
      SELECT bookings.*, users.username 
      FROM bookings 
      JOIN users ON bookings.user_id = users.id 
      ORDER BY appointment_date DESC, appointment_time ASC
    `;
    db.query(query, callback);
  },

  // ✅ Find bookings by date (for conflict check)
  findByDate: (date, callback) => {
    const query = `
      SELECT bookings.*, users.username 
      FROM bookings 
      JOIN users ON bookings.user_id = users.id
      WHERE appointment_date = ?
      ORDER BY appointment_time ASC
    `;
    db.query(query, [date], callback);
  },

  // ✅ Update booking status
  updateStatus: (id, status, callback) => {
    const query = `UPDATE bookings SET status = ? WHERE id = ?`;
    db.query(query, [status, id], callback);
  }
};

module.exports = Booking;
