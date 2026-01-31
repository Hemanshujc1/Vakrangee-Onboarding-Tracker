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

    // Also try plural/singular variations just in case, or check information_schema if possible.
    // But let's stick to what user likely sees or standard Sequelize defaults if explicit names were used.
    // If I can't be sure, I can query show tables.
    
    // Let's just try to drop them multiple times or use IF EXISTS.
    // Sequelize uses queryInterface but raw query is easier here.

    for (const table of tablesToDrop) {
      console.log(`Dropping table: ${table}...`);
      await sequelize.query(`DROP TABLE IF EXISTS ${table};`);
      
      // Sequelize standard pluralization check
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
