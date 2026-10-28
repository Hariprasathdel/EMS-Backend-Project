const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  changePassword,
  logout,
} = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user & return JWT
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get logged-in user profile + linked employee
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/change-password
// @desc    Change own password
// @access  Private
router.put('/change-password', protect, changePassword);

// @route   POST /api/auth/logout
// @desc    Logout (client discards token)
// @access  Private
router.post('/logout', protect, logout);

module.exports = router;
