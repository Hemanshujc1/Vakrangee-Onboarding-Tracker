const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FormSubmission = sequelize.define(
  "FormSubmission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "employee_master", // Using string to avoid circular dependency issues during define
        key: "id",
      },
    },
    form_type: {
      type: DataTypes.ENUM(
        "GRATUITY",
        "EPF",
        "NDA",
        "TDS",
        "DECLARATION",
        "MEDICLAIM",
        "EMPLOYMENT_APP",
        "EMPLOYEE_INFO",
        "OTHER"
      ),
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "Increment on re-submission",
    },
    status: {
      type: DataTypes.ENUM("DRAFT", "SUBMITTED", "APPROVED", "VERIFIED", "REJECTED"),
      defaultValue: "DRAFT",
    },
    data: {
      type: DataTypes.JSON, // JSONB in Postgres, JSON in MySQL
      allowNull: false,
      defaultValue: {},
      comment: "Snapshot of the form fields at time of submission",
    },

    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    verified_by: {
      type: DataTypes.INTEGER, // User ID
      allowNull: true,
    },
    rejection_reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },

  },
  {
    tableName: "form_submissions",
    timestamps: true,
    indexes: [
      {
        fields: ["employee_id", "form_type", "version"],
        unique: true,
      },
    ],
  }
);

module.exports = FormSubmission;
