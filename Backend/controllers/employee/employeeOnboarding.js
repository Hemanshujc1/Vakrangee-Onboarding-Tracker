const logger = require("../../utils/logger");
const onboardingService = require("../../services/employee/onboardingService");

// Submit Basic Info (Employee)
exports.submitBasicInfo = async (req, res) => {
  try {
    const employeeIdAuth = req.user.employee_id;
    const result = await onboardingService.submitBasicInfo(employeeIdAuth);
    res.json(result);
  } catch (error) {
    logger.error("Error submitting profile: %o", error);
    if (error.status === 400) {
      return res.status(400).json({ message: error.message, missingFields: error.missingFields, missingDocs: error.missingDocs });
    }
    if (error.message === "Employee not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error submitting profile" });
  }
};

// Verify/Reject Basic Info (HR)
exports.verifyBasicInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const hrUserId = req.user.employee_id;

    const result = await onboardingService.verifyBasicInfo(id, status, rejectionReason, hrUserId);
    res.json(result);
  } catch (error) {
    logger.error("Error verifying profile: %o", error);
    if (error.status === 400) return res.status(400).json({ message: error.message });
    if (error.message === "Employee not found") return res.status(404).json({ message: error.message });
    res.status(500).json({ message: "Server error verifying profile" });
  }
};

// Toggle Form Access (Admin)
exports.updateFormAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { formKey, disabled } = req.body;

    const result = await onboardingService.updateFormAccess(id, formKey, disabled);
    res.json(result);
  } catch (error) {
    logger.error("Error updating form access: %o", error);
    if (error.message === "Employee not found") return res.status(404).json({ message: error.message });
    res.status(500).json({ message: "Server error updating form access" });
  }
};

// Advance Onboarding Stage (Admin)
exports.advanceOnboardingStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    const result = await onboardingService.advanceOnboardingStage(id, stage);
    res.json(result);
  } catch (error) {
    logger.error("Error advancing stage: %o", error);
    if (error.status === 400) return res.status(400).json({ message: error.message });
    if (error.message === "Employee not found") return res.status(404).json({ message: error.message });
    res.status(500).json({ message: "Server error advancing stage" });
  }
};

// Final Verification for Employee (Basic Info + Documents)
exports.finalVerifyEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const hrUserId = req.user.id;

    const result = await onboardingService.finalVerifyEmployee(id, hrUserId);
    res.json(result);
  } catch (error) {
    logger.error("Error in final verification: %o", error);
    if (error.status === 400) return res.status(400).json({ message: error.message });
    if (error.message === "Employee not found") return res.status(404).json({ message: error.message });
    res.status(500).json({ message: "Server error during final verification" });
  }
};

