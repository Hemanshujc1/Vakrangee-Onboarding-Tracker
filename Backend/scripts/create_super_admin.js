const bcrypt = require("bcrypt");
const { User, EmployeeMaster, EmployeeRecord } = require("../models");
const sequelize = require("../config/database");

const createSuperAdmin = async () => {
  const t = await sequelize.transaction();
  try {
    const email = "superhr@admin.com";
    const password = "Admin@123";
    const role = "HR_SUPER_ADMIN";

    console.log(`Creating Super Admin...`);
    console.log(`Email: ${email}`);

    // 1. Check if exists
    const existing = await User.findOne({ where: { username: email } });
    if (existing) {
      console.log("User already exists. Skipping creation.");
      await t.rollback();
      return;
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create User
    const user = await User.create(
      {
        username: email,
        password: hashedPassword,
        employee_id: "SUPERADMIN",
      },
      { transaction: t },
    );

    // 4. Create EmployeeMaster with new JSON groups
    const empMaster = await EmployeeMaster.create(
      {
        employee_id: "SUPERADMIN",
        role: role,
        company_email_id: email,
        employee_status: {
          onboarding_stage: "ONBOARDED",
          account_status: "ACTIVE",
          first_login_at: new Date(),
          last_login_at: null,
          is_first_login: false,
          is_deleted: false,
          deleted_at: null,
          deleted_by: null,
        },
        basic_info: {
          basic_info_status: "PENDING",
          basic_info_verified_at: new Date(),
          basic_info_verified_by: null,
          basic_info_rejection_reason: null,
          final_verification_email_sent: true,
        },
      },
      { transaction: t },
    );

    // 5. Create Minimal EmployeeRecord using JSON groups
    await EmployeeRecord.create(
      {
        employee_id: empMaster.employee_id,
        onboarding_hr_id: null,
        onboarding_hr_assigned_at: null,
        personal_info: {
          firstname: "Super",
          middlename: null,
          lastname: "Admin",
          date_of_birth: null,
          gender: null,
          adhar_number: null,
          pan_number: null,
          pan_verified: false,
          blood_group: null,
        },
        contact_info: {
          personal_email_id: null,
          phone: null,
          emergency_contact_number: null,
          emergency_contact_name: null,
          emergency_contact_relationship: null,
        },
        job_info: {
          department_name: "Human Resource",
          department_id: 6,
          job_title: "HR Super Admin",
          designation_id: null,
          date_of_joining: new Date(),
          band: null,
          level: null,
        },
        work_location: {
          state: "Maharashtra",
          district: "Mumbai Suburban",
          city: "Mumbai-Mci-Mumbai Suburban",
        },
        address_info: [],
      },
      { transaction: t },
    );

    await t.commit();
    console.log("✅ HR Super Admin created successfully!");
    process.exit(0);
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Failed to create Super Admin:", error);
    process.exit(1);
  }
};

createSuperAdmin();
