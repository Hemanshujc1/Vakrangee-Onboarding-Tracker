const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

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
        "ONBOARDED",
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

module.exports = EmployeeMaster;
