/// Done
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, EmployeeMaster, EmployeeRecord } = require('../models'); 
const sequelize = require('../config/database');
const sendEmail = require('../utils/emailService');

const secretKey = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register a new user
exports.cregister = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // destructuring
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
      employee_id: newUser.id,
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
        onboarding_hr_id: onboarding_hr_id, // Set HR ID
        onboarding_hr_assigned_at: onboarding_hr_id ? new Date() : null
    }, { transaction: t });

    await t.commit();

// if successfully registered

    res.status(201).json({ 
        message: 'User registered successfully', 
        user: { 
            id: newUser.id, 
            username: newUser.username, 
            role: newEmployee.role,
            employeeId: newEmployee.id
        } 
    });
  } catch (error) {
    if (!t.finished) {
       await t.rollback();
    }
    console.error('Registration Error:', error);
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
    const employeeRecord = await EmployeeMaster.findOne({ where: { employee_id: user.id } });
    
    if (!employeeRecord) {
        return res.status(403).json({ message: 'User exists but no employee record found. Contact Admin.' });
    }

    // Check Access Control
    if (employeeRecord.onboarding_stage === 'Not_joined') {
        return res.status(403).json({ message: 'You no longer have access. Please contact HR.' });
    }

    if (employeeRecord.account_status === 'Inactive' || employeeRecord.is_deleted) {
        return res.status(403).json({ message: 'Your account is inactive. Please contact administrator.' });
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
    
    // Check if status is null (legacy) or 'INVITED'
    if (!employeeRecord.account_status || employeeRecord.account_status === 'INVITED') {
        console.log(`Activating user ${user.username} (ID: ${user.id}). Old Status: ${employeeRecord.account_status}`);
        employeeRecord.account_status = 'ACTIVE';
        await employeeRecord.save();
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: role,
        employeeId: employeeRecord.id
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body; // Can be username or email

        const user = await User.findOne({ where: { username: email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Expiry 3 mins from now
        const expiry = new Date(Date.now() + 3 * 60 * 1000);

        // Update User
        // Note: in a real app, hash the OTP
        user.reset_password_token = otp;
        user.reset_password_expire = expiry;
        await user.save();

        // Send Email (Production ready)
        await sendEmail({
            to: user.username, // Assuming username is email
            subject: 'Password Reset OTP - Vakrangee',
            text: `Your OTP for password reset is: ${otp}. Valid for 3 minutes.`,
            html: `<h3>Password Reset Request</h3><p>Your OTP is: <b>${otp}</b></p><p>This OTP is valid for 10 minutes.</p>`
        });

        res.json({ message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ where: { username: email } });

        if (!user) {
             return res.status(404).json({ message: 'User not found' });
        }

        if (user.reset_password_token !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.reset_password_expire < new Date()) {
            return res.status(400).json({ message: 'OTP Expired' });
        }
      // Return OTP to include in reset request if needed for double check
       res.json({ message: 'OTP Verified Successfully', otp: otp }); 
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
         const { email, otp, newPassword } = req.body;
         const user = await User.findOne({ where: { username: email } });
 
         if (!user) {
              return res.status(404).json({ message: 'User not found' });
         }
 
         if (user.reset_password_token !== otp) {
             return res.status(400).json({ message: 'Invalid or Expired OTP' });
         }

         if (user.reset_password_expire < new Date()) {
            return res.status(400).json({ message: 'OTP Expired' });
        }
 
         // Hash new password
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(newPassword, salt);
 
         user.password = hashedPassword;
         user.reset_password_token = null;
         user.reset_password_expire = null;
         await user.save();
 
         res.json({ message: 'Password reset successfully' });
 
    } catch (error) {
         console.error('Reset Password Error:', error);
         res.status(500).json({ message: 'Server error', error: error.message });
    }
 };
