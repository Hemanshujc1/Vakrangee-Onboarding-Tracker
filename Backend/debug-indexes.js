const sequelize = require('./config/database');

async function checkIndexes() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    
    const [results] = await sequelize.query("SHOW INDEX FROM master_departments");
    console.log('Indexes on master_departments:', results.length);
    results.forEach(idx => {
        console.log(`- ${idx.Key_name} (${idx.Column_name})`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkIndexes();
