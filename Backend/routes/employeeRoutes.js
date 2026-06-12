const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, employeeController.getAllEmployees);
// router.get('/my-hr', protect, employeeController.getMyHR);
router.get("/me", protect, employeeController.getMe);
router.get("/dashboard-stats", protect, employeeController.getDashboardStats);
router.get("/:id", protect, employeeController.getEmployeeById);
router.put("/:id", protect, employeeController.updateEmployeeDetails);
router.post("/submit-basic-info", protect, employeeController.submitBasicInfo);
router.post(
  "/:id/verify-basic-info",
  protect,
  employeeController.verifyBasicInfo,
);
router.post(
  "/:id/advance-stage",
  protect,
  employeeController.advanceOnboardingStage,
);
router.put("/:id/form-access", protect, employeeController.updateFormAccess);
router.post(
  "/:id/final-verify",
  protect,
  employeeController.finalVerifyEmployee,
);
router.delete("/:id", protect, employeeController.deleteEmployee);
router.post("/:id/download-documents", protect, employeeController.downloadDocuments);
router.post("/:id/send-reminder",       protect, employeeController.sendReminder);


module.exports = router;
