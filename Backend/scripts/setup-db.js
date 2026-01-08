const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../config/database');
const { User, EmployeeMaster, EmployeeRecord, PreJoiningForm, PostJoiningForm } = require('../models/index');

const DB_NAME = process.env.DB_NAME;

async function setupDatabase() {
  console.log('🚀 Starting Database Setup...');

  // Step 1: Create Database if it doesn't exist
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    console.log(`✅ Database '${DB_NAME}' checked/created.`);
    await connection.end();
  } catch (error) {
    console.error('❌ Error creating database:', error);
    process.exit(1);
  }

  // Step 2: Sync Tables using Sequelize
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database via Sequelize.');

    // Sync all models
    // alter: true adds missing columns/tables without dropping existing data
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema synchronized (Tables created/updated).');

  } catch (error) {
    console.error('❌ Error syncing database schema:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }

  console.log('🎉 Database setup complete!');
}

setupDatabase();
