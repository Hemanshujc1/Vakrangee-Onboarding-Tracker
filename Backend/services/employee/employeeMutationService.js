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
} = require("../../utils/employeeHelpers");

exports.updateEmployeeDetails = async (id, data) => {
  const employee = await EmployeeMaster.findOne({
    where: { id },
    include: [{ model: EmployeeRecord }],
  });

  if (!employee) throw new Error("Employee not found");

  const record = employee.EmployeeRecord;
  if (!record) throw new Error("Employee record not initialized");

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
    band_id,
    band_name,
    band_level_id,
    level_name,
  } = data;

  const newWorkLocation = work_location || (location
    ? { state: null, district: null, city: location }
    : undefined);
  if (newWorkLocation !== undefined) {
    record.work_location = newWorkLocation;
  }

  const ji = getJobInfo(record);
  const jobInfoUpdates = {};
  if (jobTitle !== undefined) jobInfoUpdates.job_title = jobTitle;
  if (department !== undefined) jobInfoUpdates.department_name = department;
  if (department_id !== undefined) jobInfoUpdates.department_id = department_id;
  if (designation_id !== undefined) jobInfoUpdates.designation_id = designation_id;
  if (dateOfJoining !== undefined) jobInfoUpdates.date_of_joining = dateOfJoining;
  if (band !== undefined) jobInfoUpdates.band = band;
  if (level !== undefined) jobInfoUpdates.level = level;
  if (band_id !== undefined) jobInfoUpdates.band_id = band_id;
  if (band_name !== undefined) jobInfoUpdates.band_name = band_name;
  if (band_level_id !== undefined) jobInfoUpdates.band_level_id = band_level_id;
  if (level_name !== undefined) jobInfoUpdates.level_name = level_name;
  if (Object.keys(jobInfoUpdates).length > 0) {
    record.job_info = { ...ji, ...jobInfoUpdates };
  }

  const ci = getContactInfo(record);
  const contactUpdates = {};
  if (personalEmail !== undefined) contactUpdates.personal_email_id = personalEmail;
  if (emergencyContactNumber !== undefined) contactUpdates.emergency_contact_number = emergencyContactNumber;
  if (emergencyContactName !== undefined) contactUpdates.emergency_contact_name = emergencyContactName;
  if (emergencyContactRelationship !== undefined) contactUpdates.emergency_contact_relationship = emergencyContactRelationship;
  if (Object.keys(contactUpdates).length > 0) {
    record.contact_info = { ...ci, ...contactUpdates };
  }

  if (bloodGroup !== undefined) {
    const pi = getPersonalInfo(record);
    record.personal_info = { ...pi, blood_group: bloodGroup };
  }

  if (onboardingHrId !== undefined) {
    record.onboarding_hr_id = onboardingHrId;
    record.onboarding_hr_assigned_at = new Date();
  }

  await record.save();

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

  return { message: "Details updated successfully", record };
};

exports.deleteEmployee = async (id, requestingAdminId) => {
  const employee = await EmployeeMaster.findByPk(id);
  if (!employee) throw new Error("Employee not found");

  const empStatus = getEmpStatus(employee);
  employee.employee_status = {
    ...empStatus,
    account_status: "Inactive",
    is_deleted: true,
    deleted_at: new Date(),
    deleted_by: requestingAdminId,
  };

  await employee.save();

  return {
    message: "Employee deactivated successfully",
    id: employee.id,
    status: "Inactive",
  };
};
