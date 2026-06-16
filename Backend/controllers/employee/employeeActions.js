const logger = require("../../utils/logger");
const documentExportService = require("../../services/employee/documentExportService");
const reminderService = require("../../services/employee/reminderService");

// Download selected candidate documents and forms as a structured ZIP file
exports.downloadDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedFiles } = req.body;
    
    const authHeader = req.headers.authorization || "";
    const authToken = authHeader.replace("Bearer ", "").trim();

    await documentExportService.exportDocumentsToZip(id, selectedFiles, authToken, res);
  } catch (error) {
    logger.error("Error in downloadDocuments API: %o", error);
    if (!res.headersSent) {
      const status = error.message === "Employee profile not found" ? 404 : 500;
      res.status(status).json({ message: error.message || "Server error generating zip file" });
    }
  }
};

// Send Reminder Email
exports.sendReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    const result = await reminderService.sendReminder(id, items);
    
    res.json({
      message: "Reminder email sent successfully.",
      ...result,
    });
  } catch (error) {
    logger.error("Error in sendReminder: %o", error);
    const status = error.message.includes("not found") || error.message.includes("No items") || error.message.includes("No email") ? 400 : 500;
    res.status(status).json({ message: error.message || "Server error sending reminder email." });
  }
};
