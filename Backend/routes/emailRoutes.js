const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const protect = require('../middleware/authMiddleware');

// Route for Admin Welcome Email
router.post('/send-admin-welcome', protect, emailController.sendAdminWelcomeEmail);

// Route for Employee Welcome Email 
router.post('/send-welcome', protect, emailController.sendEmployeeWelcomeEmail);

module.exports = router;
