const handler = require("../../utils/formHandler");

exports.saveEPF = (req, res) => handler.saveForm(req, res, "EPF");
exports.verifyEPF = (req, res) => handler.verifyForm(req, res, "EPF");
