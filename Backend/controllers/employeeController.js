const {
  EmployeeMaster,
  EmployeeRecord,
  User,
  FormSubmission,
  EmployeeDocument,
} = require("../models");
const logger = require("../utils/logger");
const formHandler = require("../utils/formHandler");
const { sendReminderEmail } = require("../services/emailServiceforEmployee");

// ─── JSON group helpers ────────────────────────────────────────────────────────
const getEmpStatus = (emp) => emp?.employee_status || {};
const getBasicInfo = (emp) => emp?.basic_info || {};
const getPersonalInfo = (rec) => rec?.personal_info || {};
const getContactInfo = (rec) => rec?.contact_info || {};
const getJobInfo = (rec) => rec?.job_info || {};
const getAcademicDetails = (rec) => rec?.academic_details || {};
const getPermanentAddress = (rec) => (rec?.address_info || [])[0] || {};
const getCommunicationAddress = (rec) => (rec?.address_info || [])[1] || {};

// ─── Work location display helper ─────────────────────────────────────────────
const formatWorkLocation = (wl) =>
  wl ? [wl.city, wl.district, wl.state].filter(Boolean).join(", ") : null;

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await EmployeeMaster.findAll({
      include: [
        { model: EmployeeRecord },
        { model: User, attributes: ["username"] },
      ],
    });

    // Fetch all records with their master status for HR stats
    const allRecords = await EmployeeRecord.findAll({
      attributes: ["onboarding_hr_id", "employee_id"],
      include: [
        {
          model: EmployeeMaster,
          attributes: ["employee_status"],
        },
      ],
    });

    const adminStats = {};
    const hrIds = new Set();

    allRecords.forEach((record) => {
      if (record.onboarding_hr_id) {
        hrIds.add(record.onboarding_hr_id);

        if (!adminStats[record.onboarding_hr_id]) {
          adminStats[record.onboarding_hr_id] = {
            assigned: 0,
            onboarded: 0,
            notJoined: 0,
          };
        }

        adminStats[record.onboarding_hr_id].assigned += 1;

        const empStatus = getEmpStatus(record.EmployeeMaster);
        const stage = empStatus.onboarding_stage;
        const status = empStatus.account_status;

        if (status === "Inactive") {
          adminStats[record.onboarding_hr_id].notJoined += 1;
        } else if (stage === "ONBOARDED" || stage === "POST_JOINING") {
          adminStats[record.onboarding_hr_id].onboarded += 1;
        }
      }
    });

    // Fetch HR names
    const hrMap = {};
    if (hrIds.size > 0) {
      const hrMasters = await EmployeeMaster.findAll({
        where: { employee_id: Array.from(hrIds) },
        include: [{ model: EmployeeRecord }],
      });

      hrMasters.forEach((hr) => {
        const pi = getPersonalInfo(hr.EmployeeRecord);
        const name = pi.firstname
          ? `${pi.firstname} ${pi.lastname || ""}`.trim()
          : "Unknown HR";
        const location = hr.EmployeeRecord
          ? formatWorkLocation(hr.EmployeeRecord.work_location)
          : null;
        hrMap[hr.employee_id] = { name, location };
      });

      // Fallback for HRs without EmployeeMaster
      const foundHrIds = hrMasters.map((h) => h.employee_id);
      const missingHrIds = Array.from(hrIds).filter(
        (id) => !foundHrIds.includes(id)
      );
      if (missingHrIds.length > 0) {
        const miscUsers = await User.findAll({
          where: { employee_id: missingHrIds },
          attributes: ["employee_id", "username"],
        });
        miscUsers.forEach((u) => {
          hrMap[u.employee_id] = { name: u.username, location: null };
        });
      }
    }

    // Format the response
    const formattedEmployees = employees.map((emp) => {
      const record = emp.EmployeeRecord || {};
      const user = emp.User || {};
      const empStatus = getEmpStatus(emp);
      const pi = getPersonalInfo(record);
      const ji = getJobInfo(record);

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
        employeeId: emp.employee_id || "", // The actual string ID (EMP1001)
        role: emp.role,
        onboarding_stage: empStatus.onboarding_stage,
        firstName: pi.firstname || "",
        lastName: pi.lastname || "",
        email: emp.company_email_id || user.username || "",
        department: ji.department_name,
        department_id: ji.department_id,
        location: formatWorkLocation(record.work_location),
        jobTitle: ji.job_title,
        designation_id: ji.designation_id,
        profilePhoto: record.profile_photo
          ? `${req.protocol}://${req.get("host")}/uploads/profilepic/${record.profile_photo}`
          : null,
        dateOfJoining: ji.date_of_joining,
        firstLoginAt: empStatus.first_login_at,
        lastLoginAt: empStatus.last_login_at,
        assignedCount: stats.assigned,
        onboardedCount: stats.onboarded,
        notJoinedCount: stats.notJoined,
        onboardingHrId: record.onboarding_hr_id,
        assignedHRName,
        assignedHRLocation,
        accountStatus: empStatus.account_status,
        isDeleted: empStatus.is_deleted,
      };
    });

    res.json(formattedEmployees);
  } catch (error) {
    logger.error("Error fetching employees: %o", error);
    res.status(500).json({
      message: "Server error fetching employees",
      error: error.message,
    });
  }
};

