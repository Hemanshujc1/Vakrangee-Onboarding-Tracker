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

// --- Employee Master ---
const EmployeeMaster = sequelize.define(
  "EmployeeMaster",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    role: {
      type: DataTypes.ENUM("HR_SUPER_ADMIN", "HR_ADMIN", "EMPLOYEE"),
      allowNull: false,
      defaultValue: "EMPLOYEE",
    },
    onboarding_stage: {
      type: DataTypes.ENUM(
        "BASIC_INFO",
        "PRE_JOINING",
        "PRE_JOINING_VERIFIED",
        "POST_JOINING",
        "ACTIVE",
        "Not_joined"
      ),
      defaultValue: "BASIC_INFO",
    },
    account_status: {
      type: DataTypes.ENUM("INVITED", "ACTIVE", "Inactive"),
      defaultValue: "INVITED",
    },
    company_email_id: {
      type: DataTypes.STRING,
      // unique: true, // Commented out to prevent "Too many keys" error on sync
      allowNull: true,
    },
    first_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Basic Info Verification Workflow
    basic_info_status: {
      type: DataTypes.ENUM("PENDING", "SUBMITTED", "VERIFIED", "REJECTED"),
      defaultValue: "PENDING",
    },
    basic_info_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    basic_info_verified_by: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
      },
      allowNull: true,
    },
    basic_info_rejection_reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_by: {
      type: DataTypes.INTEGER, // References User.id which is INTEGER
      allowNull: true,
    },
    disabled_forms: {
      type: DataTypes.TEXT, // Will store JSON string array of form keys e.g. ["GRATUITY", "mediclaim"]
      allowNull: true,
      defaultValue: "[]",
      get() {
        const rawValue = this.getDataValue("disabled_forms");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue("disabled_forms", JSON.stringify(value));
      },
    },
  },
  {
    tableName: "employee_master",
    timestamps: true, // createdAt, updatedAt
  }
);

// --- Merged with Basic Info ---
const EmployeeRecord = sequelize.define(
  "EmployeeRecord",
  {
    employee_id: {
      type: DataTypes.INTEGER,
      references: {
        model: EmployeeMaster,
        key: "id",
      },
    },
    // Work Details
    department_name: DataTypes.STRING, // Deprecated, use department_id
    department_id: {
      type: DataTypes.INTEGER,
      references: {
        model: MasterDepartment,
        key: "id",
      },
    },
    job_title: DataTypes.STRING, // Deprecated, use designation_id
    designation_id: {
      type: DataTypes.INTEGER,
      references: {
        model: MasterDesignation,
        key: "id",
      },
    },
    date_of_joining: DataTypes.DATEONLY,
    onboarding_hr_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    onboarding_hr_assigned_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    work_location: DataTypes.STRING, // Deprecated, use location_id
    location_id: {
      type: DataTypes.INTEGER,
      references: {
        model: MasterLocation,
        key: "id",
      },
    },

    // Personal Details (Merged from BasicInformation)
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    personal_email_id: DataTypes.STRING,
    phone: DataTypes.STRING,
    date_of_birth: DataTypes.DATEONLY,
    address_line1: DataTypes.STRING,
    address_line2: DataTypes.STRING,
    landmark: DataTypes.STRING,
    post_office: DataTypes.STRING, // Added post_office
    pincode: DataTypes.STRING,
    city: DataTypes.STRING,
    district: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    tenth_percentage: DataTypes.FLOAT,
    twelfth_percentage: DataTypes.FLOAT,
    adhar_number: DataTypes.STRING,
    pan_number: DataTypes.STRING,
    gender: DataTypes.STRING,
    profile_photo: DataTypes.STRING,
  },
  {
    tableName: "employee_records",
    timestamps: false,
  }
);

// --- Forms Tracking Tables ---




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
    const changedBy = options.userId || null; // Ensure controllers pass { userId: req.user.id } in options if possible, or we rely on some context.
    
    // For now, simple logging without user context if not passed
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
