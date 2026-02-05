const sequelize = require('../config/database');

async function dropTables() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established.');

    const tablesToDrop = [
      'employee_bank_details',
      'employee_addresses',
      'employee_family',
      'pre_joining_forms',
      'post_joining_forms' 
    ];

    for (const table of tablesToDrop) {
      console.log(`Dropping table: ${table}...`);
      await sequelize.query(`DROP TABLE IF EXISTS ${table};`);
      
      if (table === 'employee_family') {
         await sequelize.query(`DROP TABLE IF EXISTS employee_families;`);
      }
    }

    console.log('Tables dropped successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error dropping tables:', error);
    process.exit(1);
  }
}

dropTables();
