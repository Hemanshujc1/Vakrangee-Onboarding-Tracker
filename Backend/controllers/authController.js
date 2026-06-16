const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, EmployeeMaster, EmployeeRecord } = require('../models'); 
const sequelize = require('../config/database');
const sendEmail = require('../utils/emailService');
const logger = require('../utils/logger');

const secretKey = process.env.JWT_SECRET || 'your_jwt_secret_key';

const getEmpStatus = (emp) => emp?.employee_status || {};
const getBasicInfo = (emp) => emp?.basic_info || {};

// Register a new user
exports.register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // RESTRICTED: Only HR Admins can create new users
    if (req.user.role !== 'HR_SUPER_ADMIN' && req.user.role !== 'HR_ADMIN') {
        await t.rollback();
        return res.status(403).json({ message: 'Access denied. Only HR Admins can create new users.' });
    }

    const { 
        username, password, role, 
        firstName, lastName, department, jobTitle, location, phone, startDate, onboarding_hr_id,
        department_id, designation_id,
        band_id, band_name, band_level_id, level_name, work_location, employee_id: employee_code
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      await t.rollback();
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if Employee ID already exists in the system
    if (employee_code) {
      const existingRecord = await EmployeeMaster.findOne({
        where: { employee_id: employee_code }
      });
      if (existingRecord) {
        await t.rollback();
        return res.status(400).json({ message: 'Employee ID already exists in the system' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = await User.create({
      username,
      password: hashedPassword,
      employee_id: employee_code || null,
    }, { transaction: t });

    // Determine email placement based on role
    const isEmployee = (role === 'EMPLOYEE');
    
    // Create EmployeeMaster entry with JSON groups
    const newEmployee = await EmployeeMaster.create({
      employee_id: newUser.employee_id,
      role: role || 'EMPLOYEE',
      company_email_id: isEmployee ? null : username,
      employee_status: {
        onboarding_stage: 'BASIC_INFO',
        account_status: 'INVITED',
        first_login_at: null,
        last_login_at: null,
        is_first_login: true,
        is_deleted: false,
        deleted_at: null,
        deleted_by: null,
      },
      basic_info: {
        basic_info_status: 'PENDING',
        basic_info_verified_at: null,
        basic_info_verified_by: null,
        basic_info_rejection_reason: null,
        final_verification_email_sent: false,
      },
    }, { transaction: t });

    // Resolve work_location: accept object { state, district, city } or legacy string
    let resolvedWorkLocation = null;
    if (work_location && typeof work_location === 'object') {
      resolvedWorkLocation = work_location;
    } else if (location) {
      // Legacy: store as city field only for backward compat
      resolvedWorkLocation = { state: null, district: null, city: location };
    }

    // Create EmployeeRecord entry with JSON groups
    await EmployeeRecord.create({
        employee_id: newEmployee.employee_id,
        onboarding_hr_id: onboarding_hr_id || null,
        onboarding_hr_assigned_at: onboarding_hr_id ? new Date() : null,
        personal_info: {
          firstname: firstName || null,
          middlename: null,
          lastname: lastName || null,
          date_of_birth: null,
          gender: null,
          adhar_number: null,
          pan_number: null,
          pan_verified: false,
          blood_group: null,
        },
        contact_info: {
          personal_email_id: isEmployee ? username : null,
          phone: phone || null,
          emergency_contact_number: null,
          emergency_contact_name: null,
          emergency_contact_relationship: null,
        },
        job_info: {
          department_name: department || null,
          department_id: department_id || null,
          job_title: jobTitle || null,
          designation_id: designation_id || null,
          date_of_joining: startDate || null,
          band_id: band_id || null,
          band_name: band_name || null,
          band_level_id: band_level_id || null,
          level_name: level_name || null,
        },
        work_location: resolvedWorkLocation,
    }, { transaction: t });

    await t.commit();

    res.status(201).json({ 
        message: 'User registered successfully', 
        user: { 
            id: newUser.id, 
            username: newUser.username, 
            role: newEmployee.role,
            employeeId: newEmployee.employee_id
        } 
    });
  } catch (error) {
    if (!t.finished) {
       await t.rollback();
    }
    logger.error('Registration Error: %o', error);
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
      logger.warn(`Login failed: User not found for username: ${username}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed: Invalid credentials for user: ${username}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Fetch Role from EmployeeMaster
    const employeeRecord = await EmployeeMaster.findOne({ where: { employee_id: user.employee_id } });
    
    if (!employeeRecord) {
        return res.status(403).json({ message: 'User exists but no employee record found. Contact Admin.' });
    }

    // Read status from JSON group
    const empStatus = getEmpStatus(employeeRecord);

    // Check Access Control
    if (empStatus.account_status === 'Inactive' || empStatus.is_deleted) {
        logger.warn(`Login failed: User ${username} account is inactive or deleted.`);
        return res.status(403).json({ message: 'Your account is inactive. Please contact administrator.' });
    }

    const role = employeeRecord.role;

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, employee_id: user.employee_id, username: user.username, role: role },
      secretKey,
      { expiresIn: '24h' }
    );

    // Update login timestamps in employee_status JSON
    const updatedStatus = {
      ...empStatus,
      last_login_at: new Date(),
      first_login_at: empStatus.first_login_at || new Date(),
    };

    // Activate account if INVITED
    if (!empStatus.account_status || empStatus.account_status === 'INVITED') {
      logger.info(`Activating user ${user.username} (ID: ${user.id}). Old Status: ${empStatus.account_status}`);
      updatedStatus.account_status = 'ACTIVE';
    }

    employeeRecord.employee_status = updatedStatus;
    await employeeRecord.save();

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: role,
        employeeId: employeeRecord.employee_id,
        is_first_login: (role === 'HR_ADMIN' || role === 'EMPLOYEE') ? empStatus.is_first_login : false,
      }
    });

  } catch (error) {
    logger.error('Login Error: %o', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { username: email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Expiry 3 mins from now
        const expiry = new Date(Date.now() + 2 * 60 * 1000);

        // Update User
        user.reset_password_token = otp;
        user.reset_password_expire = expiry;
        await user.save();

        // Send Email
        await sendEmail({
            to: user.username, 
            subject: 'Password Reset OTP - Vakrangee',
            text: `Your OTP for password reset is: ${otp}. Valid for 2 minutes.`,
            html: `<h3>Password Reset Request</h3><p>Your OTP is: <b>${otp}</b></p><p>This OTP is valid for 2 minutes.</p>`
        });

        res.json({ message: 'OTP sent successfully' });

    } catch (error) {
        logger.error('Forgot Password Error: %o', error);
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
       res.json({ message: 'OTP Verified Successfully', otp: otp }); 
    } catch (error) {
        logger.error('Verify OTP Error: %o', error);
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
         logger.error('Reset Password Error: %o', error);
         res.status(500).json({ message: 'Server error', error: error.message });
    }
 };

// Change password on first login (authenticated, no OTP required)
exports.changePasswordFirstLogin = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const employeeRecord = await EmployeeMaster.findOne({ where: { employee_id: req.user.employee_id } });
    if (!employeeRecord) return res.status(404).json({ message: 'Employee record not found.' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Update is_first_login inside employee_status JSON
    const empStatus = getEmpStatus(employeeRecord);
    employeeRecord.employee_status = { ...empStatus, is_first_login: false };
    await employeeRecord.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    logger.error('Change Password Error: %o', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
