const handler = require("../../utils/formHandler");

exports.saveGratuity = (req, res) => handler.saveForm(req, res, "GRATUITY");
exports.verifyGratuity = (req, res) => handler.verifyForm(req, res, "GRATUITY");
