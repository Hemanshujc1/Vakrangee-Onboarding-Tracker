const { User, EmployeeMaster, EmployeeRecord } = require('../models');

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const employeeMaster = await EmployeeMaster.findOne({
      where: { user_id: userId },
      include: [{ model: EmployeeRecord }]
    });

    if (!employeeMaster) {
      return res.status(404).json({ message: 'Employee record not found' });
    }

    res.json({
      role: employeeMaster.role,
      email: employeeMaster.company_email_id,
      record: employeeMaster.EmployeeRecord || {}
    });

  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
        firstname, lastname, department_name, job_title, work_location, phone,
        address_line1, address_line2, landmark, pincode, city, district, state, country,
        date_of_birth, personal_email_id, gender,
        tenth_percentage, twelfth_percentage, adhar_number, pan_number
    } = req.body;
    
    // profile_photo will be injected by uploadMiddleware if a file was uploaded
    const profile_photo = req.body.profile_photo; 

    // Find EmployeeMaster
    const employeeMaster = await EmployeeMaster.findOne({ where: { user_id: userId } });
    if (!employeeMaster) {
      return res.status(404).json({ message: 'Employee master not found' });
    }

    // Find or Create EmployeeRecord
    let [record, created] = await EmployeeRecord.findOrCreate({
      where: { employee_id: employeeMaster.id },
      defaults: {
        firstname, lastname, department_name, job_title, work_location, phone,
        address_line1, address_line2, landmark, pincode, city, district, state, country,
        date_of_birth, personal_email_id, gender, 
        tenth_percentage, twelfth_percentage, adhar_number, pan_number,
        profile_photo
      }
    });

    if (!created) {
      // Update existing record
      const updateData = {
        firstname, lastname, department_name, job_title, work_location, phone,
        address_line1, address_line2, landmark, pincode, city, district, state, country,
        date_of_birth, personal_email_id, gender,
        tenth_percentage, twelfth_percentage, adhar_number, pan_number
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
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
