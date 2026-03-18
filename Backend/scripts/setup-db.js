const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_NAME = process.env.DB_NAME;

async function setupDatabase() {
  let connection;

  // Step 1: Create database
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  } catch (error) {
    console.error(`❌ Failed to create database: ${error.message}`);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }

  // Step 2: Load models + sequelize
  let sequelize, models;
  try {
    sequelize = require('../config/database');
    models = require('../models/index');
  } catch (error) {
    console.error(`❌ Failed to load models: ${error.message}`);
    process.exit(1);
  }

  // Step 3: Authenticate + sync
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true, logging: false });
  } catch (error) {
    console.error(`❌ Database sync failed: ${error.message}`);
    if (error.original) console.error(`   ${error.original.message}`);
    process.exit(1);
  }

  // Step 4: List tables
  try {
    const [tables] = await sequelize.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = '${DB_NAME}' ORDER BY table_name;`
    );
    const names = tables.map((r) => r.TABLE_NAME || r.table_name).join(', ');
    console.log(`✅ Database '${DB_NAME}' ready. Tables (${tables.length}): ${names}`);
  } catch (error) {
    console.log(`✅ Database '${DB_NAME}' synced successfully.`);
  } finally {
    await sequelize.close();
  }
}

setupDatabase();
