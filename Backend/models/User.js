const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    // Note: Initially personal email, later company email
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reset_password_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reset_password_expire: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'users',
  timestamps: false, // We are managing created_at manually if needed, or can enable timestamps
});

module.exports = User;
