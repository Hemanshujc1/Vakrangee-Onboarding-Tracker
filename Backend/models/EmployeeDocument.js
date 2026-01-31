const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmployeeDocument = sequelize.define('EmployeeDocument', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  document_type: {
    type: DataTypes.STRING, // We'll validate valid types in controller or use ENUM
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  original_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED'),
    defaultValue: 'UPLOADED'
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verified_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rejection_reason: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'employee_documents',
  timestamps: true
});

module.exports = EmployeeDocument;
