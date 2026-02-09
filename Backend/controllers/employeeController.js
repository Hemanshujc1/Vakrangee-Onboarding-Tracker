const { EmployeeMaster, EmployeeRecord, User } = require("../models");
const logger = require("../utils/logger");

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await EmployeeMaster.findAll({
      include: [
        {
          model: EmployeeRecord,
          attributes: [
            "firstname",
            "lastname",
            "department_name",
            "job_title",
            "work_location",
            "personal_email_id",
            "date_of_joining",
            "profile_photo",
            "onboarding_hr_id",
          ],
        },
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });

    // Fetch all records with their master status
    const allRecords = await EmployeeRecord.findAll({
      attributes: ["onboarding_hr_id"],
      include: [
        {
          model: EmployeeMaster,
          attributes: ["onboarding_stage"],
        },
      ],
    });

    const adminStats = {};
    const hrIds = new Set();

    allRecords.forEach((record) => {
      if (record.onboarding_hr_id) {
        hrIds.add(record.onboarding_hr_id); // Collect HR IDs

        if (!adminStats[record.onboarding_hr_id]) {
          adminStats[record.onboarding_hr_id] = {
            assigned: 0,
            onboarded: 0,
            notJoined: 0,
          };
        }

        adminStats[record.onboarding_hr_id].assigned += 1;

        const stage = record.EmployeeMaster?.onboarding_stage;
        if (stage === "ONBOARDED" || stage === "POST_JOINING") {
          adminStats[record.onboarding_hr_id].onboarded += 1;
        } else if (stage === "Not_joined") {
          adminStats[record.onboarding_hr_id].notJoined += 1;
        }
      }
    });

    //  fetch HR Names
    const hrMap = {};
    if (hrIds.size > 0) {
      const hrMasters = await EmployeeMaster.findAll({
        where: { employee_id: Array.from(hrIds) },
        include: [
          {
            model: EmployeeRecord,
            attributes: ["firstname", "lastname", "work_location"],
          },
        ],
      });

      hrMasters.forEach((hr) => {
        const name = hr.EmployeeRecord
          ? `${hr.EmployeeRecord.firstname} ${hr.EmployeeRecord.lastname}`
          : "Unknown HR";
        const location = hr.EmployeeRecord
          ? hr.EmployeeRecord.work_location
          : null;
        hrMap[hr.employee_id] = { name, location };
      });

      // Fallback for HRs who might be just Users without EmployeeMaster
      const foundHrIds = hrMasters.map((h) => h.employee_id);
      const missingHrIds = Array.from(hrIds).filter(
        (id) => !foundHrIds.includes(id),
      );

      if (missingHrIds.length > 0) {
        const miscUsers = await User.findAll({
          where: { id: missingHrIds },
          attributes: ["id", "username"],
        });
        miscUsers.forEach((u) => {
          hrMap[u.id] = { name: u.username, location: null }; 
        });
      }
    }

    // Format the response
    const formattedEmployees = employees.map((emp) => {
      const record = emp.EmployeeRecord || {};
      const user = emp.User || {};

      const stats = adminStats[emp.employee_id] || {
        assigned: 0,
        onboarded: 0,
        notJoined: 0,
      };
      const hrInfo = record.onboarding_hr_id
        ? hrMap[record.onboarding_hr_id]
        : null;
      const assignedHRName = hrInfo
        ? hrInfo.name
        : record.onboarding_hr_id
          ? "N/A"
          : "-";
      const assignedHRLocation = hrInfo ? hrInfo.location : null;

      return {
        id: emp.id,
        userId: emp.employee_id,
        role: emp.role,
        onboarding_stage: emp.onboarding_stage,
        firstName: record.firstname || "",
        lastName: record.lastname || "",
        email: emp.company_email_id || user.username || "",
        department: record.department_name,
        location: record.work_location,
        jobTitle: record.job_title,
        profilePhoto: record.profile_photo
          ? `${req.protocol}://${req.get("host")}/uploads/profilepic/${record.profile_photo}`
          : null,
        dateOfJoining: record.date_of_joining,
        firstLoginAt: emp.first_login_at,
        lastLoginAt: emp.last_login_at,
        assignedCount: stats.assigned,
        onboardedCount: stats.onboarded,
        notJoinedCount: stats.notJoined,
        onboardingHrId: record.onboarding_hr_id,
        assignedHRName: assignedHRName,
        assignedHRLocation: assignedHRLocation,
        accountStatus: emp.account_status,
        isDeleted: emp.is_deleted,
      };
    });

    res.json(formattedEmployees);
  } catch (error) {
    logger.error("Error fetching employees: %o", error);
    res
      .status(500)
      .json({
        message: "Server error fetching employees",
        error: error.message,
      });
  }
};

