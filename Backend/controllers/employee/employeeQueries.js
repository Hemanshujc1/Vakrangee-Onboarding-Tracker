const logger = require("../../utils/logger");
const employeeQueryService = require("../../services/employee/employeeQueryService");
const employeeDashboardService = require("../../services/employee/employeeDashboardService");

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const protocol = req.protocol;
    const host = req.get("host");
    const formattedEmployees = await employeeQueryService.getAllEmployees(protocol, host);
    res.json(formattedEmployees);
  } catch (error) {
    logger.error("Error fetching employees: %o", error);
    res.status(500).json({
      message: "Server error fetching employees",
      error: error.message,
    });
  }
};

// Get current logged-in employee details
exports.getMe = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const data = await employeeQueryService.getMe(employeeId);
    res.json(data);
  } catch (error) {
    logger.error("Error fetching my details: %o", error);
    const status = error.message === "Employee profile not found" ? 404 : 500;
    res.status(status).json({ message: error.message || "Server error fetching details" });
  }
};

// Get Dashboard Stats for Employee
exports.getDashboardStats = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const data = await employeeDashboardService.getDashboardStats(employeeId);
    res.json(data);
  } catch (error) {
    logger.error("Error fetching dashboard stats: %o", error);
    const status = error.message === "Employee not found" ? 404 : 500;
    res.status(status).json({ message: error.message || "Server error fetching stats" });
  }
};

// Get single employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const protocol = req.protocol;
    const host = req.get("host");
    
    const data = await employeeQueryService.getEmployeeById(id, req.user.role, req.user.employee_id, protocol, host);
    res.json(data);
  } catch (error) {
    logger.error("Error fetching employee details: %o", error);
    if (error.message === "Employee not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("Access denied")) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error fetching employee details" });
  }
};
