const handler = require("../../utils/formHandler");

exports.saveNDA = (req, res) => handler.saveForm(req, res, "NDA");
exports.verifyNDA = (req, res) => handler.verifyForm(req, res, "NDA");
