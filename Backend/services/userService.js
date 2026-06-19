const { User, EmployeeMaster, EmployeeRecord } = require("../models");

exports.resolveVerifierName = async (verifierId) => {
  if (!verifierId) return null;

  // Try finding by employee_id string first (e.g. "EMP001")
  let user = await User.findOne({ where: { employee_id: verifierId } });

  // Fallback: if verifierId is a numeric DB id (legacy data stored req.user.id)
  if (!user && !isNaN(verifierId)) {
    user = await User.findByPk(Number(verifierId));
  }

  if (!user) return null;

  // Look up the EmployeeRecord via employee_id on the user
  const empRecord = await EmployeeRecord.findOne({
    where: { employee_id: user.employee_id },
  });

  // Names are stored inside the personal_info JSON column, not as flat columns
  const pi = empRecord?.personal_info || {};
  if (pi.firstname) {
    return pi.firstname.trim();
  }

  // Last resort: extract name from email (everything before @)
  if (user.username && user.username.includes("@")) {
    const localPart = user.username.split("@")[0];
    // Capitalise first letter
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }

  return user.username || null;
};

