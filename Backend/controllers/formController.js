const { EmployeeMaster } = require("../models");
const logger = require("../utils/logger");
const handler = require("../utils/formHandler");
const formAutoFillService = require("../services/formAutoFillService");

// Fetch data for auto-filling forms
exports.getAutoFillData = async (req, res) => {
  try {
    const data = await formAutoFillService.generateAutoFillData(
      req.params.employeeId,
      req.user
    );
    res.status(200).json(data);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ message: error.message });
    }
    logger.error("Error fetching auto-fill data: %o", error);
    res.status(500).json({ message: "Server error fetching form data." });
  }
};

// Toggle Form Access (Disable/Enable)
exports.toggleFormAccess = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { formType, category, isDisabled } = req.body;

    if (req.user.role !== "HR_ADMIN" && req.user.role !== "HR_SUPER_ADMIN") {
      return res.status(403).json({ message: "Access denied. HR only." });
    }

    const employee = await EmployeeMaster.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    let disabledForms = employee.disabled_forms || [];

    if (isDisabled) {
      if (!disabledForms.includes(formType)) {
        disabledForms.push(formType);
      }
    } else {
      disabledForms = disabledForms.filter((f) => f !== formType);
    }

    employee.disabled_forms = disabledForms;
    await employee.save();

    await handler.checkAndUpdateOnboardingStage(employeeId);

    res.json({ message: `Form access updated`, isDisabled });
  } catch (error) {
    logger.error("Error toggling form access: %o", error);
    res.status(500).json({ message: "Server error toggling access" });
  }
};
