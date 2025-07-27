const {
  getAllUsers,
  deleteUserById,
  updateUserRoleById,
} = require('../models/adminModel');

// Controller to get all users
const getAllUsersController = (req, res) => {
  getAllUsers((err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
};

// Controller to delete a user
const deleteUser = (req, res) => {
  const userId = req.params.id;
  deleteUserById(userId, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
};

// Controller to update user role
const updateUserRole = (req, res) => {
  const id = req.params.id;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: 'Role is required' });
  }

  updateUserRoleById(id, role, (err, result) => {
    if (err) {
      console.error('Failed to update user role:', err);
      return res.status(500).json({ message: 'Failed to update user role' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully' });
  });
};

module.exports = {
  getAllUsers: getAllUsersController,
  deleteUser,
  updateUserRole,
};
