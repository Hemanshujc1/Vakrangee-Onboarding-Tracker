const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

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
  const uploadDir = path.join(__dirname, '../uploads/profilepic');
  const outputPath = path.join(uploadDir, filename);

  if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
  }

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
    logger.error('Error processing image: %o', error);
    return res.status(500).json({ message: 'Error processing image upload' });
  }
};

// Middleware to resize and save signature
const processSignature = async (req, res, next) => {
  let fileToProcess = req.file;

  if (!fileToProcess && req.files && req.files['signature'] && req.files['signature'].length > 0) {
      fileToProcess = req.files['signature'][0];
  }

  if (!fileToProcess) return next();

  if (!req.user || !req.user.id) {
      logger.warn('Cannot process signature: User not authenticated');
      return res.status(401).json({ message: 'User not authenticated during upload.' });
  }

  // Create unique filename
  const filename = `sig-${req.user.id}-${Date.now()}.png`;
  const uploadDir = path.join(__dirname, '../uploads/signatures');
  
  if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
  }

  const outputPath = path.join(uploadDir, filename);

  try {
    await sharp(fileToProcess.buffer)
      .resize({ height: 100 }) // Resize to reasonable height, maintain aspect ratio
      .toFormat('png')
      .png({ quality: 90 })
      .toFile(outputPath);

    // Attach filename to req.body for controller to save in DB
    
    req.body.signature_path = filename;
    next();
  } catch (error) {
    logger.error('Error processing signature: %o', error);
    return res.status(500).json({ message: 'Error processing signature upload' });
  }
};

module.exports = { upload, resizePhoto, processSignature };
