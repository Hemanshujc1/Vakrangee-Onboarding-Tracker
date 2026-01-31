const handler = require("../../utils/formHandler");

exports.saveTDS = (req, res) => handler.saveForm(req, res, "TDS");
exports.verifyTDS = (req, res) => handler.verifyForm(req, res, "TDS");
