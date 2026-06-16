const {
  EmployeeDocument,
  EmployeeMaster,
  EmployeeRecord,
  User,
} = require("../models");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const logger = require("../utils/logger");
const formHandler = require("../utils/formHandler");
const { resolveVerifierName } = require("../services/userService");

// Get all documents for the logged-in employee
exports.getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const employee = await EmployeeMaster.findOne({
      where: { employee_id: req.user.employee_id },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const documents = await EmployeeDocument.findAll({
      where: { employee_id: employee.employee_id },
    });

    const enhancedDocuments = await Promise.all(
      documents.map(async (doc) => {
        const d = doc.toJSON();
        d.verifiedByName = await resolveVerifierName(doc.verified_by);
        return d;
      }),
    );

    res.json(enhancedDocuments);
  } catch (error) {
    logger.error("Error fetching documents: %o", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload a document
exports.uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const employee = await EmployeeMaster.findOne({
      where: { employee_id: req.user.employee_id },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { documentType } = req.body;
    if (!documentType) {
      return res.status(400).json({ message: "Document type is required" });
    }

    const filename = req.file.filename;
    let finalPath = filename;
    const oldTempPath = req.file.path;

    // Special handling for Profile Photo and Signature
    if (
      documentType === "Passport Size Photo" ||
      documentType === "Signature"
    ) {
      try {
        const isPhoto = documentType === "Passport Size Photo";
        const targetFolder = isPhoto ? "profilepic" : "signatures";
        const prefix = isPhoto ? "user" : "sig";
        const ext = isPhoto ? "jpeg" : "png";
        const newFilename = `${prefix}-${req.user.employee_id}-${Date.now()}.${ext}`;
        const targetDir = path.join(__dirname, "..", "uploads", targetFolder);

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const outputPath = path.join(targetDir, newFilename);

        // Process with sharp
        const transformer = sharp(oldTempPath);
        if (isPhoto) {
          transformer.resize(500, 500).toFormat("jpeg").jpeg({ quality: 90 });
        } else {
          transformer
            .resize({ height: 100 })
            .toFormat("png")
            .png({ quality: 90 });
        }

        await transformer.toFile(outputPath);

        // Delete the temp file from uploads/documents
        if (fs.existsSync(oldTempPath)) {
          try {
            fs.unlinkSync(oldTempPath);
          } catch (unlinkErr) {
            logger.warn("Failed to delete temp upload file: %o", unlinkErr);
          }
        }

        finalPath = newFilename;

        // Update EmployeeRecord
        const employeeRecord = await EmployeeRecord.findOne({
          where: { employee_id: employee.employee_id },
        });
        if (employeeRecord) {
          const oldVal = isPhoto
            ? employeeRecord.profile_photo
            : employeeRecord.signature;
          if (oldVal) {
            const oldFilePath = path.join(
              __dirname,
              "..",
              "uploads",
              targetFolder,
              oldVal,
            );
            if (fs.existsSync(oldFilePath)) {
              try {
                fs.unlinkSync(oldFilePath);
              } catch (unlinkErr) {
                logger.warn(
                  "Failed to delete old profile/sig file: %o",
                  unlinkErr,
                );
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
        return res
          .status(500)
          .json({ message: `Error processing ${documentType}` });
      }
    }

    let document = await EmployeeDocument.findOne({
      where: {
        employee_id: employee.employee_id,
        document_type: documentType,
      },
    });

    if (document) {
      if (
        documentType !== "Passport Size Photo" &&
        documentType !== "Signature"
      ) {
        const oldPath = path.join(
          __dirname,
          "..",
          "uploads",
          "documents",
          document.file_path,
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      await document.update({
        file_path: finalPath,
        original_name: req.file.originalname,
        status: "UPLOADED",
        uploaded_at: new Date(),
      });
    } else {
      document = await EmployeeDocument.create({
        employee_id: employee.employee_id,
        document_type: documentType,
        file_path: finalPath,
        original_name: req.file.originalname,
        status: "UPLOADED",
      });
    }

    try {
      await employee.update({ final_verification_email_sent: false });
    } catch (updateErr) {
      logger.warn(
        "Failed to reset final_verification_email_sent (possible schema mismatch): %o",
        updateErr,
      );
    }
    res.json({ message: "Document uploaded successfully", document });
  } catch (error) {
    logger.error("Error uploading document: %o", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await EmployeeMaster.findOne({
      where: { employee_id: req.user.employee_id },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const document = await EmployeeDocument.findOne({
      where: { id, employee_id: employee.employee_id },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete file from filesystem
    let targetFolder = "documents";
    if (document.document_type === "Passport Size Photo")
      targetFolder = "profilepic";
    else if (document.document_type === "Signature")
      targetFolder = "signatures";

    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      targetFolder,
      document.file_path,
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.destroy();

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    logger.error("Error deleting document: %o", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all documents for a specific employee
exports.getEmployeeDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Basic check if user is HR
    if (req.user.role !== "HR_SUPER_ADMIN" && req.user.role !== "HR_ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const employee = await EmployeeMaster.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const documents = await EmployeeDocument.findAll({
      where: { employee_id: employee.employee_id },
    });

    // Resolve verifier names
    const docsWithNames = await Promise.all(
      documents.map(async (doc) => {
        const docJSON = doc.toJSON();
        if (doc.verified_by) {
          docJSON.verifiedByName = await resolveVerifierName(doc.verified_by);
        }
        return docJSON;
      }),
    );

    res.json(docsWithNames);
  } catch (error) {
    logger.error("Error fetching employee documents: %o", error);
    res.status(500).json({ message: "Server error" });
  }
};

// HR: Verify or Reject Document
exports.verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // status: 'VERIFIED' or 'REJECTED'

    if (req.user.role !== "HR_SUPER_ADMIN" && req.user.role !== "HR_ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const document = await EmployeeDocument.findByPk(id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    await document.update({
      status: status,
      rejection_reason: status === "REJECTED" ? rejectionReason : null,
      verified_at: new Date(),
      verified_by: req.user.employee_id,
    });

    res.json({
      message: `Document ${status.toLowerCase()} successfully`,
      document,
    });
    if (status === "VERIFIED") {
      await formHandler.checkAndUpdateBasicInfoStage(document.employee_id);
    }
  } catch (error) {
    logger.error("Error verifying document: %o", error);
    res.status(500).json({ message: "Server error" });
  }
};
