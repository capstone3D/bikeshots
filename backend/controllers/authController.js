const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const { createUser, findUserByEmail } = require(path.resolve(__dirname, '../models/userModel'));

// Helper to wrap callbacks in Promises for async/await
const findUserByEmailAsync = (email) =>
  new Promise((resolve, reject) =>
    findUserByEmail(email, (err, users) => (err ? reject(err) : resolve(users)))
  );

const createUserAsync = (username, email, hashedPassword, role) =>
  new Promise((resolve, reject) =>
    createUser(username, email, hashedPassword, role, (err, result) =>
      err ? reject(err) : resolve(result)
    )
  );

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email, and password' });
    }

    const users = await findUserByEmailAsync(email);
    if (users.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createUserAsync(username, email, hashedPassword, 'user');

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const users = await findUserByEmailAsync(email);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      token,
      user: payload,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = {
  register,
  login,
};
