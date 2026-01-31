const handler = require("../../utils/formHandler");

exports.saveDeclaration = (req, res) => handler.saveForm(req, res, "DECLARATION");
exports.verifyDeclaration = (req, res) => handler.verifyForm(req, res, "DECLARATION");
