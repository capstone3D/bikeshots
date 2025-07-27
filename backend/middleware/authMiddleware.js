const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Checking authentication for ${req.method} ${req.url}`);
  const authHeader = req.headers['authorization'];

  // Expected format: "Bearer <token>"
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    console.log(`[${new Date().toISOString()}] No token provided for ${req.method} ${req.url}`);
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[${new Date().toISOString()}] Token verified for user:`, {
      id: user.id,
      username: user.username,
      role: user.role,
    });
    req.user = user; // Attach user info from token to request object
    next();
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Invalid token for ${req.method} ${req.url}:`, err.message);
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

/**
 * Middleware to authorize a specific role
 * @param {string} role - Required role (e.g., 'admin')
 */
const authorizeRole = (role) => (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Checking role '${role}' for user:`, {
    id: req.user?.id,
    username: req.user?.username,
    role: req.user?.role,
  });
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.user.role.toLowerCase() !== role.toLowerCase()) {
    return res.status(403).json({ message: 'Forbidden: insufficient rights' });
  }
  next();
};

/**
 * Middleware to allow multiple roles (e.g., ['admin', 'staff'])
 */
const allowedRoles = (...roles) => (req, res, next) => {
  const allowed = roles.map(r => r.toLowerCase());
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (!allowed.includes(req.user.role.toLowerCase())) {
    return res.status(403).json({ message: 'Forbidden: role not allowed' });
  }
  next();
};

// ✅ Shortcuts for single-role routes
const isAdmin = authorizeRole('admin');
const isStaff = authorizeRole('staff');

module.exports = {
  authenticateToken,
  authorizeRole,
  allowedRoles,
  isAdmin,
  isStaff,
};
