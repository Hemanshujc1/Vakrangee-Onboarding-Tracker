const { EmployeeDocument, EmployeeMaster, EmployeeRecord, User } = require('../models');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const logger = require('../utils/logger');
const formHandler = require('../utils/formHandler');

// Get all documents for the logged-in employee
exports.getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const employee = await EmployeeMaster.findOne({ where: { employee_id: userId } });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const documents = await EmployeeDocument.findAll({
      where: { employee_id: employee.id }
    });

    const enhancedDocuments = await Promise.all(documents.map(async (doc) => {
        const d = doc.toJSON();
        d.verifiedByName = await resolveVerifierName(doc.verified_by);
        return d;
    }));

    res.json(enhancedDocuments);
  } catch (error) {
    logger.error('Error fetching documents: %o', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload a document
exports.uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const employee = await EmployeeMaster.findOne({ where: { employee_id: userId } });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentType } = req.body;
    if (!documentType) {
        return res.status(400).json({ message: 'Document type is required' });
    }

    const filename = req.file.filename;
    let finalPath = filename;
    const oldTempPath = req.file.path; // Multer diskStorage path

    // Special handling for Profile Photo and Signature
    if (documentType === "Passport Size Photo" || documentType === "Signature") {
        try {
            const isPhoto = documentType === "Passport Size Photo";
            const targetFolder = isPhoto ? 'profilepic' : 'signatures';
            const prefix = isPhoto ? 'user' : 'sig';
            const ext = isPhoto ? 'jpeg' : 'png';
            const newFilename = `${prefix}-${userId}-${Date.now()}.${ext}`;
            const targetDir = path.join(__dirname, '..', 'uploads', targetFolder);
            
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const outputPath = path.join(targetDir, newFilename);

            // Process with sharp
            const transformer = sharp(oldTempPath);
            if (isPhoto) {
                transformer.resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 });
            } else {
                transformer.resize({ height: 100 }).toFormat('png').png({ quality: 90 });
            }
            
            await transformer.toFile(outputPath);
            
            // Delete the temp file from uploads/documents (multer saved it there)
            if (fs.existsSync(oldTempPath)) {
                try {
                    fs.unlinkSync(oldTempPath);
                } catch (unlinkErr) {
                    logger.warn('Failed to delete temp upload file: %o', unlinkErr);
                }
            }

            finalPath = newFilename;

            // Update EmployeeRecord
            const employeeRecord = await EmployeeRecord.findOne({ where: { employee_id: employee.id } });
            if (employeeRecord) {
                // Delete OLD file from its specific folder
                const oldVal = isPhoto ? employeeRecord.profile_photo : employeeRecord.signature;
                if (oldVal) {
                    const oldFilePath = path.join(__dirname, '..', 'uploads', targetFolder, oldVal);
                    if (fs.existsSync(oldFilePath)) {
                        try {
                            fs.unlinkSync(oldFilePath);
                        } catch (unlinkErr) {
                            logger.warn('Failed to delete old profile/sig file: %o', unlinkErr);
                        }
                    }
                }
                
                if (isPhoto) {
                    employeeRecord.profile_photo = finalPath;
                } else {
                    employeeRecord.signature = finalPath;
                }
                await employeeRecord.save();
            }
        } catch (err) {
            logger.error(`Error processing ${documentType}: %o`, err);
            return res.status(500).json({ message: `Error processing ${documentType}` });
        }
    }

    // Check if document of this type already exists, if so maybe update it or delete old? 
    let document = await EmployeeDocument.findOne({
        where: { 
            employee_id: employee.id,
            document_type: documentType
        }
    });

    if (document) {
        // Delete old file if exists (standard documents are in 'documents' folder)
        if (documentType !== "Passport Size Photo" && documentType !== "Signature") {
            const oldPath = path.join(__dirname, '..', 'uploads', 'documents', document.file_path);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
        
        await document.update({
            file_path: finalPath,
            original_name: req.file.originalname,
            status: 'UPLOADED',
            uploaded_at: new Date()
        });
    } else {
        document = await EmployeeDocument.create({
            employee_id: employee.id,
            document_type: documentType,
            file_path: finalPath,
            original_name: req.file.originalname,
            status: 'UPLOADED'
        });
    }

    // Reset final verification email flag so HR can send summary again after resubmission
    try {
        await employee.update({ final_verification_email_sent: false });
    } catch (updateErr) {
        logger.warn('Failed to reset final_verification_email_sent (possible schema mismatch): %o', updateErr);
    }

    // Notify HR - SILENCED for individual documents (HR will be notified on final Submit/Resubmit for Verification)
    // await formHandler.sendHRSubmissionNotification(employee.id, `Document: ${documentType}`);

    res.json({ message: 'Document uploaded successfully', document });

  } catch (error) {
    logger.error('Error uploading document: %o', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const employee = await EmployeeMaster.findOne({ where: { employee_id: userId } });

    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }

    const document = await EmployeeDocument.findOne({
        where: { id, employee_id: employee.id }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file from filesystem
    let targetFolder = 'documents';
    if (document.document_type === "Passport Size Photo") targetFolder = 'profilepic';
    else if (document.document_type === "Signature") targetFolder = 'signatures';

    const filePath = path.join(__dirname, '..', 'uploads', targetFolder, document.file_path);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    await document.destroy();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    logger.error('Error deleting document: %o', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper to resolve verified_by ID to Name
const resolveVerifierName = async (verifierId) => {
    if (!verifierId) return null;
    const user = await User.findByPk(verifierId);
    if (!user) return "Unknown";
    
    const empMaster = await EmployeeMaster.findOne({ where: { employee_id: user.id } });
    if (!empMaster) return user.username;
    
    const empRecord = await EmployeeRecord.findOne({ where: { employee_id: empMaster.id }});
    return empRecord ? `${empRecord.firstname} ${empRecord.lastname}` : user.username;
};

// Get all documents for a specific employee
exports.getEmployeeDocuments = async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        // Basic check if user is HR
        if (req.user.role !== 'HR_SUPER_ADMIN' && req.user.role !== 'HR_ADMIN') {
             return res.status(403).json({ message: 'Access denied' });
        }

        const documents = await EmployeeDocument.findAll({
            where: { employee_id: employeeId }
        });

        // Resolve verifier names
        const docsWithNames = await Promise.all(documents.map(async (doc) => {
            const docJSON = doc.toJSON();
            if (doc.verified_by) {
                docJSON.verifiedByName = await resolveVerifierName(doc.verified_by);
            }
            return docJSON;
        }));

        res.json(docsWithNames);
    } catch (error) {
        logger.error('Error fetching employee documents: %o', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// HR: Verify or Reject Document
exports.verifyDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body; // status: 'VERIFIED' or 'REJECTED'

        if (req.user.role !== 'HR_SUPER_ADMIN' && req.user.role !== 'HR_ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
       }

       const document = await EmployeeDocument.findByPk(id);
       if (!document) {
           return res.status(404).json({ message: 'Document not found' });
       }

       await document.update({
           status: status,
           rejection_reason: status === 'REJECTED' ? rejectionReason : null,
           verified_at: new Date(),
           verified_by: req.user.id
       });

       res.json({ message: `Document ${status.toLowerCase()} successfully`, document });

       // Send Notification - SILENCED for individual documents (Summary sent later)
       // await formHandler.sendVerificationNotification(document.employee_id, document.document_type, status, rejectionReason);

       if (status === 'VERIFIED') {
           await formHandler.checkAndUpdateBasicInfoStage(document.employee_id);
       }

    } catch (error) {
        logger.error('Error verifying document: %o', error);
        res.status(500).json({ message: 'Server error' });
    }
};