// Get My HR for the logged-in employee
exports.getMyHR = async (req, res) => {
  try {
    const userId = req.user.id;

    const empMaster = await EmployeeMaster.findOne({
      where: { employee_id: userId },
    });
    if (!empMaster) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const empRecord = await EmployeeRecord.findOne({
      where: { employee_id: empMaster.id },
    });
    if (!empRecord) {
      return res.json(null);
    }

    if (!empRecord.onboarding_hr_id) {
      return res.json(null);
    }

    const hrId = empRecord.onboarding_hr_id;

    // Find Hr Master
    const hrMaster = await EmployeeMaster.findOne({ where: { employee_id: hrId } });
    if (!hrMaster) {
      const hrUserDirect = await User.findByPk(hrId);
      if (hrUserDirect) {
        return res.json({
          name: hrUserDirect.username.split("@")[0], // Fallback name
          email: hrUserDirect.username,
          phone: "N/A",
          department: "HR (System)",
          profilePhoto: null,
          designation: "System Admin",
        });
      }
      return res.status(404).json({ message: "Assigned HR profile not found" });
    }

    const hrRecord = await EmployeeRecord.findOne({
      where: { employee_id: hrMaster.id },
    });
    const hrUser = await User.findByPk(hrId);

    res.json({
      name: (hrRecord?.firstname || "") + " " + (hrRecord?.lastname || ""),
      email: hrMaster.company_email_id || hrUser.username,
      phone: hrRecord?.phone || "N/A",
      department: hrRecord?.department_name || "Human Resources",
      profilePhoto: hrRecord?.profile_photo
        ? `${req.protocol}://${req.get("host")}/uploads/profilepic/${hrRecord.profile_photo}`
        : null,
      designation: hrRecord?.job_title || "HR Manager",
    });
  } catch (error) {
    logger.error("Error fetching My HR: %o", error);
    res.status(500).json({ message: "Server error fetching HR details" });
  }
};

// Get current logged-in employee details
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const employee = await EmployeeMaster.findOne({
      where: { employee_id: userId },
      include: [
        {
           model: EmployeeRecord
        }
      ]
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    res.json({
      id: employee.id, // EmployeeMaster ID
      onboardingStage: employee.onboarding_stage,
      disabledForms: employee.disabled_forms || [],
      basicInfoStatus: employee.basic_info_status,
      firstName: employee.EmployeeRecord?.firstname,
      lastName: employee.EmployeeRecord?.lastname,
    });
  } catch (error) {
    logger.error("Error fetching my details: %o", error);
    res.status(500).json({ message: "Server error fetching details" });
  }
};

