const { User, EmployeeMaster, EmployeeRecord } = require("../models");

exports.resolveVerifierName = async (verifierId) => {
  if (!verifierId) return null;
  const user = await User.findOne({ where: { employee_id: verifierId } });
  if (!user) return "Unknown";

  const empMaster = await EmployeeMaster.findOne({
    where: { employee_id: user.employee_id },
  });
  if (!empMaster) return user.username;

  const empRecord = await EmployeeRecord.findOne({
    where: { employee_id: empMaster.employee_id },
  });

  if (empRecord && (empRecord.firstname || empRecord.lastname)) {
    return `${empRecord.firstname || ""} ${empRecord.lastname || ""}`.trim();
  }

  return user.username;
};
