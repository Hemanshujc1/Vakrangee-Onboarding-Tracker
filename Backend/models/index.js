const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const MasterDepartment = require("./masters/MasterDepartment");
const MasterDesignation = require("./masters/MasterDesignation");
const MasterLocation = require("./masters/MasterLocation");

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

// Associations for EmployeeRecord and Masters
EmployeeRecord.belongsTo(MasterDepartment, { foreignKey: "department_id" });
EmployeeRecord.belongsTo(MasterDesignation, { foreignKey: "designation_id" });
EmployeeRecord.belongsTo(MasterLocation, { foreignKey: "location_id" });

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
  MasterDepartment,
  MasterDesignation,
  MasterLocation,
  FormSubmission,
  EmployeeDocument,
};