// Get Dashboard Stats for Employee
exports.getDashboardStats = async (req, res) => {
  try {
      const userId = req.user.id;
      const employee = await EmployeeMaster.findOne({
          where: { employee_id: userId },
          include: [{ model: EmployeeRecord }]
      });

      if (!employee) {
          return res.status(404).json({ message: "Employee not found" });
      }

      
      const basicInfoProgress = ["SUBMITTED", "VERIFIED"].includes(employee.basic_info_status) ? 100 : 0;
    
      const { FormSubmission } = require("../models"); 
      
      const submittedForms = await FormSubmission.count({
          where: { employee_id: employee.id }
      });
      const totalForms = 8;
      const progressPercentage = Math.round(((basicInfoProgress > 0 ? 1 : 0) + submittedForms) / (1 + totalForms) * 100);

      // Determine next action
      let nextAction = null;
      if (employee.basic_info_status === 'PENDING' || employee.basic_info_status === 'REJECTED') {
          nextAction = {
              title: "Submit Basic Information",
              description: employee.basic_info_status === 'REJECTED' 
                  ? `Your profile was rejected: ${employee.basic_info_rejection_reason || 'Check details'}` 
                  : "Complete your personal profile to proceed.",
              link: "/employee/basic-info",
              type: "urgent"
          };
      } else if (employee.basic_info_status === 'SUBMITTED') {
             nextAction = {
              title: "Wait for Verification",
              description: "Your profile is under review by HR.",
              link: null,
              type: "info"
          };
      } else if (employee.onboarding_stage === 'PRE_JOINING') {
           nextAction = {
              title: "Complete Pre-Joining Forms",
              description: "Fill out NDA, Mediclaim, and Declaration forms.",
              link: "/employee/pre-joining",
              type: "action"
          };
      } else if (employee.onboarding_stage === 'POST_JOINING' || employee.onboarding_stage === 'ONBOARDED') {
           // check if all post joining forms are done
           nextAction = {
              title: "Complete Post-Joining Forms",
              description: "Finish EPF, Gratuity and other joining documents.",
              link: "/employee/post-joining",
              type: "action"
          };
      }

      res.json({
          progress: Math.min(progressPercentage, 100),
          basicInfoStatus: employee.basic_info_status,
          onboardingStage: employee.onboarding_stage,
          completedFormsCount: submittedForms,
          nextAction
      });

  } catch (error) {
      logger.error("Error fetching dashboard stats: %o", error);
      res.status(500).json({ message: "Server error fetching stats" });
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
          attributes: [
            "firstname",
            "lastname",
            "department_name",
            "job_title",
            "work_location",
            "personal_email_id",
            "date_of_joining",
            "date_of_birth",
            "profile_photo",
            "onboarding_hr_id",
            "onboarding_hr_assigned_at",
            "phone",
            "gender",
            // Address fields
            "address_line1",
            "address_line2",
            "landmark",
            "city",
            "district",
            "state",
            "country",
            "pincode",
            // Education & Identity
            "tenth_percentage",
            "twelfth_percentage",
            "adhar_number",
            "pan_number",
          ],
        },
        {
          model: User,
          attributes: ["username", "id"],
        },
      ],
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Only allow if user is HR/SuperAdmin OR if the user owns this record
    if (
      !["HR_SUPER_ADMIN", "HR_ADMIN"].includes(req.user.role) &&
      employee.employee_id !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied. You are not authorized to view this profile." });
    }

    const record = employee.EmployeeRecord || {};
    const user = employee.User || {};

    // Count employees assigned to this person (using their User ID)
    const assignedEmployees = await EmployeeRecord.count({
      where: { onboarding_hr_id: user.id },
    });

    // Count fully onboarded employees assigned to this person
    const assignedRecords = await EmployeeRecord.findAll({
      where: { onboarding_hr_id: user.id },
      include: [
        {
          model: EmployeeMaster,
          attributes: [
            "id",
            "onboarding_stage",
            "first_login_at",
            "last_login_at",
          ],
        },
      ],
    });

    const activeCount = assignedRecords.filter((r) =>
      ["PRE_JOINING_VERIFIED", "POST_JOINING"].includes(
        r.EmployeeMaster?.onboarding_stage,
      ),
    ).length;

    const completedCount = assignedRecords.filter(
      (r) => r.EmployeeMaster?.onboarding_stage === "ONBOARDED",
    ).length;

    const notJoinedCount = assignedRecords.filter(
      (r) => r.EmployeeMaster?.onboarding_stage === "Not_joined",
    ).length;

    // Fetch the list of assigned employees for the details view
    const assignedList = assignedRecords.map((r) => ({
      id: r.EmployeeMaster?.id,
      firstName: r.firstname,
      lastName: r.lastname,
      name: `${r.firstname} ${r.lastname}`, 
      department: r.department_name,
      jobTitle: r.job_title,
      location: r.work_location,
      dateOfJoining: r.date_of_joining,
      profilePhoto: r.profile_photo
        ? `${req.protocol}://${req.get("host")}/uploads/profilepic/${r.profile_photo}`
        : null,
      onboarding_stage: r.EmployeeMaster?.onboarding_stage,
      stage: r.EmployeeMaster?.onboarding_stage,
      firstLoginAt: r.EmployeeMaster?.first_login_at,
      lastLoginAt: r.EmployeeMaster?.last_login_at,
      assignedDate: r.onboarding_hr_assigned_at,
    }));

    // Fetch Assigned HR Details if exists
    let assignedHR = null;
    if (record.onboarding_hr_id) {
      const hrUser = await User.findByPk(record.onboarding_hr_id); // HR's User Record
      if (hrUser) {
        // Find Hr Employee record to get name
        const hrMaster = await EmployeeMaster.findOne({
          where: { employee_id: hrUser.id },
        });
        const hrRecord = hrMaster
          ? await EmployeeRecord.findOne({
              where: { employee_id: hrMaster.id },
            })
          : null;

        assignedHR = {
          id: record.onboarding_hr_id,
          name: (hrRecord && (hrRecord.firstname || hrRecord.lastname))
            ? `${hrRecord.firstname || ""} ${hrRecord.lastname || ""}`.trim()
            : hrUser.username,
          email: hrUser.username,
        };
      }
    }

    // Fetch Basic Info Verifier Name if it exists
    let basicInfoVerifiedByName = null;
    if (employee.basic_info_verified_by) {
        if (assignedHR && assignedHR.id == employee.basic_info_verified_by) { 
             basicInfoVerifiedByName = assignedHR.name;
        } else {
            const verifierUser = await User.findByPk(employee.basic_info_verified_by);
            if (verifierUser) {
                const verifierMaster = await EmployeeMaster.findOne({ where: { employee_id: verifierUser.id }});
                const verifierRecord = verifierMaster ? await EmployeeRecord.findOne({ where: { employee_id: verifierMaster.id } }) : null;
                
                if (verifierRecord && (verifierRecord.firstname || verifierRecord.lastname)) {
                    basicInfoVerifiedByName = `${verifierRecord.firstname || ""} ${verifierRecord.lastname || ""}`.trim();
                } else {
                    basicInfoVerifiedByName = verifierUser.username;
                }
            }
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
        ? `${req.protocol}://${req.get("host")}/uploads/profilepic/${record.profile_photo}`
        : null,
      profilePhotoFile: record.profile_photo,
      firstLoginAt: employee.first_login_at,
      dateOfJoining: record.date_of_joining,
      dateOfBirth: record.date_of_birth,
      gender: record.gender,

      // Address
      addressLine1: record.address_line1,
      addressLine2: record.address_line2,
      landmark: record.landmark,
      city: record.city,
      district: record.district,
      state: record.state,
      country: record.country,
      pincode: record.pincode,

      // Education & Identity
      tenthPercentage: record.tenth_percentage,
      twelfthPercentage: record.twelfth_percentage,
      adharNumber: record.adhar_number,
      panNumber: record.pan_number,

      role: employee.role,
      accountStatus: employee.account_status,
      onboardingStage: employee.onboarding_stage,
      assignedHR: assignedHR,
      assignedHRAssignedAt: record.onboarding_hr_assigned_at,
      stats: {
        totalAssigned: assignedEmployees,
        activeOnboarding: activeCount,
        completed: completedCount,
        notJoined: notJoinedCount,
      },
      assignedEmployees: assignedList,
      basicInfoStatus: employee.basic_info_status,
      basicInfoRejectionReason: employee.basic_info_rejection_reason,
      basicInfoVerifiedByName: basicInfoVerifiedByName,
      disabledForms: employee.disabled_forms || [],
    });
  } catch (error) {
    logger.error("Error fetching employee details: %o", error);
    res.status(500).json({ message: "Server error fetching employee details" });
  }
};

