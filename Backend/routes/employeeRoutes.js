const express = require("express");
const router = express.Router();

const employeeQueries = require("../controllers/employee/employeeQueries");
const employeeMutations = require("../controllers/employee/employeeMutations");
const employeeOnboarding = require("../controllers/employee/employeeOnboarding");
const employeeActions = require("../controllers/employee/employeeActions");
const protect = require("../middleware/authMiddleware");

// Read Queries
router.get("/", protect, employeeQueries.getAllEmployees);
router.get("/me", protect, employeeQueries.getMe);
router.get("/dashboard-stats", protect, employeeQueries.getDashboardStats);
router.get("/:id", protect, employeeQueries.getEmployeeById);

// Update/Delete Mutations
router.put("/:id", protect, employeeMutations.updateEmployeeDetails);
router.delete("/:id", protect, employeeMutations.deleteEmployee);

// Onboarding Operations
router.post("/submit-basic-info", protect, employeeOnboarding.submitBasicInfo);
router.post("/submit-documents", protect, employeeOnboarding.submitDocuments);
router.post("/:id/verify-basic-info", protect, employeeOnboarding.verifyBasicInfo);
router.post("/:id/advance-stage", protect, employeeOnboarding.advanceOnboardingStage);
router.put("/:id/form-access", protect, employeeOnboarding.updateFormAccess);
router.post("/:id/final-verify", protect, employeeOnboarding.finalVerifyEmployee);

// Specific Actions
router.post("/:id/download-documents", protect, employeeActions.downloadDocuments);
router.post("/:id/send-reminder", protect, employeeActions.sendReminder);

module.exports = router;
