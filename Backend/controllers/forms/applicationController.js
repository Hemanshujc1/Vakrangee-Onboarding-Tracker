const handler = require("../../utils/formHandler");

exports.saveApplication = (req, res) => handler.saveForm(req, res, "EMPLOYMENT_APP");
exports.verifyApplication = (req, res) => handler.verifyForm(req, res, "EMPLOYMENT_APP");