// Update Employee Details (Admin override)
exports.updateEmployeeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      location,
      jobTitle,
      department,
      dateOfJoining,
      personalEmail,
      onboardingHrId,
      email,
      accountStatus,
      onboarding_stage,
      firstLoginAt,
      lastLoginAt
    } = req.body;

    const employee = await EmployeeMaster.findOne({
      where: { id },
      include: [{ model: EmployeeRecord }],
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const record = employee.EmployeeRecord;
    if (!record) {
      // Should CREATE one if missing
      return res
        .status(404)
        .json({ message: "Employee record not initialized" });
    }

    // Update Fields
    if (location !== undefined) record.work_location = location;
    if (jobTitle !== undefined) record.job_title = jobTitle;
    if (department !== undefined) record.department_name = department;

    // New fields
    if (dateOfJoining !== undefined) record.date_of_joining = dateOfJoining;
    if (personalEmail !== undefined) record.personal_email_id = personalEmail;
    if (onboardingHrId !== undefined) {
      record.onboarding_hr_id = onboardingHrId;
      record.onboarding_hr_assigned_at = new Date();
    }

    await record.save();

    // Update Master Data
    let masterChanged = false;

    if (email !== undefined) {
      employee.company_email_id = email;
      // Sync with User table (username is the email)
      await User.update(
        { username: email },
        { where: { id: employee.employee_id } },
      );
      masterChanged = true;
    }

    if (accountStatus !== undefined) {
        employee.account_status = accountStatus;
        
        // If reactivating, clear deletion flags
        if (['ACTIVE', 'INVITED'].includes(accountStatus)) {
             employee.is_deleted = false;
             employee.deleted_at = null;
             employee.deleted_by = null;

             // If stage was cleared to Not_joined, reset to safe start
             if (employee.onboarding_stage === 'Not_joined') {
                 employee.onboarding_stage = 'BASIC_INFO';
             }
        }
        masterChanged = true;
    }
    if (onboarding_stage !== undefined) {
        employee.onboarding_stage = onboarding_stage;
        masterChanged = true;
    }
    if (firstLoginAt !== undefined) {
        employee.first_login_at = firstLoginAt; // Pass null to reset
        masterChanged = true;
    }
    if (lastLoginAt !== undefined) {
        employee.last_login_at = lastLoginAt; // Pass null to reset
        masterChanged = true;
    }

    if (masterChanged) {
        await employee.save();
    }

    res.json({ message: "Details updated successfully", record });
  } catch (error) {
    logger.error("Error updating employee details: %o", error);
    res.status(500).json({ message: "Server error updating details" });
  }
};

