const { EmployeeDocument, EmployeeMaster, EmployeeRecord, User } = require('../models');
const fs = require('fs');
const path = require('path');

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
    console.error('Error fetching documents:', error);
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

    // Check if document of this type already exists, if so maybe update it or delete old? 
    let document = await EmployeeDocument.findOne({
        where: { 
            employee_id: employee.id,
            document_type: documentType
        }
    });

    if (document) {
        // Delete old file if exists
        const oldPath = path.join(__dirname, '..', 'uploads', 'documents', document.file_path);
        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }
        
        await document.update({
            file_path: req.file.filename,
            original_name: req.file.originalname,
            status: 'UPLOADED',
            uploaded_at: new Date()
        });
    } else {
        document = await EmployeeDocument.create({
            employee_id: employee.id,
            document_type: documentType,
            file_path: req.file.filename,
            original_name: req.file.originalname,
            status: 'UPLOADED'
        });
    }

    res.json({ message: 'Document uploaded successfully', document });

  } catch (error) {
    console.error('Error uploading document:', error);
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
    const filePath = path.join(__dirname, '..', 'uploads', 'documents', document.file_path);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    await document.destroy();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
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
        console.error('Error fetching employee documents:', error);
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

    } catch (error) {
        console.error('Error verifying document:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
