const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

//  Multer for memory storage
const storage = multer.memoryStorage();

// Filter for image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit  
});

// Middleware to resize and save image
const resizePhoto = async (req, res, next) => {
  if (!req.file) return next();

  // Create unique filename
  const filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  const outputPath = path.join(__dirname, '../uploads/profilepic', filename);

  try {
    await sharp(req.file.buffer)
      .resize(500, 500) // Resize to 500x500 square
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    // Attach filename to req.body for controller to save in DB
    req.body.profile_photo = filename;
    next();
  } catch (error) {
    console.error('Error processing image:', error);
    return res.status(500).json({ message: 'Error processing image upload' });
  }
};

module.exports = { upload, resizePhoto };