// Submit Basic Info (Employee)
exports.submitBasicInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const employee = await EmployeeMaster.findOne({
      where: { employee_id: userId },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Only allow submission if PENDING or REJECTED
    if (["SUBMITTED", "VERIFIED"].includes(employee.basic_info_status)) {
      return res
        .status(400)
        .json({ message: "Profile is locked or already verified." });
    }

    employee.basic_info_status = "SUBMITTED";
    await employee.save();

    res.json({
      message: "Profile submitted for verification",
      status: "SUBMITTED",
    });
  } catch (error) {
    logger.error("Error submitting profile: %o", error);
    res.status(500).json({ message: "Server error submitting profile" });
  }
};

// Verify/Reject Basic Info (HR)
exports.verifyBasicInfo = async (req, res) => {
  try {
    const { id } = req.params; // Employee ID (Master ID)
    const { status, rejectionReason } = req.body; // status: 'VERIFIED' | 'REJECTED'
    const hrUserId = req.user.id; // The HR doing the action

    if (!["VERIFIED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const employee = await EmployeeMaster.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    employee.basic_info_status = status;
    employee.basic_info_verified_by = hrUserId;
    employee.basic_info_verified_at = new Date();

    if (status === "VERIFIED") {
      employee.onboarding_stage = "PRE_JOINING"; // Advance stage
      employee.basic_info_rejection_reason = null; // Clear reason
    } else {
      employee.basic_info_rejection_reason =
        rejectionReason || "Details mismatch or incomplete";
      // Stage "BASIC_INFO" allows edits
    }

    await employee.save();

    res.json({
      message: `Profile ${status}`,
      status: employee.basic_info_status,
      stage: employee.onboarding_stage,
    });
  } catch (error) {
    logger.error("Error verifying profile: %o", error);
    res.status(500).json({ message: "Server error verifying profile" });
  }
};

// Toggle Form Access (Admin)
exports.updateFormAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { formKey, disabled } = req.body; // e.g. "GRATUITY", true/false

    const employee = await EmployeeMaster.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let currentDisabled = employee.disabled_forms || [];
    
    if (disabled) {
      if (!currentDisabled.includes(formKey)) {
        currentDisabled.push(formKey);
      }
    } else {
      currentDisabled = currentDisabled.filter(k => k !== formKey);
    }

    employee.disabled_forms = currentDisabled;
    await employee.save();

    res.json({ 
      message: `Form access updated`, 
      disabledForms: employee.disabled_forms 
    });

  } catch (error) {
    logger.error("Error updating form access: %o", error);
    res.status(500).json({ message: "Server error updating form access" });
  }
};

// Advance Onboarding Stage (Admin)
exports.advanceOnboardingStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body; 
    // Allowed transitions usually handled by specific actions, but this is a manual override/progression
    // e.g. PRE_JOINING -> POST_JOINING
    
    if (!['POST_JOINING', 'ONBOARDED'].includes(stage)) {
       return res.status(400).json({ message: "Invalid stage transition requested." });
    }

    const employee = await EmployeeMaster.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // specific validation logic could go here
    // e.g. only if PRE_JOINING can go to POST_JOINING

    employee.onboarding_stage = stage;
    await employee.save();

    res.json({
      message: `Stage updated to ${stage}`,
      stage: employee.onboarding_stage
    });

  } catch (error) {
    logger.error("Error advancing stage: %o", error);
    res.status(500).json({ message: "Server error advancing stage" });
  }
};

// Soft Delete Employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingAdminId = req.user.id;

    const employee = await EmployeeMaster.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Perform Soft Delete
    employee.account_status = "Inactive";
    employee.onboarding_stage = "Not_joined";
    employee.is_deleted = true;
    employee.deleted_at = new Date();
    employee.deleted_by = requestingAdminId;

    await employee.save();

    res.json({
      message: "Employee deactivated successfully",
      id: employee.id,
      status: "Inactive",
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Server error deleting employee" });
  }
};
