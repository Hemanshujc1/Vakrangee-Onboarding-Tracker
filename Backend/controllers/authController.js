const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, EmployeeMaster, EmployeeRecord } = require('../models'); 
const sequelize = require('../config/database');

const secretKey = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register a new user
exports.register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
        username, password, role, 
        firstName, lastName, department, jobTitle, location, phone, startDate, onboarding_hr_id 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      await t.rollback();
      return res.status(400).json({ message: 'Username/Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = await User.create({
      username,
      password: hashedPassword,
    }, { transaction: t });

    // Determine emails based on role
    // For EMPLOYEE: company_email_id = null, personal_email_id = username
    // For ADMIN: company_email_id = username, personal_email_id = null (as per previous request)
    const isEmployee = (role === 'EMPLOYEE');
    
    // Create EmployeeMaster entry
    const newEmployee = await EmployeeMaster.create({
      user_id: newUser.id,
      role: role || 'EMPLOYEE',
      onboarding_stage: 'BASIC_INFO',
      company_email_id: isEmployee ? null : username, 
    }, { transaction: t });

    // Create EmployeeRecord entry
    await EmployeeRecord.create({
        employee_id: newEmployee.id,
        firstname: firstName,
        lastname: lastName,
        department_name: department,
        job_title: jobTitle,
        work_location: location,
        phone: phone,
        date_of_joining: startDate,
        personal_email_id: isEmployee ? username : null,
        onboarding_hr_id: onboarding_hr_id // Set HR ID
    }, { transaction: t });

    await t.commit();

    res.status(201).json({ 
        message: 'User registered successfully', 
        user: { 
            id: newUser.id, 
            username: newUser.username, 
            role: newEmployee.role 
        } 
    });
  } catch (error) {
    if (!t.finished) {
       await t.rollback();
    }
    console.error('Registration Error:', error);
    // Send the specific error message to the client for debugging
    res.status(500).json({ message: `Server error during registration: ${error.message}`, error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Fetch Role from EmployeeMaster
    const employeeRecord = await EmployeeMaster.findOne({ where: { user_id: user.id } });
    
    if (!employeeRecord) {
        return res.status(403).json({ message: 'User exists but no employee record found. Contact Admin.' });
    }

    const role = employeeRecord.role;

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: role },
      secretKey,
      { expiresIn: '24h' }
    );

    // Update login timestamp
    await employeeRecord.update({ last_login_at: new Date() });
    if (!employeeRecord.first_login_at) {
        await employeeRecord.update({ first_login_at: new Date() });
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: role
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};
