const logger = require("../../utils/logger");
const employeeMutationService = require("../../services/employee/employeeMutationService");

// Update Employee Details (Admin override)
exports.updateEmployeeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await employeeMutationService.updateEmployeeDetails(id, req.body);
    res.json(result);
  } catch (error) {
    logger.error("Error updating employee details: %o", error);
    if (error.message.includes("not found") || error.message.includes("not initialized")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error updating details" });
  }
};

// Soft Delete Employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingAdminId = req.user.id;
    const result = await employeeMutationService.deleteEmployee(id, requestingAdminId);
    res.json(result);
  } catch (error) {
    logger.error("Error deleting employee: %o", error);
    if (error.message === "Employee not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error deleting employee" });
  }
};