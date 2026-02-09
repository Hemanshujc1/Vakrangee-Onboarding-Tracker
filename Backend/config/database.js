const { Sequelize } = require("sequelize");
const logger = require("../utils/logger");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: (msg) => logger.debug(msg),
  }
);

module.exports = sequelize;
