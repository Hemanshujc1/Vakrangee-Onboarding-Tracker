const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer  
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(__dirname, '../uploads/documents');
      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      // Create unique filename: docType-timestamp-originalExt
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetypes = /image\/jpeg|image\/png|application\/pdf/;
        const mimetype = mimetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: File upload only supports: " + filetypes));
    }
});

// Employee Routes
router.get('/', authMiddleware, documentController.getDocuments);
router.post('/upload', authMiddleware, upload.single('file'), documentController.uploadDocument);
router.delete('/:id', authMiddleware, documentController.deleteDocument);

// HR Routes
router.get('/list/:employeeId', authMiddleware, documentController.getEmployeeDocuments);
router.post('/verify/:id', authMiddleware, documentController.verifyDocument);

module.exports = router;
