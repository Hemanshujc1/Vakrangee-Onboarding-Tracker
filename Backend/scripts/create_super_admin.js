const bcrypt = require('bcrypt');
const { User, EmployeeMaster, EmployeeRecord } = require('../models');
const sequelize = require('../config/database');

const createSuperAdmin = async () => {
    const t = await sequelize.transaction();
    try {
        const email = 'superhr@admin.com';
        const password = 'admin@123';
        const role = 'HR_SUPER_ADMIN';

        console.log(`Creating Super Admin...`);
        console.log(`Email: ${email}`);

        // 1. Check if exists
        const existing = await User.findOne({ where: { username: email } });
        if (existing) {
            console.log('User already exists. Skipping creation.');
            await t.rollback();
            return;
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create User
        const user = await User.create({
            username: email,
            password: hashedPassword
        }, { transaction: t });

        // 4. Create EmployeeMaster
        const empMaster = await EmployeeMaster.create({
            employee_id: user.id,
            role: role,
            onboarding_stage: 'ACTIVE',
            account_status: 'ACTIVE', // Ensure active
            company_email_id: email,
            first_login_at: new Date() // Mark as logged in so they don't get stuck in "First Login" flows if any
        }, { transaction: t });

        // 5. Create Minimal EmployeeRecord (Required for some profile views)
        await EmployeeRecord.create({
            employee_id: empMaster.id,
            firstname: 'Super',
            lastname: 'Admin',
            designation_id: null, // or fetch a default? Leaving null is safer if optional
            department_id: null,
            job_title: 'HR Super Admin',
            personal_email_id: email,
            date_of_joining: new Date()
        }, { transaction: t });

        await t.commit();
        console.log('✅ HR Super Admin created successfully!');
        process.exit(0);

    } catch (error) {
        if (!t.finished) await t.rollback();
        console.error('Failed to create Super Admin:', error);
        process.exit(1);
    }
};

createSuperAdmin();
