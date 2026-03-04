const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");


// Redesign Models
const FormSubmission = require("./FormSubmission");
const EmployeeDocument = require("./EmployeeDocument");
const EmployeeMaster = require("./EmployeeMaster");
const EmployeeRecord = require("./EmployeeRecord");


// --- Associations ---
// User <-> EmployeeMaster
User.hasOne(EmployeeMaster, { foreignKey: "employee_id" });
EmployeeMaster.belongsTo(User, { foreignKey: "employee_id" });

// EmployeeMaster <-> EmployeeRecord
EmployeeMaster.hasOne(EmployeeRecord, { foreignKey: "employee_id" });
EmployeeRecord.belongsTo(EmployeeMaster, { foreignKey: "employee_id" });

EmployeeMaster.hasMany(FormSubmission, { foreignKey: "employee_id" });
FormSubmission.belongsTo(EmployeeMaster, { foreignKey: "employee_id" });

FormSubmission.belongsTo(User, { as: 'Verifier', foreignKey: 'verified_by' });

// EmployeeDocument
EmployeeMaster.hasMany(EmployeeDocument, { foreignKey: "employee_id" });
EmployeeDocument.belongsTo(EmployeeMaster, { foreignKey: "employee_id" });

module.exports = {
  User,
  EmployeeMaster,
  EmployeeRecord,
  FormSubmission,
  EmployeeDocument,
};
