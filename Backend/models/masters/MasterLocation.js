const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const MasterLocation = sequelize.define(
  "MasterLocation",
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
      comment: "Office Name or City Name",
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "master_locations",
    timestamps: true,
  }
);

module.exports = MasterLocation;
