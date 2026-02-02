const sequelize = require('./config/database');

const TABLES = [
    'master_departments',
    'master_designations',
    'master_locations'
];

async function fixIndexes() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    
    for (const tableName of TABLES) {
        console.log(`\nChecking table: ${tableName}`);
        try {
            const [indexes] = await sequelize.query(`SHOW INDEX FROM ${tableName}`);
            console.log(`Found ${indexes.length} indexes.`);
    
            const redundantIndexes = indexes
                .map(i => i.Key_name)
                .filter(name => name !== 'PRIMARY' && !['name', 'title', 'location_name'].includes(name)); 
            
            // Note: Keeping 'name', 'title' etc might be risky if they are duplicated too. 
            // Better strategy: Keep only PRIMARY. If the semantic unique key (like 'name') exists, drop it too and let Sequelize recreate it cleanly.
            // So we will drop EVERYTHING except PRIMARY.
            
            const uniqueIndexNames = [...new Set(indexes.map(i => i.Key_name).filter(n => n !== 'PRIMARY'))];
            
            console.log(`Found ${uniqueIndexNames.length} non-primary indexes to drop.`);
            
            for (const indexName of uniqueIndexNames) {
                console.log(`Dropping index: ${indexName}`);
                try {
                    await sequelize.query(`DROP INDEX ${indexName} ON ${tableName}`);
                } catch (e) {
                    // Ignore error if index doesn't exist or other issues, just try to clean up
                    console.error(`Failed to drop ${indexName}: ${e.message}`);
                }
            }
        } catch (err) {
            console.error(`Error processing table ${tableName}: ${err.message}`);
        }
    }
    
    console.log('\nDone cleaning all indexes.');
    process.exit(0);
  } catch (err) {
    console.error('Fatal Error:', err);
    process.exit(1);
  }
}

fixIndexes();