// Get current logged-in employee details
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const employee = await EmployeeMaster.findOne({
      where: { employee_id: req.user.employee_id },
      include: [{ model: EmployeeRecord }],
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const empStatus = getEmpStatus(employee);
    const bi = getBasicInfo(employee);
    const pi = getPersonalInfo(employee.EmployeeRecord);

    res.json({
      id: employee.id,
      employeeId: employee.employee_id || "",
      onboardingStage: empStatus.onboarding_stage,
      disabledForms: employee.disabled_forms || [],
      basicInfoStatus: bi.basic_info_status,
      firstName: pi.firstname,
      lastName: pi.lastname,
      signature: employee.EmployeeRecord?.signature,
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
      where: { employee_id: req.user.employee_id },
      include: [{ model: EmployeeRecord }],
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const empStatus = getEmpStatus(employee);
    const bi = getBasicInfo(employee);

    // 1. Basic Details Verification status
    const isBasicInfoVerified = bi.basic_info_status === "VERIFIED";

    // 2. Mandatory Documents Verification status
    const mandatoryDocs = [
      "PAN Card",
      "Aadhar Card",
      "10th Marksheet",
      "12th Marksheet",
      "Degree Certificate",
      "Cancelled Cheque",
      "Passport Size Photo",
      "Signature",
    ];
    const verifiedDocsCount = await EmployeeDocument.count({
      where: {
        employee_id: employee.employee_id,
        status: "VERIFIED",
        document_type: mandatoryDocs,
      },
    });
    const areDocsVerified = verifiedDocsCount >= mandatoryDocs.length;

    // Calculate Stage 1 Progress (33% total)
    let stage1Progress = 0;
    if (isBasicInfoVerified && areDocsVerified) {
      stage1Progress = 33;
    } else if (isBasicInfoVerified || areDocsVerified) {
      stage1Progress = 17;
    }

    // Calculate Other Forms Progress (67% total)
    const submittedForms = await FormSubmission.count({
      where: {
        employee_id: employee.employee_id,
        status: ["SUBMITTED", "VERIFIED"],
      },
    });

    const totalOtherForms = 8;
    const otherFormsProgress =
      totalOtherForms > 0 ? (submittedForms / totalOtherForms) * 67 : 0;

    const progressPercentage = Math.round(stage1Progress + otherFormsProgress);

    // Determine next action
    let nextAction = null;
    const biStatus = bi.basic_info_status;
    const stage = empStatus.onboarding_stage;

    if (biStatus === "PENDING" || biStatus === "REJECTED") {
      nextAction = {
        title: "Submit Basic Information",
        description:
          biStatus === "REJECTED"
            ? `Your profile was rejected: ${bi.basic_info_rejection_reason || "Check details"}`
            : "Complete your personal profile to proceed.",
        link: "/employee/basic-info",
        type: "urgent",
      };
    } else if (biStatus === "SUBMITTED") {
      nextAction = {
        title: "Wait for Verification",
        description: "Your profile is under review by HR.",
        link: null,
        type: "info",
      };
    } else if (stage === "PRE_JOINING") {
      nextAction = {
        title: "Complete Pre-Joining Forms",
        description: "Fill out NDA, Mediclaim, and Declaration forms.",
        link: "/employee/pre-joining",
        type: "action",
      };
    } else if (stage === "POST_JOINING" || stage === "ONBOARDED") {
      nextAction = {
        title: "Complete Post-Joining Forms",
        description: "Finish EPF, Gratuity and other joining documents.",
        link: "/employee/post-joining",
        type: "action",
      };
    }

    res.json({
      progress: Math.min(progressPercentage, 100),
      basicInfoStatus: biStatus,
      onboardingStage: stage,
      completedFormsCount: submittedForms,
      docsVerified: areDocsVerified,
      nextAction,
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
      where: { id },
      include: [
        { model: EmployeeRecord },
        { model: User, attributes: ["username", "id"] },
      ],
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Only allow if user is HR/SuperAdmin OR if the user owns this record
    if (
      !["HR_SUPER_ADMIN", "HR_ADMIN"].includes(req.user.role) &&
      employee.employee_id !== req.user.employee_id
    ) {
      return res.status(403).json({
        message: "Access denied. You are not authorized to view this profile.",
      });
    }

    const record = employee.EmployeeRecord || {};
    const user = employee.User || {};
    const empStatus = getEmpStatus(employee);
    const bi = getBasicInfo(employee);
    const pi = getPersonalInfo(record);
    const ci = getContactInfo(record);
    const ji = getJobInfo(record);
    const acad = getAcademicDetails(record);
    const permAddr = getPermanentAddress(record);
    const commAddr = getCommunicationAddress(record);

    // Count employees assigned to this person (flat column, direct query)
    const assignedEmployees = await EmployeeRecord.count({
      where: { onboarding_hr_id: user.id },
    });

    // Fetch assigned records with their master status
    const assignedRecords = await EmployeeRecord.findAll({
      where: { onboarding_hr_id: user.id },
      include: [
        {
          model: EmployeeMaster,
          attributes: ["id", "employee_status"],
        },
      ],
    });

    const activeCount = assignedRecords.filter((r) => {
      const master = r.EmployeeMaster;
      if (!master) return false;
      const ms = getEmpStatus(master);
      if (ms.account_status === "Inactive") return false;
      const hasNotLoggedIn = !ms.first_login_at;
      return (
        hasNotLoggedIn ||
        ["BASIC_INFO", "PRE_JOINING", "PRE_JOINING_VERIFIED", "POST_JOINING"].includes(
          ms.onboarding_stage
        )
      );
    }).length;

    const completedCount = assignedRecords.filter((r) => {
      const ms = getEmpStatus(r.EmployeeMaster);
      return ms.onboarding_stage === "ONBOARDED" && ms.account_status !== "Inactive";
    }).length;

    const notJoinedCount = assignedRecords.filter((r) => {
      const ms = getEmpStatus(r.EmployeeMaster);
      return ms.account_status === "Inactive";
    }).length;

    const assignedList = assignedRecords.map((r) => {
      const rPi = getPersonalInfo(r);
      const rJi = getJobInfo(r);
      const rMs = getEmpStatus(r.EmployeeMaster);
      return {
        id: r.EmployeeMaster?.id,
        firstName: rPi.firstname,
        lastName: rPi.lastname,
        name: `${rPi.firstname || ""} ${rPi.lastname || ""}`.trim(),
        department: rJi.department_name,
        department_id: rJi.department_id,
        jobTitle: rJi.job_title,
        designation_id: rJi.designation_id,
        location: formatWorkLocation(r.work_location),
        dateOfJoining: rJi.date_of_joining,
        profilePhoto: r.profile_photo
          ? `${req.protocol}://${req.get("host")}/uploads/profilepic/${r.profile_photo}`
          : null,
        onboarding_stage: rMs.onboarding_stage,
        stage: rMs.onboarding_stage,
        firstLoginAt: rMs.first_login_at,
        lastLoginAt: rMs.last_login_at,
        accountStatus: rMs.account_status,
        assignedDate: r.onboarding_hr_assigned_at,
      };
    });

    // Fetch Assigned HR Details
    let assignedHR = null;
    if (record.onboarding_hr_id) {
      const hrUser = await User.findOne({ where: { employee_id: record.onboarding_hr_id } });
      if (hrUser) {
        const hrMaster = await EmployeeMaster.findOne({
          where: { employee_id: hrUser.employee_id },
        });
        const hrRecord = hrMaster
          ? await EmployeeRecord.findOne({ where: { employee_id: hrMaster.employee_id } })
          : null;
        const hrPi = getPersonalInfo(hrRecord);

        assignedHR = {
          id: record.onboarding_hr_id,
          name:
            hrPi.firstname || hrPi.lastname
              ? `${hrPi.firstname || ""} ${hrPi.lastname || ""}`.trim()
              : hrUser.username,
          email: hrUser.username,
        };
      }
    }

    // Fetch Basic Info Verifier Name
    let basicInfoVerifiedByName = null;
    if (bi.basic_info_verified_by) {
      if (assignedHR && assignedHR.id == bi.basic_info_verified_by) {
        basicInfoVerifiedByName = assignedHR.name;
      } else {
        const verifierUser = await User.findOne({ where: { employee_id: bi.basic_info_verified_by } });
        if (verifierUser) {
          const verifierMaster = await EmployeeMaster.findOne({
            where: { employee_id: verifierUser.employee_id },
          });
          const verifierRecord = verifierMaster
            ? await EmployeeRecord.findOne({
                where: { employee_id: verifierMaster.employee_id },
              })
            : null;
          const vPi = getPersonalInfo(verifierRecord);
          basicInfoVerifiedByName =
            vPi.firstname || vPi.lastname
              ? `${vPi.firstname || ""} ${vPi.lastname || ""}`.trim()
              : verifierUser.username;
        }
      }
    }

    res.json({
      id: employee.id,
      userId: user.id,
      employeeId: employee.employee_id || "",
      firstName: pi.firstname,
      middleName: pi.middlename || "",
      lastName: pi.lastname,
      email: employee.company_email_id || user.username,
      personalEmail: ci.personal_email_id,
      phone: ci.phone,
      department: ji.department_name,
      department_id: ji.department_id,
      location: formatWorkLocation(record.work_location),
      work_location: record.work_location,
      jobTitle: ji.job_title,
      designation_id: ji.designation_id,
      band: ji.band,
      level: ji.level,
      profilePhoto: record.profile_photo
        ? `${req.protocol}://${req.get("host")}/uploads/profilepic/${record.profile_photo}`
        : null,
      profilePhotoFile: record.profile_photo,
      firstLoginAt: empStatus.first_login_at,
      dateOfJoining: ji.date_of_joining,
      dateOfBirth: pi.date_of_birth,
      gender: pi.gender,

      // Address - Permanent
      permanent_address: permAddr,
      // Address - Communication
      communication_address: commAddr,

      // Education & Identity
      tenthPercentage: acad.tenth_percentage,
      twelfthPercentage: acad.twelfth_percentage,
      degree_name: acad.degree_name,
      degree_percentage: acad.degree_percentage,
      adharNumber: pi.adhar_number,
      panNumber: pi.pan_number,
      signature: record.signature,
      bloodGroup: pi.blood_group,
      emergencyContactNumber: ci.emergency_contact_number,
      emergencyContactName: ci.emergency_contact_name,
      emergencyContactRelationship: ci.emergency_contact_relationship,

      role: employee.role,
      accountStatus: empStatus.account_status,
      onboardingStage: empStatus.onboarding_stage,
      assignedHR,
      assignedHRAssignedAt: record.onboarding_hr_assigned_at,
      stats: {
        totalAssigned: assignedEmployees,
        activeOnboarding: activeCount,
        completed: completedCount,
        notJoined: notJoinedCount,
      },
      assignedEmployees: assignedList,
      basicInfoStatus: bi.basic_info_status,
      basicInfoVerifiedAt: bi.basic_info_verified_at,
      basicInfoRejectionReason: bi.basic_info_rejection_reason,
      basicInfoVerifiedByName,
      disabledForms: employee.disabled_forms || [],
      finalVerificationEmailSent: bi.final_verification_email_sent || false,
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
      work_location,
      jobTitle,
      department,
      department_id,
      designation_id,
      dateOfJoining,
      personalEmail,
      onboardingHrId,
      email,
      accountStatus,
      onboarding_stage,
      firstLoginAt,
      lastLoginAt,
      bloodGroup,
      emergencyContactNumber,
      emergencyContactName,
      emergencyContactRelationship,
      band,
      level,
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
      return res.status(404).json({ message: "Employee record not initialized" });
    }

    // Update work_location JSON
    const newWorkLocation = work_location || (location
      ? { state: null, district: null, city: location }
      : undefined);
    if (newWorkLocation !== undefined) {
      record.work_location = newWorkLocation;
    }

    // Update job_info JSON (preserve existing fields, merge changes)
    const ji = getJobInfo(record);
    const jobInfoUpdates = {};
    if (jobTitle !== undefined) jobInfoUpdates.job_title = jobTitle;
    if (department !== undefined) jobInfoUpdates.department_name = department;
    if (department_id !== undefined) jobInfoUpdates.department_id = department_id;
    if (designation_id !== undefined) jobInfoUpdates.designation_id = designation_id;
    if (dateOfJoining !== undefined) jobInfoUpdates.date_of_joining = dateOfJoining;
    if (band !== undefined) jobInfoUpdates.band = band;
    if (level !== undefined) jobInfoUpdates.level = level;
    if (Object.keys(jobInfoUpdates).length > 0) {
      record.job_info = { ...ji, ...jobInfoUpdates };
    }

    // Update contact_info JSON
    const ci = getContactInfo(record);
    const contactUpdates = {};
    if (personalEmail !== undefined) contactUpdates.personal_email_id = personalEmail;
    if (emergencyContactNumber !== undefined) contactUpdates.emergency_contact_number = emergencyContactNumber;
    if (emergencyContactName !== undefined) contactUpdates.emergency_contact_name = emergencyContactName;
    if (emergencyContactRelationship !== undefined) contactUpdates.emergency_contact_relationship = emergencyContactRelationship;
    if (Object.keys(contactUpdates).length > 0) {
      record.contact_info = { ...ci, ...contactUpdates };
    }

    // Update personal_info JSON for blood_group
    if (bloodGroup !== undefined) {
      const pi = getPersonalInfo(record);
      record.personal_info = { ...pi, blood_group: bloodGroup };
    }

    // Update flat onboarding_hr columns
    if (onboardingHrId !== undefined) {
      record.onboarding_hr_id = onboardingHrId;
      record.onboarding_hr_assigned_at = new Date();
    }

    await record.save();

    // Update EmployeeMaster JSON groups
    let masterChanged = false;
    const empStatus = getEmpStatus(employee);
    const bi = getBasicInfo(employee);
    const statusUpdates = {};
    const basicInfoUpdates = {};

    if (email !== undefined) {
      employee.company_email_id = email;
      await User.update({ username: email }, { where: { employee_id: employee.employee_id } });
      masterChanged = true;
    }

    if (accountStatus !== undefined) {
      statusUpdates.account_status = accountStatus;
      if (["ACTIVE", "INVITED"].includes(accountStatus)) {
        statusUpdates.is_deleted = false;
        statusUpdates.deleted_at = null;
        statusUpdates.deleted_by = null;
      }
      masterChanged = true;
    }
    if (onboarding_stage !== undefined) {
      statusUpdates.onboarding_stage = onboarding_stage;
      masterChanged = true;
    }
    if (firstLoginAt !== undefined) {
      statusUpdates.first_login_at = firstLoginAt;
      masterChanged = true;
    }
    if (lastLoginAt !== undefined) {
      statusUpdates.last_login_at = lastLoginAt;
      masterChanged = true;
    }

    if (Object.keys(statusUpdates).length > 0) {
      employee.employee_status = { ...empStatus, ...statusUpdates };
    }
    if (Object.keys(basicInfoUpdates).length > 0) {
      employee.basic_info = { ...bi, ...basicInfoUpdates };
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
      where: { employee_id: req.user.employee_id },
      include: [{ model: EmployeeRecord }],
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const record = employee.EmployeeRecord;
    if (!record) {
      return res.status(400).json({
        message: "Personal details not found. Please save your profile first.",
      });
    }

    const bi = getBasicInfo(employee);
    const pi = getPersonalInfo(record);
    const ci = getContactInfo(record);
    const perm = getPermanentAddress(record);
    const acad = getAcademicDetails(record);

    // 1. Check Mandatory Fields across JSON groups
    const fieldChecks = [
      { group: "Personal Info", field: "firstname", value: pi.firstname },
      { group: "Personal Info", field: "lastname", value: pi.lastname },
      { group: "Personal Info", field: "gender", value: pi.gender },
      { group: "Personal Info", field: "date_of_birth", value: pi.date_of_birth },
      { group: "Personal Info", field: "adhar_number", value: pi.adhar_number },
      { group: "Personal Info", field: "pan_number", value: pi.pan_number },
      { group: "Personal Info", field: "blood_group", value: pi.blood_group },
      { group: "Contact Info", field: "personal_email_id", value: ci.personal_email_id },
      { group: "Contact Info", field: "phone", value: ci.phone },
      { group: "Contact Info", field: "emergency_contact_name", value: ci.emergency_contact_name },
      { group: "Contact Info", field: "emergency_contact_relationship", value: ci.emergency_contact_relationship },
      { group: "Contact Info", field: "emergency_contact_number", value: ci.emergency_contact_number },
      { group: "Permanent Address", field: "address_line1", value: perm.address_line1 },
      { group: "Permanent Address", field: "city", value: perm.city },
      { group: "Permanent Address", field: "district", value: perm.district },
      { group: "Permanent Address", field: "state", value: perm.state },
      { group: "Permanent Address", field: "pincode", value: perm.pincode },
      { group: "Permanent Address", field: "post_office", value: perm.post_office },
      { group: "Academic Details", field: "degree_name", value: acad.degree_name },
      { group: "Academic Details", field: "degree_percentage", value: acad.degree_percentage },
      { group: "Signature", field: "signature", value: record.signature },
    ];

    const missingFields = fieldChecks
      .filter((f) => {
        const val = f.value;
        return val === null || val === undefined || String(val).trim() === "";
      })
      .map((f) => `${f.group}.${f.field}`);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Please complete all mandatory fields before submitting.",
        missingFields,
      });
    }

    // 2. Check Mandatory Documents
    const documents = await EmployeeDocument.findAll({
      where: { employee_id: employee.employee_id },
    });
    const mandatoryDocs = [
      "PAN Card",
      "Aadhar Card",
      "10th Marksheet",
      "12th Marksheet",
      "Degree Certificate",
      "Cancelled Cheque",
      "Passport Size Photo",
      "Signature",
    ];

    const missingDocs = mandatoryDocs.filter((docType) => {
      const doc = documents.find((d) => d.document_type === docType);
      return !doc || doc.status === "REJECTED";
    });

    if (missingDocs.length > 0) {
      return res.status(400).json({
        message:
          "Please upload all mandatory documents (and replace rejected ones) before submitting.",
        missingDocs,
      });
    }

    // 3. Validate Submission State
    const hasRejectedDocs = documents.some((doc) => doc.status === "REJECTED");
    const hasUploadedDocs = documents.some((doc) => doc.status === "UPLOADED");
    const biStatus = bi.basic_info_status;
    const canSubmit =
      ["PENDING", "REJECTED"].includes(biStatus) ||
      hasRejectedDocs ||
      hasUploadedDocs;

    if (!canSubmit) {
      return res.status(400).json({
        message:
          "Profile is already submitted or verified, and no items are pending resubmission.",
      });
    }

    // 4. Update basic_info JSON
    if (biStatus !== "VERIFIED") {
      employee.basic_info = {
        ...bi,
        basic_info_status: "SUBMITTED",
        basic_info_verified_by: null,
        basic_info_verified_at: null,
        final_verification_email_sent: false,
      };
    }

    // Transition documents to SUBMITTED
    await EmployeeDocument.update(
      { status: "SUBMITTED" },
      {
        where: {
          employee_id: employee.employee_id,
          status: ["UPLOADED", "REJECTED"],
        },
      }
    );

    await employee.save();

    // Notify HR
    await formHandler.sendHRSubmissionNotification(employee.id, "Basic Information");

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
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const hrUserId = req.user.id;

    if (!["VERIFIED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const employee = await EmployeeMaster.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const bi = getBasicInfo(employee);

    if (status === "VERIFIED") {
      employee.basic_info = {
        ...bi,
        basic_info_status: "VERIFIED",
        basic_info_verified_by: hrUserId,
        basic_info_verified_at: new Date(),
        basic_info_rejection_reason: null,
      };
    } else {
      employee.basic_info = {
        ...bi,
        basic_info_status: "REJECTED",
        basic_info_verified_by: null,
        basic_info_verified_at: null,
        basic_info_rejection_reason: rejectionReason || "Details mismatch or incomplete",
      };
    }

    await employee.save();

    // Auto-update stage logic
    if (status === "VERIFIED") {
      await formHandler.checkAndUpdateBasicInfoStage(employee.id);
    }

    const updatedBi = getBasicInfo(employee);
    const empStatus = getEmpStatus(employee);

    res.json({
      message: `Profile ${status}`,
      status: updatedBi.basic_info_status,
      stage: empStatus.onboarding_stage,
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
    const { formKey, disabled } = req.body;

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
      currentDisabled = currentDisabled.filter((k) => k !== formKey);
    }

    employee.disabled_forms = currentDisabled;
    await employee.save();

    res.json({
      message: "Form access updated",
      disabledForms: employee.disabled_forms,
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

    if (!["PRE_JOINING", "POST_JOINING", "ONBOARDED"].includes(stage)) {
      return res.status(400).json({ message: "Invalid stage transition requested." });
    }

    const employee = await EmployeeMaster.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const empStatus = getEmpStatus(employee);
    const bi = getBasicInfo(employee);

    employee.employee_status = { ...empStatus, onboarding_stage: stage };

    if (stage === "PRE_JOINING") {
      employee.disabled_forms = [];
      employee.basic_info = { ...bi, basic_info_rejection_reason: null };
    }

    await employee.save();

    const updatedStatus = getEmpStatus(employee);
    res.json({
      message: `Stage updated to ${stage}`,
      stage: updatedStatus.onboarding_stage,
    });
  } catch (error) {
    logger.error("Error advancing stage: %o", error);
    res.status(500).json({ message: "Server error advancing stage" });
  }
};

// Final Verification for Employee (Basic Info + Documents)
exports.finalVerifyEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const hrUserId = req.user.id;

    const employee = await EmployeeMaster.findByPk(id, {
      include: [{ model: EmployeeRecord }, { model: User }],
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const bi = getBasicInfo(employee);

    // 1. Fetch all documents
    const documents = await EmployeeDocument.findAll({
      where: { employee_id: employee.employee_id },
    });

    // 2. Check pending documents
    const pendingDocuments = documents.filter(
      (doc) => doc.status === "PENDING" || doc.status === "UPLOADED"
    );

    if (
      bi.basic_info_status === "PENDING" ||
      bi.basic_info_status === "SUBMITTED"
    ) {
      return res.status(400).json({
        message: "Basic Information must be reviewed (Approved or Rejected) first.",
      });
    }

    if (pendingDocuments.length > 0) {
      return res.status(400).json({
        message: "All documents must be reviewed (Approved or Rejected) first.",
      });
    }

    // 3. Evaluate results
    const rejectedDocs = documents.filter((doc) => doc.status === "REJECTED");
    const isBasicInfoRejected = bi.basic_info_status === "REJECTED";
    const isSuccess = !isBasicInfoRejected && rejectedDocs.length === 0;

    // 4. Prepare and Send Summary Email
    const pi = getPersonalInfo(employee.EmployeeRecord);
    const ci = getContactInfo(employee.EmployeeRecord);
    const emailTo = ci.personal_email_id || employee.User?.username;
    const employeeName = pi.firstname
      ? `${pi.firstname} ${pi.lastname || ""}`.trim()
      : "Employee";

    let subject, html;

    if (isSuccess) {
      subject = "Verification Completed - All Details Approved";
      html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2e7d32;">Verification Successful</h2>
          <p>Dear <strong>${employeeName}</strong>,</p>
          <p>We are pleased to inform you that all your basic details and uploaded documents have been successfully verified.</p>
          <div style="background-color: #f1f8e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
             <strong>Status:</strong> Approved
          </div>
          <p>You can now proceed with the next stages of your onboarding.</p>
          <br/>
          <p>Best regards,<br/><strong>Vakrangee HR Team</strong></p>
        </div>
      `;
    } else {
      subject = "Onboarding Verification Summary - Action Required";
      let itemsListHtml = `
        <div style="margin-bottom: 15px; padding: 10px; border-bottom: 1px solid #eee;">
          <strong style="color: ${isBasicInfoRejected ? "#d32f2f" : "#2e7d32"};">Basic Details: ${isBasicInfoRejected ? "Rejected" : "Verified"}</strong><br/>
          ${isBasicInfoRejected ? `<span style="color: #d32f2f;">Reason: ${bi.basic_info_rejection_reason || "Details mismatch"}</span>` : "Successfully verified."}
        </div>
      `;
      documents.forEach((doc) => {
        const isRejected = doc.status === "REJECTED";
        itemsListHtml += `
          <div style="margin-bottom: 15px; padding: 10px; border-bottom: 1px solid #eee;">
            <strong style="color: ${isRejected ? "#d32f2f" : "#2e7d32"};">${doc.document_type}: ${isRejected ? "Rejected" : "Verified"}</strong><br/>
            ${isRejected ? `<span style="color: #d32f2f;">Reason: ${doc.rejection_reason || "Document mismatch or unclear"}</span>` : "Successfully verified."}
          </div>
        `;
      });
      html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: left;">
          <h2 style="color: #d32f2f;">Verification Update</h2>
          <p>Dear <strong>${employeeName}</strong>,</p>
          <p>Your profile verification has been processed. Some items require your attention.</p>
          <h4 style="margin-bottom: 10px; border-bottom: 2px solid #f44336; padding-bottom: 5px;">Review Summary:</h4>
          ${itemsListHtml}
          <p style="margin-top: 20px; font-weight: bold;">Please log in to the portal to correct the rejected items and resubmit for verification.</p>
          <br/>
          <p>Best regards,<br/><strong>Vakrangee HR Team</strong></p>
        </div>
      `;
    }

    // Trigger Email
    if (emailTo) {
      const sendEmail = require("../utils/emailService");
      await sendEmail({ to: emailTo, subject, html, text: subject });
      logger.info(`Final verification email sent to ${emailTo} (Success: ${isSuccess})`);

      // Persist email-sent flag
      employee.basic_info = { ...bi, final_verification_email_sent: true };
      await employee.save();
    }

    // 5. Update Stage if successful
    if (isSuccess) {
      await formHandler.checkAndUpdateBasicInfoStage(employee.id);
    }

    res.json({
      message: `Final verification processed: ${isSuccess ? "Verified" : "Rejected"}`,
      isSuccess,
    });
  } catch (error) {
    logger.error("Error in final verification: %o", error);
    res.status(500).json({ message: "Server error during final verification" });
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

    const empStatus = getEmpStatus(employee);
    employee.employee_status = {
      ...empStatus,
      account_status: "Inactive",
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: requestingAdminId,
    };

    await employee.save();

    res.json({
      message: "Employee deactivated successfully",
      id: employee.id,
      status: "Inactive",
    });
  } catch (error) {
    logger.error("Error deleting employee: %o", error);
    res.status(500).json({ message: "Server error deleting employee" });
  }
};

// Download selected candidate documents and forms as a structured ZIP file
exports.downloadDocuments = async (req, res) => {
  try {
    const { id } = req.params; // integer id of EmployeeMaster
    const { selectedFiles } = req.body; // array of { id, category }

    const employee = await EmployeeMaster.findOne({
      where: { id },
      include: [{ model: EmployeeRecord }]
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const pi = employee.EmployeeRecord?.personal_info || {};
    const firstName = pi.firstname || "";
    const lastName = pi.lastname || "";
    const rawEmployeeName = `${firstName} ${lastName}`.trim() || employee.employee_id;
    const employeeName = rawEmployeeName.toLowerCase().replace(/\s+/g, "_");

    const fs = require('fs');
    const path = require('path');
    const { ZipArchive } = require('archiver');
    const pdfGenerator = require('../utils/pdfGenerator');

    // Make sure temp directory exists
    const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const zipFilename = `onboarding_docs_${employee.employee_id}_${Date.now()}.zip`;
    const zipPath = path.join(tempDir, zipFilename);
    const output = fs.createWriteStream(zipPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    // Handle archive errors
    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);

    const reportLines = [
      "==================================================",
      "ONBOARDING DOCUMENTS & FORMS DOWNLOAD REPORT",
      "==================================================",
      `Date/Time: ${new Date().toLocaleString()}`,
      `Employee Name: ${rawEmployeeName}`,
      `Employee Code: ${employee.employee_id}`,
      `Requested Files Count: ${selectedFiles ? selectedFiles.length : 0}`,
      "--------------------------------------------------",
      "STATUS OF DOWNLOADED FILES:",
      "--------------------------------------------------"
    ];

    let successCount = 0;
    let failCount = 0;

    if (selectedFiles && Array.isArray(selectedFiles)) {
      // Process selected files sequentially
      for (const file of selectedFiles) {
        try {
          if (file.category === 'documents') {
            const doc = await EmployeeDocument.findOne({
              where: { id: file.id, employee_id: employee.employee_id }
            });
            if (!doc) {
              reportLines.push(`[FAILED] Category: Documents | File ID: ${file.id} | Reason: Record not found in database`);
              failCount++;
              continue;
            }

            let targetFolder = 'documents';
            if (doc.document_type === "Passport Size Photo") targetFolder = 'profilepic';
            else if (doc.document_type === "Signature") targetFolder = 'signatures';

            const docFilePath = path.join(__dirname, '..', 'uploads', targetFolder, doc.file_path);
            
            if (fs.existsSync(docFilePath)) {
              const ext = path.extname(doc.original_name || doc.file_path) || '.pdf';
              const docTypeFormatted = doc.document_type.replace(/\s+/g, '_');
              const archiveName = `${employeeName}_${docTypeFormatted}${ext}`;
              
              // Map Background Verification Form or Joining Form to their specific folder inside zip
              let zipFolder = 'Documents';
              if (doc.document_type === 'Background Verification Form') {
                zipFolder = 'Pre Joining Forms';
              } else if (doc.document_type === 'Joining Form') {
                zipFolder = 'Post Joining Forms';
              }

              archive.file(docFilePath, { name: `${employeeName}/${zipFolder}/${archiveName}` });
              reportLines.push(`[SUCCESS] Category: Documents | Type: ${doc.document_type} -> ${zipFolder}/${archiveName}`);
              successCount++;
            } else {
              reportLines.push(`[FAILED] Category: Documents | Type: ${doc.document_type} | Reason: File missing on server disk at ${doc.file_path}`);
              failCount++;
            }
          } 
          else if (file.category === 'preJoiningForms' || file.category === 'postJoiningForms') {
            const formRecord = await FormSubmission.findOne({
              where: { id: file.id, employee_id: employee.employee_id }
            });
            
            if (!formRecord) {
              reportLines.push(`[FAILED] Category: Forms | Form ID: ${file.id} | Reason: Submission not found in database`);
              failCount++;
              continue;
            }

            const formType = formRecord.form_type;
            const folderName = file.category === 'preJoiningForms' ? 'Pre Joining Forms' : 'Post Joining Forms';
            
            let formNameFormatted = formType.replace(/_/g, '_');
            if (formType === 'EMPLOYMENT_APP') formNameFormatted = 'Application_Form';
            else if (formType === 'DECLARATION') formNameFormatted = 'Declaration_Form';
            else if (formType === 'EMPLOYEE_INFO') formNameFormatted = 'Employee_Information_Form';
            
            const archiveName = `${employeeName}_${formNameFormatted}.pdf`;

            try {
              const puppeteer = require('puppeteer');
              const frontendUrl = req.body.frontendUrl || 'http://localhost:5173';
              
              const formPaths = {
                EMPLOYMENT_APP: `/forms/application/preview/${employee.id}`,
                DECLARATION: `/forms/declaration-form/preview/${employee.id}`,
                MEDICLAIM: `/forms/mediclaim/preview/${employee.id}`,
                GRATUITY: `/forms/gratuity-form/preview/${employee.id}`,
                EMPLOYEE_INFO: `/forms/information/preview/${employee.id}`,
                NDA: `/forms/non-disclosure-agreement/preview/${employee.id}`,
                TDS: `/forms/tds-form/preview/${employee.id}`,
                EPF: `/forms/employees-provident-fund/preview/${employee.id}`,
              };
              
              const formPath = formPaths[formType];
              if (!formPath) {
                throw new Error(`Unknown form path for ${formType}`);
              }

              const url = `${frontendUrl}${formPath}`;
              
              // Extract token from Auth header
              const authHeader = req.headers.authorization || '';
              const token = authHeader.replace('Bearer ', '').trim();

              const browser = await puppeteer.launch({ 
                headless: 'new', 
                args: ['--no-sandbox', '--disable-setuid-sandbox'] 
              });
              
              const page = await browser.newPage();
              
              // Inject token and mock user role so frontend authenticates and doesn't redirect
              await page.evaluateOnNewDocument((authToken) => {
                localStorage.setItem('token', authToken);
                localStorage.setItem('user', JSON.stringify({ role: 'HR_ADMIN' }));
              }, token);

              await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
              
              // Hide the action buttons specifically (PreviewActions)
              await page.addStyleTag({ content: '.print\\:hidden { display: none !important; }' });

              const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
              });

              await browser.close();

              archive.append(pdfBuffer, { name: `${employeeName}/${folderName}/${archiveName}` });
              reportLines.push(`[SUCCESS] Category: Forms | Type: ${formType} -> ${folderName}/${archiveName}`);
              successCount++;
            } catch (err) {
              logger.error(`Puppeteer PDF generation failed for ${formType}: %o`, err);
              // Fallback to older text-based PDF if puppeteer fails
              const tempPdfName = `temp_${formType}_${Date.now()}.pdf`;
              const tempPdfPath = path.join(tempDir, tempPdfName);
              
              await pdfGenerator.generateFormPDF(employee, formRecord, tempPdfPath);
              
              if (fs.existsSync(tempPdfPath)) {
                const pdfBuffer = fs.readFileSync(tempPdfPath);
                archive.append(pdfBuffer, { name: `${employeeName}/${folderName}/${archiveName}` });
                fs.unlinkSync(tempPdfPath);
                reportLines.push(`[SUCCESS] Category: Forms (Fallback) | Type: ${formType} -> ${folderName}/${archiveName}`);
                successCount++;
              } else {
                reportLines.push(`[FAILED] Category: Forms | Type: ${formType} | Reason: Failed to generate PDF`);
                failCount++;
              }
            }
          }
        } catch (err) {
          logger.error(`Error packaging item in download ZIP: %o`, err);
          reportLines.push(`[ERROR] Category: ${file.category} | ID: ${file.id} | Error: ${err.message}`);
          failCount++;
        }
      }
    }

    reportLines.push("--------------------------------------------------");
    reportLines.push(`SUMMARY: Successfully packed ${successCount} files, failed to pack ${failCount} files.`);
    reportLines.push("==================================================");

    // Finalize
    await archive.finalize();

    // Once finished, stream back and cleanup
    output.on('close', () => {
      res.download(zipPath, zipFilename, (downloadErr) => {
        if (downloadErr) {
          logger.error('Error sending ZIP to client: %o', downloadErr);
        }
        // Cleanup ZIP file
        try {
          if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
          }
        } catch (unlinkErr) {
          logger.error('Error deleting temp ZIP file: %o', unlinkErr);
        }
      });
    });

  } catch (error) {
    logger.error("Error in downloadDocuments API: %o", error);
    res.status(500).json({ message: "Server error generating zip file" });
  }
};
// ─────────────────────────────────────────────────────────────────────────────
// Send Reminder Email
// POST /api/employees/:id/send-reminder
// Body: { items: [{ type: "doc"|"preForm"|"postForm", key: string }] }
// ─────────────────────────────────────────────────────────────────────────────
exports.sendReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items selected for reminder." });
    }

    // ── 1. Fetch employee ─────────────────────────────────────────────────────
    const employee = await EmployeeMaster.findOne({
      where: { id },
      include: [
        { model: EmployeeRecord },
        { model: User, attributes: ["username"] },
      ],
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const pi   = getPersonalInfo(employee.EmployeeRecord);
    const ci   = getContactInfo(employee.EmployeeRecord);
    const firstName = pi.firstname || "there";

    // Prefer personal email; fall back to company email
    const toEmail =
      ci.personal_email_id ||
      employee.company_email_id ||
      employee.User?.username;

    if (!toEmail) {
      return res.status(400).json({ message: "No email address found for this employee." });
    }

    // ── 2. Resolve HR sender info ─────────────────────────────────────────────
    const record = employee.EmployeeRecord;
    let hrName = "HR Team";
    let hrDesignation = "Human Resources";

    if (record?.onboarding_hr_id) {
      const hrMaster = await EmployeeMaster.findOne({
        where: { employee_id: record.onboarding_hr_id },
        include: [{ model: EmployeeRecord }],
      });
      if (hrMaster?.EmployeeRecord) {
        const hrPi = getPersonalInfo(hrMaster.EmployeeRecord);
        const hrJi = getJobInfo(hrMaster.EmployeeRecord);
        if (hrPi.firstname) {
          hrName = `${hrPi.firstname} ${hrPi.lastname || ""}`.trim();
        }
        if (hrJi.job_title) hrDesignation = hrJi.job_title;
      }
    }

    // ── 3. Document label lookup ──────────────────────────────────────────────
    // Map from doc key → display label (mirrors frontend DOCUMENT_CONFIG)
    const DOC_LABELS = {
      "Passport Size Photo":     "Passport Size Photo",
      "Signature":               "Signature",
      "PAN Card":                "PAN Card",
      "Aadhar Card":             "Aadhar Card",
      "10th Marksheet":          "10th Marksheet",
      "12th Marksheet":          "12th Marksheet",
      "Degree Certificate":      "Degree Certificate",
      "Cancelled Cheque":        "Cancelled Cheque",
      "6 Months Bank Statement": "6 Months Bank Statement",
      "Previous Offer Letter 1": "Previous Offer Letter 1",
      "Previous Offer Letter 2": "Previous Offer Letter 2",
      "Resume":                  "Resume",
      "Relieving Letter":        "Relieving Letter",
      "Experience Certificate":  "Experience Certificate",
      "Service Certificates":    "Service Certificates",
      "Last Drawn Salary Slip":  "Last Drawn Salary Slips (last 3 months)",
    };

    // ── 4. Form label lookup ──────────────────────────────────────────────────
    const FORM_LABELS = {
      EMPLOYMENT_APP: "Application Form",
      DECLARATION:    "Declaration Form",
      MEDICLAIM:      "Mediclaim Form",
      GRATUITY:       "Gratuity Form (Form F)",
      EMPLOYEE_INFO:  "Employee Information Form",
      NDA:            "Non-Disclosure Agreement (NDA)",
      TDS:            "TDS Declaration Form",
      EPF:            "EPF Form",
    };

    // ── 5. Build pending docs / forms lists ───────────────────────────────────
    const pendingDocs  = [];
    const pendingForms = [];

    for (const item of items) {
      if (item.type === "doc") {
        const label = DOC_LABELS[item.key] || item.key;
        pendingDocs.push({ label });
      } else if (item.type === "preForm" || item.type === "postForm") {
        const label = FORM_LABELS[item.key] || item.key;
        pendingForms.push({ label });
      }
    }

    // ── 6. Send email ─────────────────────────────────────────────────────────
    const result = await sendReminderEmail(
      toEmail,
      firstName,
      pendingDocs,
      pendingForms,
      hrName,
      hrDesignation
    );

    if (!result.success) {
      logger.error("Reminder email failed for employee %s: %s", id, result.error);
      return res.status(500).json({ message: "Failed to send reminder email.", error: result.error });
    }

    logger.info(
      "Reminder email sent to %s (%s) — %d docs, %d forms",
      toEmail, id, pendingDocs.length, pendingForms.length
    );

    res.json({
      message: "Reminder email sent successfully.",
      sentTo: toEmail,
      pendingDocs: pendingDocs.length,
      pendingForms: pendingForms.length,
    });
  } catch (error) {
    logger.error("Error in sendReminder: %o", error);
    res.status(500).json({ message: "Server error sending reminder email." });
  }
};
