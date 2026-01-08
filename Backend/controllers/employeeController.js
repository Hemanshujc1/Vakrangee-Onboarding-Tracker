const { EmployeeMaster, EmployeeRecord, User } = require('../models');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await EmployeeMaster.findAll({
      include: [
        {
          model: EmployeeRecord,
          attributes: ['firstname', 'lastname', 'department_name', 'job_title', 'work_location', 'personal_email_id', 'date_of_joining', 'profile_photo', 'onboarding_hr_id']
        },
        {
          model: User,
          attributes: ['username'] 
        }
      ]
    });

    
    // Fetch all records with their master status
    const allRecords = await EmployeeRecord.findAll({
        attributes: ['onboarding_hr_id'],
        include: [{
            model: EmployeeMaster,
            attributes: ['onboarding_stage']
        }]
    });

    const adminStats = {}; 

    allRecords.forEach(record => {
        if (record.onboarding_hr_id) {
            if (!adminStats[record.onboarding_hr_id]) {
                adminStats[record.onboarding_hr_id] = { assigned: 0, onboarded: 0 };
            }
            
            adminStats[record.onboarding_hr_id].assigned += 1;
            
            const stage = record.EmployeeMaster?.onboarding_stage;
            if (stage === 'ACTIVE' || stage === 'POST_JOINING') {
                 adminStats[record.onboarding_hr_id].onboarded += 1;
            }
        }
    });


    // Format the response 
    const formattedEmployees = employees.map(emp => {
      const record = emp.EmployeeRecord || {};
      const user = emp.User || {};
      
      const stats = adminStats[emp.user_id] || { assigned: 0, onboarded: 0 };

      return {
        id: emp.id,
        role: emp.role,
        onboarding_stage: emp.onboarding_stage,
        firstName: record.firstname || '',
        lastName: record.lastname || '',
        email: emp.company_email_id || user.username || '', 
        department: record.department_name,
        location: record.work_location,
        jobTitle: record.job_title,
        profilePhoto: record.profile_photo 
            ? `${req.protocol}://${req.get('host')}/uploads/profilepic/${record.profile_photo}`
            : null,
        dateOfJoining: record.date_of_joining,
        firstLoginAt: emp.first_login_at,
        lastLoginAt: emp.last_login_at,
        assignedCount: stats.assigned,
        onboardedCount: stats.onboarded,
        onboardingHrId: record.onboarding_hr_id
      };
    });

    res.json(formattedEmployees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error fetching employees', error: error.message });
  }
};

// Get My HR for the logged-in employee
exports.getMyHR = async (req, res) => {
    try {
        const userId = req.user.id; 
        // console.log(`Debug: getMyHR called for UserID: ${userId}`);

        const empMaster = await EmployeeMaster.findOne({ where: { user_id: userId } });
        if (!empMaster) {
            // console.log("Debug: EmployeeMaster not found for user.");
            return res.status(404).json({ message: 'Employee profile not found' });
        }
        // console.log(`Debug: EmployeeMaster found: ID=${empMaster.id}`);

        const empRecord = await EmployeeRecord.findOne({ where: { employee_id: empMaster.id } });
        if (!empRecord) {
            //  console.log("Debug: EmployeeRecord not found.");
             return res.json(null);
        }
        
        // console.log(`Debug: EmployeeRecord found. Assigned HR ID: ${empRecord.onboarding_hr_id}`);

        if (!empRecord.onboarding_hr_id) {
            //  console.log("Debug: No onboarding_hr_id in record.");
             return res.json(null); 
        }

        const hrId = empRecord.onboarding_hr_id;

        // Find Hr Master
        const hrMaster = await EmployeeMaster.findOne({ where: { user_id: hrId } });
        if (!hrMaster) {
            // console.log(`Debug: HR Master not found for HR_ID: ${hrId}`);
            const hrUserDirect = await User.findByPk(hrId);
            if (hrUserDirect) {
                 return res.json({
                    name: hrUserDirect.username.split('@')[0], // Fallback name
                    email: hrUserDirect.username,
                    phone: 'N/A',
                    department: 'HR (System)',
                    profilePhoto: null,
                    designation: 'System Admin'
                });
            }
            return res.status(404).json({ message: 'Assigned HR profile not found' });
        }

        const hrRecord = await EmployeeRecord.findOne({ where: { employee_id: hrMaster.id } });
        const hrUser = await User.findByPk(hrId);

        // console.log(`Debug: HR Found - Name: ${hrRecord?.firstname}, Email: ${hrUser?.username}`);

        res.json({
            name: (hrRecord?.firstname || '') + ' ' + (hrRecord?.lastname || ''),
            email: hrMaster.company_email_id || hrUser.username,
            phone: hrRecord?.phone || 'N/A',
            department: hrRecord?.department_name || 'Human Resources',
            profilePhoto: hrRecord?.profile_photo 
                ? `${req.protocol}://${req.get('host')}/uploads/profilepic/${hrRecord.profile_photo}` 
                : null,
            designation: hrRecord?.job_title || 'HR Manager'
        });

    } catch (error) {
        console.error('Error fetching My HR:', error);
        res.status(500).json({ message: 'Server error fetching HR details' });
    }
};

