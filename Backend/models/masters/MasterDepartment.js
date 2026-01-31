const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const MasterDepartment = sequelize.define(
  "MasterDepartment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "master_departments",
    timestamps: true,
  }
);

module.exports = MasterDepartment;
