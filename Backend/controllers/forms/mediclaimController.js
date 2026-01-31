const handler = require("../../utils/formHandler");

exports.saveMediclaim = (req, res) => handler.saveForm(req, res, "MEDICLAIM");
exports.verifyMediclaim = (req, res) => handler.verifyForm(req, res, "MEDICLAIM");
