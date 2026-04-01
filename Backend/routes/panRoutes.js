const express = require('express');
const router = express.Router();
const panController = require('../controllers/panController');

router.post('/verify', panController.verifyPan);

module.exports = router;
