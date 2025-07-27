const express = require('express');
const multer = require('multer');
const path = require('path');

const {
  getProducts,
  getProduct,
  addProduct,
  editProduct,
  removeProduct,
} = require('../controllers/productController');

const { authenticateToken, allowedRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // example: 1659356448890.jpg
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, jpeg, png, gif)'));
    }
  },
});

// Routes
router.get('/', getProducts); // Optionally handle category filter in controller
router.get('/:id', getProduct);

// Admin & Staff can add/edit, only Admin can delete
router.post('/', authenticateToken, allowedRoles('admin', 'staff'), upload.single('image'), addProduct);
router.put('/:id', authenticateToken, allowedRoles('admin', 'staff'), upload.single('image'), editProduct);
router.delete('/:id', authenticateToken, allowedRoles('admin'), removeProduct);

module.exports = router;