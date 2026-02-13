/// Done
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const loginLimiter = require('../middleware/rateLimitMiddleware');

// Register a new user (Restricted to Admins)
router.post('/register', authMiddleware, authController.register);
router.post('/login',loginLimiter, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
