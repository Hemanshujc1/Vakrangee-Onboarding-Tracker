const {
  EmployeeMaster,
  EmployeeRecord,
  User,
} = require("../../models");
const {
  getEmpStatus,
  getBasicInfo,
  getPersonalInfo,
  getContactInfo,
  getJobInfo,
  getAcademicDetails,
  getPermanentAddress,
  getCommunicationAddress,
  formatWorkLocation,
} = require("../../utils/employeeHelpers");

exports.getAllEmployees = async (protocol, host) => {
  const employees = await EmployeeMaster.findAll({
    include: [
      { model: EmployeeRecord },
      { model: User, attributes: ["username"] },
    ],
  });

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

  return employees.map((emp) => {
    const record = emp.EmployeeRecord || {};
    const user = emp.User || {};
    const empStatus = getEmpStatus(emp);
    const pi = getPersonalInfo(record);
    const ji = getJobInfo(record);
    const ci = getContactInfo(record);

    const stats = adminStats[emp.employee_id] || {
      assigned: 0,
      onboarded: 0,
      notJoined: 0,
    };
    const hrInfo = record.onboarding_hr_id ? hrMap[record.onboarding_hr_id] : null;
    const assignedHRName = hrInfo ? hrInfo.name : record.onboarding_hr_id ? "N/A" : "-";
    const assignedHRLocation = hrInfo ? hrInfo.location : null;

    return {
      id: emp.id,
      userId: emp.employee_id,
      employeeId: emp.employee_id || "",
      role: emp.role,
      onboarding_stage: empStatus.onboarding_stage,
      firstName: pi.firstname || "",
      lastName: pi.lastname || "",
      email: emp.company_email_id || user.username || "",
      phone: ci.phone || "",
      department: ji.department_name,
      department_id: ji.department_id,
      location: formatWorkLocation(record.work_location),
      jobTitle: ji.job_title,
      designation_id: ji.designation_id,
      band: ji.band_name || ji.band || "",
      level: ji.level_name || ji.level || "",
      band_id: ji.band_id || null,
      band_name: ji.band_name || null,
      band_level_id: ji.band_level_id || null,
      level_name: ji.level_name || null,
      profilePhoto: record.profile_photo
        ? `${protocol}://${host}/uploads/profilepic/${record.profile_photo}`
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
};

exports.getMe = async (employeeId) => {
  const employee = await EmployeeMaster.findOne({
    where: { employee_id: employeeId },
    include: [{ model: EmployeeRecord }],
  });

  if (!employee) throw new Error("Employee profile not found");

  const empStatus = getEmpStatus(employee);
  const bi = getBasicInfo(employee);
  const pi = getPersonalInfo(employee.EmployeeRecord);

  return {
    id: employee.id,
    employeeId: employee.employee_id || "",
    onboardingStage: empStatus.onboarding_stage,
    disabledForms: employee.disabled_forms || [],
    basicInfoStatus: bi.basic_info_status,
    firstName: pi.firstname,
    lastName: pi.lastname,
    signature: employee.EmployeeRecord?.signature,
  };
};

exports.getEmployeeById = async (id, reqUserRole, reqUserEmployeeId, protocol, host) => {
  const employee = await EmployeeMaster.findOne({
    where: { id },
    include: [
      { model: EmployeeRecord },
      { model: User, attributes: ["username", "id"] },
    ],
  });

  if (!employee) throw new Error("Employee not found");

  if (!["HR_SUPER_ADMIN", "HR_ADMIN"].includes(reqUserRole) && employee.employee_id !== reqUserEmployeeId) {
    throw new Error("Access denied. You are not authorized to view this profile.");
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

  const assignedEmployees = await EmployeeRecord.count({
    where: { onboarding_hr_id: user.id },
  });

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
      ["BASIC_INFO", "PRE_JOINING", "PRE_JOINING_VERIFIED", "POST_JOINING"].includes(ms.onboarding_stage)
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
      band: rJi.band_name || rJi.band || "",
      level: rJi.level_name || rJi.level || "",
      band_id: rJi.band_id || null,
      band_name: rJi.band_name || null,
      band_level_id: rJi.band_level_id || null,
      level_name: rJi.level_name || null,
      profilePhoto: r.profile_photo
        ? `${protocol}://${host}/uploads/profilepic/${r.profile_photo}`
        : null,
      onboarding_stage: rMs.onboarding_stage,
      stage: rMs.onboarding_stage,
      firstLoginAt: rMs.first_login_at,
      lastLoginAt: rMs.last_login_at,
      accountStatus: rMs.account_status,
      assignedDate: r.onboarding_hr_assigned_at,
    };
  });

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

  return {
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
    band: ji.band_name || ji.band || "",
    level: ji.level_name || ji.level || "",
    band_id: ji.band_id || null,
    band_name: ji.band_name || null,
    band_level_id: ji.band_level_id || null,
    level_name: ji.level_name || null,
    profilePhoto: record.profile_photo
      ? `${protocol}://${host}/uploads/profilepic/${record.profile_photo}`
      : null,
    profilePhotoFile: record.profile_photo,
    firstLoginAt: empStatus.first_login_at,
    dateOfJoining: ji.date_of_joining,
    dateOfBirth: pi.date_of_birth,
    gender: pi.gender,
    permanent_address: permAddr,
    communication_address: commAddr,
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
  };
};
