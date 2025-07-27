const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

// ✅ Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} - Body:`,
    req.body
  );
  next();
});

// ✅ Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Multer setup for handling image/file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ✅ Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const orderRoutes = require('./routes/orderRoutes');
const bookingRoutes = require('./routes/bookingRoutes'); // ✅ NEW

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes); // ✅ NEW booking routes

// ✅ Debug route
app.post('/test-body', (req, res) => {
  console.log('Received body:', req.body);
  res.json({ message: 'Body received successfully', body: req.body });
});

// ✅ Base Route
app.get('/', (req, res) => {
  res.send('Welcome to BIKESHOTS backend!');
});

// ✅ Catch-All 404 Handler
app.use((req, res) => {
  console.log(
    `[${new Date().toISOString()}] 404 - Unmatched route: ${req.method} ${req.url}`
  );
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Server error:`, err);
  res.status(500).json({ message: 'Server error' });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
