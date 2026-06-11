const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const EmployeeMaster = require("./EmployeeMaster");

const EmployeeRecord = sequelize.define(
  "EmployeeRecord",
  {
    // ─── References ───────────────────────────────────────────────────────────
    employee_id: {
      type: DataTypes.STRING,
      references: {
        model: EmployeeMaster,
        key: "employee_id",
      },
    },

    // Kept as top-level flat columns for efficient querying (FK + WHERE support)
    onboarding_hr_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: EmployeeMaster,
        key: "employee_id",
      },
    },
    onboarding_hr_assigned_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // ─── personal_info ────────────────────────────────────────────────────────
    // {
    //   firstname, middlename, lastname, date_of_birth, gender,
    //   adhar_number, pan_number, pan_verified, blood_group
    // }
    personal_info: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },

    // ─── contact_info ─────────────────────────────────────────────────────────
    // {
    //   personal_email_id, phone,
    //   emergency_contact_number, emergency_contact_name,
    //   emergency_contact_relationship
    // }
    contact_info: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },

    // ─── address_info ─────────────────────────────────────────────────────────
    // [
    //   {
    //     address_type: "Permanent",
    //     address_line1, address_line2, landmark, post_office,
    //     pincode, city, district, state, country,
    //     is_same_as_permanent: false
    //   },
    //   {
    //     address_type: "Communication Address",
    //     address_line1, address_line2, landmark, post_office,
    //     pincode, city, district, state, country,
    //     is_same_as_permanent: true/false
    //     (full copy of permanent stored even when is_same_as_permanent = true)
    //   }
    // ]
    address_info: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },

    // ─── academic_details ─────────────────────────────────────────────────────
    // {
    //   tenth_percentage, twelfth_percentage,
    //   degree_name, degree_percentage
    // }
    academic_details: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },

    // ─── job_info ─────────────────────────────────────────────────────────────
    // {
    //   department_name, department_id, job_title, designation_id,
    //   date_of_joining, band, level
    // }
    job_info: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },

    // ─── work_location ────────────────────────────────────────────────────────
    // { state, district, city }
    work_location: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },

    // ─── misc ─────────────────────────────────────────────────────────────────
    profile_photo: DataTypes.STRING,
    signature: DataTypes.STRING,
  },
  {
    tableName: "employee_records",
    timestamps: false,
  }
);

module.exports = EmployeeRecord;
