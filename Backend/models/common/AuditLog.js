const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    table_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    record_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM("INSERT", "UPDATE", "DELETE", "LOGIN", "LOGOUT"),
      allowNull: false,
    },

  },
  {
    tableName: "audit_logs",
    timestamps: true,
    updatedAt: false, // Only createdAt matters for logs
  }
);

module.exports = AuditLog;