// Get single employee by ID
exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await EmployeeMaster.findOne({
            where: { id }, // This is the EmployeeMaster ID
            include: [
                {
                    model: EmployeeRecord,
                    attributes: ['firstname', 'lastname', 'department_name', 'job_title', 'work_location', 'personal_email_id', 'date_of_joining', 'date_of_birth', 'profile_photo', 'onboarding_hr_id', 'phone', 'gender']
                },
                {
                    model: User,
                    attributes: ['username', 'id'] 
                }
            ]
        });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const record = employee.EmployeeRecord || {};
        const user = employee.User || {};

        // Count employees assigned to this person (using their User ID)
        const assignedEmployees = await EmployeeRecord.count({
            where: { onboarding_hr_id: user.id }
        });

        // Count fully onboarded employees assigned to this person
        const assignedRecords = await EmployeeRecord.findAll({
            where: { onboarding_hr_id: user.id },
            include: [{
                model: EmployeeMaster,
                attributes: ['id', 'onboarding_stage', 'first_login_at', 'last_login_at']
            }]
        });

        const activeCount = assignedRecords.filter(r => 
            ['PRE_JOINING_VERIFIED', 'POST_JOINING'].includes(r.EmployeeMaster?.onboarding_stage)
        ).length;

        const completedCount = assignedRecords.filter(r => 
            r.EmployeeMaster?.onboarding_stage === 'ACTIVE'
        ).length;

        // Fetch the list of assigned employees for the details view
        const assignedList = assignedRecords.map(r => ({
            id: r.EmployeeMaster?.id, // Useful for linking
            name: `${r.firstname} ${r.lastname}`,
            department: r.department_name,
            jobTitle: r.job_title,
            joiningDate: r.date_of_joining,
            profilePhoto: r.profile_photo 
                ? `${req.protocol}://${req.get('host')}/uploads/profilepic/${r.profile_photo}`
                : null,
            stage: r.EmployeeMaster?.onboarding_stage,
            firstLoginAt: r.EmployeeMaster?.first_login_at,
            lastLoginAt: r.EmployeeMaster?.last_login_at
        }));

        // Fetch Assigned HR Details if exists
        let assignedHR = null;
        if (record.onboarding_hr_id) {
            const hrUser = await User.findByPk(record.onboarding_hr_id); // HR's User Record
            if (hrUser) {
                // Find Hr Employee record to get name
                const hrMaster = await EmployeeMaster.findOne({ where: { user_id: hrUser.id } });
                const hrRecord = hrMaster ? await EmployeeRecord.findOne({ where: { employee_id: hrMaster.id } }) : null;
                
                assignedHR = {
                    id: record.onboarding_hr_id,
                    name: hrRecord ? `${hrRecord.firstname} ${hrRecord.lastname}` : hrUser.username,
                    email: hrUser.username
                };
            }
        }

        res.json({
            id: employee.id,
            userId: user.id, 
            firstName: record.firstname,
            lastName: record.lastname,
            email: employee.company_email_id || user.username,
            personalEmail: record.personal_email_id,
            phone: record.phone,
            department: record.department_name,
            location: record.work_location,
            jobTitle: record.job_title,
            profilePhoto: record.profile_photo 
                ? `${req.protocol}://${req.get('host')}/uploads/profilepic/${record.profile_photo}`
                : null,
            dateOfJoining: record.date_of_joining,
            dateOfBirth: record.date_of_birth, 
            gender: record.gender,
            role: employee.role,
            onboardingStage: employee.onboarding_stage, 
            assignedHR: assignedHR, 
            stats: {
                totalAssigned: assignedEmployees,
                activeOnboarding: activeCount,
                completed: completedCount
            },
            assignedEmployees: assignedList
        });

    } catch (error) {
        console.error('Error fetching employee details:', error);
        res.status(500).json({ message: 'Server error fetching employee details' });
    }
};

// Update Employee Details (Admin override)
exports.updateEmployeeDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { location, jobTitle, department, dateOfJoining, personalEmail, onboardingHrId, email } = req.body;

        const employee = await EmployeeMaster.findOne({
            where: { id },
            include: [{ model: EmployeeRecord }]
        });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const record = employee.EmployeeRecord;
        if (!record) {
            // Should CREATE one if missing
             return res.status(404).json({ message: 'Employee record not initialized' });
        }

        // Update Fields
        if (location !== undefined) record.work_location = location;
        if (jobTitle !== undefined) record.job_title = jobTitle;
        if (department !== undefined) record.department_name = department;
        
        // New fields
        if (dateOfJoining !== undefined) record.date_of_joining = dateOfJoining;
        if (personalEmail !== undefined) record.personal_email_id = personalEmail;
        if (onboardingHrId !== undefined) record.onboarding_hr_id = onboardingHrId;

        await record.save();

        // Update Master Data (Email)
        if (email !== undefined) {
            employee.company_email_id = email;
            // Sync with User table (username is the email)
            await User.update({ username: email }, { where: { id: employee.user_id } }); 
            await employee.save();
        }

        res.json({ message: 'Details updated successfully', record });

    } catch (error) {
        console.error('Error updating employee details:', error);
        res.status(500).json({ message: 'Server error updating details' });
    }
};
