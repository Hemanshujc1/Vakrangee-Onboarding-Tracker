const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const MasterDepartment = require("./masters/MasterDepartment");
const MasterDesignation = require("./masters/MasterDesignation");
const MasterLocation = require("./masters/MasterLocation");
const AuditLog = require("./common/AuditLog");

// Redesign Models
const FormSubmission = require("./common/FormSubmission");
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


// --- Audit Logging Hook ---
const logAudit = async (modelName, record, action, options) => {
  try {
    const changes = action === "UPDATE" ? JSON.stringify(record._changed) : null;
    const changedBy = options.userId || null; 

    await AuditLog.create({
      table_name: modelName,
      record_id: record.id,
      action: action,
      changed_by: changedBy,
      changes: changes,
    });
  } catch (err) {
    console.error(`Failed to log audit for ${modelName}:`, err);
  }
};

const addAuditHooks = (Model, modelName) => {
  Model.afterCreate((record, options) => logAudit(modelName, record, "INSERT", options));
  Model.afterUpdate((record, options) => logAudit(modelName, record, "UPDATE", options));
  Model.afterDestroy((record, options) => logAudit(modelName, record, "DELETE", options));
};

addAuditHooks(EmployeeMaster, "EmployeeMaster");
addAuditHooks(EmployeeRecord, "EmployeeRecord");
addAuditHooks(MasterDepartment, "MasterDepartment");
addAuditHooks(MasterDesignation, "MasterDesignation");
addAuditHooks(MasterLocation, "MasterLocation");

// Audit for new models
addAuditHooks(FormSubmission, "FormSubmission");

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

// Audit
addAuditHooks(EmployeeDocument, "EmployeeDocument");

module.exports = {
  User,
  EmployeeMaster,
  EmployeeRecord,
  MasterDepartment,
  MasterDesignation,
  MasterLocation,
  AuditLog,
  FormSubmission,
  EmployeeDocument,
};
