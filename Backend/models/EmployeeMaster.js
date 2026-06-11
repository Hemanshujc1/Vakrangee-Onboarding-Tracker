const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const EmployeeMaster = sequelize.define(
  "EmployeeMaster",
  {
    // ─── Top-level columns ────────────────────────────────────────────────────
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      references: {
        model: User,
        key: "employee_id",
      },
    },
    role: {
      type: DataTypes.ENUM("HR_SUPER_ADMIN", "HR_ADMIN", "EMPLOYEE"),
      allowNull: false,
      defaultValue: "EMPLOYEE",
    },
    company_email_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // ─── employee_status ──────────────────────────────────────────────────────
    // {
    //   onboarding_stage, account_status,
    //   first_login_at, last_login_at, is_first_login,
    //   is_deleted, deleted_at, deleted_by
    // }
    employee_status: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        onboarding_stage: "BASIC_INFO",
        account_status: "INVITED",
        first_login_at: null,
        last_login_at: null,
        is_first_login: true,
        is_deleted: false,
        deleted_at: null,
        deleted_by: null,
      },
    },

    // ─── basic_info ───────────────────────────────────────────────────────────
    // {
    //   basic_info_status, basic_info_verified_at, basic_info_verified_by,
    //   basic_info_rejection_reason, final_verification_email_sent
    // }
    basic_info: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        basic_info_status: "PENDING",
        basic_info_verified_at: null,
        basic_info_verified_by: null,
        basic_info_rejection_reason: null,
        final_verification_email_sent: false,
      },
    },

    // ─── disabled_forms ───────────────────────────────────────────────────────
    disabled_forms: {
      type: DataTypes.TEXT,
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
