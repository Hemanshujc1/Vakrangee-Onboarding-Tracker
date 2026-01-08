const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// Route for Admin Welcome Email
router.post('/send-admin-welcome', emailController.sendAdminWelcomeEmail);

// Route for Employee Welcome Email (legacy support or new)
router.post('/send-welcome', emailController.sendEmployeeWelcomeEmail);

module.exports = router;
