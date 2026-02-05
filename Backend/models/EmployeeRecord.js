const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const EmployeeMaster = require("./EmployeeMaster");
const MasterDepartment = require("./masters/MasterDepartment");
const MasterDesignation = require("./masters/MasterDesignation");
const MasterLocation = require("./masters/MasterLocation");

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
    department_name: DataTypes.STRING, 
    department_id: {
      type: DataTypes.INTEGER,
      references: {
        model: MasterDepartment,
        key: "id",
      },
    },
    job_title: DataTypes.STRING, 
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
    work_location: DataTypes.STRING,
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

module.exports = EmployeeRecord;
