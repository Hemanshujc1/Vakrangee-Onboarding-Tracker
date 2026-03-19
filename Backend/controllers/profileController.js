const { User, EmployeeMaster, EmployeeRecord, EmployeeDocument } = require('../models');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

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
      basic_info_status: employeeMaster.basic_info_status,
      basic_info_rejection_reason: employeeMaster.basic_info_rejection_reason,
      verifiedByName: verifiedByName,
      signature: employeeMaster.EmployeeRecord ? employeeMaster.EmployeeRecord.signature : null,
      record: employeeMaster.EmployeeRecord // Added to return full record
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
        firstname, middlename, lastname, department_name, job_title, work_location, phone,
        address_line1, address_line2, landmark, post_office, pincode, city, district, state, country,
        date_of_birth, personal_email_id, gender,
        tenth_percentage, twelfth_percentage, degree_name, degree_percentage, adhar_number, pan_number, pan_verified,
        department_id, designation_id
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
        firstname, middlename, lastname, department_name, job_title, work_location, phone,
        address_line1, address_line2, landmark, post_office, pincode, city, district, state, country,
        personal_email_id, gender, adhar_number, pan_number, degree_name,
        pan_verified: pan_verified === 'true' || pan_verified === true,
        date_of_birth: cleanDate(date_of_birth),
        tenth_percentage: cleanNumber(tenth_percentage),
        twelfth_percentage: cleanNumber(twelfth_percentage),
        degree_percentage: cleanNumber(degree_percentage),
        department_id: cleanNumber(department_id),
        designation_id: cleanNumber(designation_id)
    };
    
    // profile_photo & signature
    const profile_photo = req.body.profile_photo; 
    const signature = req.body.signature_path;

    // Find EmployeeMaster
    const employeeMaster = await EmployeeMaster.findOne({ where: { employee_id: userId } });
    if (!employeeMaster) {
      return res.status(404).json({ message: 'Employee master not found' });
    }

    // Check Lock Status
    if (employeeMaster.basic_info_status === 'SUBMITTED') {
        return res.status(403).json({ 
            message: 'Profile is locked for verification. Updates not allowed.',
            status: employeeMaster.basic_info_status 
        });
    }

    if (employeeMaster.basic_info_status === 'VERIFIED') {
        // Allow update if some docs are REJECTED or newly UPLOADED (waiting for resubmission)
        const pendingDocsCount = await EmployeeDocument.count({
            where: {
                employee_id: employeeMaster.id,
                status: ['REJECTED', 'UPLOADED']
            }
        });

        // Also allow if final summary email hasn't been sent (implies HR expectations of resubmission)
        if (pendingDocsCount === 0 && employeeMaster.final_verification_email_sent) {
            return res.status(403).json({ 
                message: 'Profile is verified and locked. Updates not allowed.',
                status: employeeMaster.basic_info_status 
            });
        }
    }

    // Find or Create EmployeeRecord
    let [record, created] = await EmployeeRecord.findOrCreate({
      where: { employee_id: employeeMaster.id },
      defaults: {
        ...cleanedData,
        profile_photo,
        signature
      }
    });

    if (!created) {
      // Update existing record
      const updateData = {
        ...cleanedData
      };
      // Only update photo if a new one was uploaded
      if (profile_photo) {
        // Delete old profile photo if exists
        if (record.profile_photo) {
            const oldPhotoPath = path.join(__dirname, '..', 'uploads', 'profilepic', record.profile_photo);
            if (fs.existsSync(oldPhotoPath)) {
                try {
                    fs.unlinkSync(oldPhotoPath);
                } catch (err) {
                    logger.warn('Error deleting old profile photo: %o', err);
                }
            }
        }
        updateData.profile_photo = profile_photo;

        // Sync with EmployeeDocument
        await EmployeeDocument.findOrCreate({
            where: { 
                employee_id: employeeMaster.id,
                document_type: 'Passport Size Photo'
            },
            defaults: {
                file_path: profile_photo,
                status: 'UPLOADED'
            }
        }).then(([doc, created]) => {
            if (!created) {
                return doc.update({
                    file_path: profile_photo,
                    status: 'UPLOADED',
                    uploaded_at: new Date()
                });
            }
        });
      }
      if (signature) {
        // Delete old signature if exists
        if (record.signature) {
            const oldSignaturePath = path.join(__dirname, '..', 'uploads', 'signatures', record.signature);
            if (fs.existsSync(oldSignaturePath)) {
                try {
                    fs.unlinkSync(oldSignaturePath);
                } catch (err) {
                    logger.warn('Error deleting old signature: %o', err);
                }
            }
        }
        updateData.signature = signature;

        // Sync with EmployeeDocument
        await EmployeeDocument.findOrCreate({
            where: { 
                employee_id: employeeMaster.id,
                document_type: 'Signature'
            },
            defaults: {
                file_path: signature,
                status: 'UPLOADED'
            }
        }).then(([doc, created]) => {
            if (!created) {
                return doc.update({
                    file_path: signature,
                    status: 'UPLOADED',
                    uploaded_at: new Date()
                });
            }
        });
      }

      await record.update(updateData);
    } else {
        // Record was just created, sync docs if photo/sig provided
        if (profile_photo) {
            await EmployeeDocument.create({
                employee_id: employeeMaster.id,
                document_type: 'Passport Size Photo',
                file_path: profile_photo,
                status: 'UPLOADED'
            });
        }
        if (signature) {
            await EmployeeDocument.create({
                employee_id: employeeMaster.id,
                document_type: 'Signature',
                file_path: signature,
                status: 'UPLOADED'
            });
        }
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
