const { updateUserRoleById } = require('../models/userModel');

const updateUserRole = (req, res) => {
  const id = req.params.id;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: 'Role is required' });
  }

  // Optional: Validate role value here if needed, e.g. only allow 'staff' or 'admin'

  updateUserRoleById(id, role, (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'User not found' });
    res.json({ message: `User role updated to ${role}` });
  });
};

module.exports = {
  // ... other exports
  updateUserRole,
};
