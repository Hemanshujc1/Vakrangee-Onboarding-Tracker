const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { upload, resizePhoto, processSignature } = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, profileController.getProfile);

router.put('/', 
  authMiddleware, 
  upload.fields([{ name: 'profile_photo', maxCount: 1 }, { name: 'signature', maxCount: 1 }]), 
  resizePhoto,
  processSignature, 
  profileController.updateProfile
);

module.exports = router;
