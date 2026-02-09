
const { User, EmployeeMaster, EmployeeRecord } = require('../models');
const logger = require('../utils/logger');

const resolveVerifierName = async (verifierId) => {
    if (!verifierId) return null;
    const user = await User.findByPk(verifierId);
    if (!user) return "Unknown";
    
    // Try to find employee record for name
    const empMaster = await EmployeeMaster.findOne({ where: { employee_id: user.id } });
    if (!empMaster) return user.username;
    
    const empRecord = await EmployeeRecord.findOne({ where: { employee_id: empMaster.id }});
    return empRecord ? `${empRecord.firstname} ${empRecord.lastname}` : user.username;
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const employeeMaster = await EmployeeMaster.findOne({
      where: { employee_id: userId },
      include: [{ model: EmployeeRecord }]
    });

    if (!employeeMaster) {
      return res.status(404).json({ message: 'Employee record not found' });
    }

    const verifiedByName = await resolveVerifierName(employeeMaster.basic_info_verified_by);

    res.json({
      id: employeeMaster.id,
      userId: employeeMaster.employee_id,
      role: employeeMaster.role,
      email: employeeMaster.company_email_id,
      record: employeeMaster.EmployeeRecord || {},
      basic_info_status: employeeMaster.basic_info_status,
      basic_info_rejection_reason: employeeMaster.basic_info_rejection_reason,
      verifiedByName: verifiedByName
    });

  } catch (error) {
    logger.error('Get Profile Error: %o', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
        firstname, lastname, department_name, job_title, work_location, phone,
        address_line1, address_line2, landmark, post_office, pincode, city, district, state, country,
        date_of_birth, personal_email_id, gender,
        tenth_percentage, twelfth_percentage, adhar_number, pan_number
    } = req.body;

    // Helper to convert empty string to null and ensure YYYY-MM-DD format
    const cleanDate = (date) => {
        if (!date || date === "") return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        return d.toISOString().split('T')[0];
    };
    const cleanNumber = (num) => num === "" ? null : num;

    const cleanedData = {
        firstname, lastname, department_name, job_title, work_location, phone,
        address_line1, address_line2, landmark, post_office, pincode, city, district, state, country,
        personal_email_id, gender, adhar_number, pan_number,
        date_of_birth: cleanDate(date_of_birth),
        tenth_percentage: cleanNumber(tenth_percentage),
        twelfth_percentage: cleanNumber(twelfth_percentage)
    };
    
    // profile_photo 
    const profile_photo = req.body.profile_photo; 

    // Find EmployeeMaster
    const employeeMaster = await EmployeeMaster.findOne({ where: { employee_id: userId } });
    if (!employeeMaster) {
      return res.status(404).json({ message: 'Employee master not found' });
    }

    // Check Lock Status
    if (['SUBMITTED', 'VERIFIED'].includes(employeeMaster.basic_info_status)) {
        return res.status(403).json({ 
            message: 'Profile is locked for verification. Updates not allowed.',
            status: employeeMaster.basic_info_status 
        });
    }

    // Find or Create EmployeeRecord
    let [record, created] = await EmployeeRecord.findOrCreate({
      where: { employee_id: employeeMaster.id },
      defaults: {
        ...cleanedData,
        profile_photo
      }
    });

    if (!created) {
      // Update existing record
      const updateData = {
        ...cleanedData
      };
      // Only update photo if a new one was uploaded
      if (profile_photo) {
        updateData.profile_photo = profile_photo;
      }

      await record.update(updateData);
    }

    // Confirm if email update is requested
    const { email } = req.body;
    if (email) {
        employeeMaster.company_email_id = email;
        await employeeMaster.save();
        
        // Sync with User table
        await User.update({ username: email }, { where: { id: userId } });
    }

    res.json({ message: 'Profile updated successfully', record });

  } catch (error) {
    logger.error('Update Profile Error: %o', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
