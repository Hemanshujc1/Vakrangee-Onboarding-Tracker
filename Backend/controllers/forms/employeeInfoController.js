const handler = require("../../utils/formHandler");

// Note: EMPLOYEE_INFO in FormSubmission
exports.saveEmployeeInfo = (req, res) => handler.saveForm(req, res, "EMPLOYEE_INFO");
exports.verifyEmployeeInfo = (req, res) => handler.verifyForm(req, res, "EMPLOYEE_INFO");
