const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const MasterDesignation = sequelize.define(
  "MasterDesignation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    level: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "e.g. L1, L2, Junior, Senior",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "master_designations",
    timestamps: true,
  }
);

module.exports = MasterDesignation;
