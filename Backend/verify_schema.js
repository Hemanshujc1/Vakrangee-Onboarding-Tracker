const { User, EmployeeMaster, MasterDepartment, MasterDesignation, MasterLocation, FormSubmission } = require('./models');
const sequelize = require('./config/database');

async function verify() {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    console.log('Creating test user checking ENUMs...');
    
    // Test Not_joined
    const t = await sequelize.transaction();
    try {
        const user1 = await User.create({ username: 'test_not_joined', password: 'password' }, { transaction: t });
        await EmployeeMaster.create({
            employee_id: user1.id,
            onboarding_stage: 'Not_joined',
            account_status: 'INVITED'
        }, { transaction: t });
        console.log('Successfully created employee with Not_joined stage.');
        await t.rollback(); // Don't keep junk
    } catch (e) {
        console.error('Failed to create Not_joined employee:', e.message);
        await t.rollback();
    }

    // Test Inactive
    const t2 = await sequelize.transaction();
    try {
        const user2 = await User.create({ username: 'test_inactive', password: 'password' }, { transaction: t2 });
        await EmployeeMaster.create({
            employee_id: user2.id,
            onboarding_stage: 'ACTIVE',
            account_status: 'Inactive',
            is_deleted: true
        }, { transaction: t2 });
        console.log('Successfully created employee with Inactive/is_deleted.');
        await t2.rollback();
    } catch (e) {
        console.error('Failed to create Inactive employee:', e.message);
        await t2.rollback();
    }

    // Test Master Tables
    try {
        await MasterDepartment.create({ name: 'Engineering', code: 'ENG' });
        await MasterDesignation.create({ title: 'Software Engineer', level: 'L1' });
        await MasterLocation.create({ name: 'Mumbai HQ', address: 'Mumbai' });
        console.log('Successfully created Master data.');
    } catch (e) {
        console.warn('Master data creation failed (might already exist):', e.message);
    }
    // Test Redesign Tables
    const t3 = await sequelize.transaction();
    try {
        const user3 = await User.create({ username: 'test_redesign', password: 'pw' }, { transaction: t3 });
        const emp3 = await EmployeeMaster.create({ 
            employee_id: user3.id, 
            onboarding_stage: 'BASIC_INFO' 
        }, { transaction: t3 });
        


        await FormSubmission.create({
            employee_id: emp3.id,
            form_type: 'GRATUITY',
            status: 'DRAFT',
            data: { some_field: "some_value" }
        }, { transaction: t3 });

        console.log('Successfully created Redesign data (FormSubmission).');
        await t3.rollback();
    } catch (e) {
        console.error('Redesign data creation failed:', e.message);
        await t3.rollback();
    }

    console.log('Verification Complete.');
    process.exit(0);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

verify();

