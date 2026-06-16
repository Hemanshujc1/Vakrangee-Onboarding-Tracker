const { EmployeeMaster, EmployeeRecord, User } = require("../../models");
const logger = require("../../utils/logger");
const { sendReminderEmail } = require("../emailServiceforEmployee");
const {
  getPersonalInfo,
  getContactInfo,
  getJobInfo,
} = require("../../utils/employeeHelpers");

const DOC_LABELS = {
  "Passport Size Photo": "Passport Size Photo",
  Signature: "Signature",
  "PAN Card": "PAN Card",
  "Aadhar Card": "Aadhar Card",
  "10th Marksheet": "10th Marksheet",
  "12th Marksheet": "12th Marksheet",
  "Degree Certificate": "Degree Certificate",
  "Cancelled Cheque": "Cancelled Cheque",
  "6 Months Bank Statement": "6 Months Bank Statement",
  "Previous Offer Letter 1": "Previous Offer Letter 1",
  "Previous Offer Letter 2": "Previous Offer Letter 2",
  Resume: "Resume",
  "Relieving Letter": "Relieving Letter",
  "Experience Certificate": "Experience Certificate",
  "Service Certificates": "Service Certificates",
  "Last Drawn Salary Slip": "Last Drawn Salary Slips (last 3 months)",
};

const FORM_LABELS = {
  EMPLOYMENT_APP: "Application Form",
  DECLARATION: "Declaration Form",
  MEDICLAIM: "Mediclaim Form",
  GRATUITY: "Gratuity Form (Form F)",
  EMPLOYEE_INFO: "Employee Information Form",
  NDA: "Non-Disclosure Agreement (NDA)",
  TDS: "TDS Declaration Form",
  EPF: "EPF Form",
};

exports.sendReminder = async (employeeId, items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("No items selected for reminder.");
  }

  const employee = await EmployeeMaster.findOne({
    where: { id: employeeId },
    include: [
      { model: EmployeeRecord },
      { model: User, attributes: ["username"] },
    ],
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const pi = getPersonalInfo(employee.EmployeeRecord);
  const ci = getContactInfo(employee.EmployeeRecord);
  const firstName = pi.firstname || "there";

  const toEmail =
    ci.personal_email_id ||
    employee.company_email_id ||
    employee.User?.username;

  if (!toEmail) {
    throw new Error("No email address found for this employee.");
  }

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

  const pendingDocs = [];
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

  const result = await sendReminderEmail(
    toEmail,
    firstName,
    pendingDocs,
    pendingForms,
    hrName,
    hrDesignation,
  );

  if (!result.success) {
    throw new Error(result.error);
  }

  logger.info(
    "Reminder email sent to %s (%s) — %d docs, %d forms",
    toEmail,
    employeeId,
    pendingDocs.length,
    pendingForms.length,
  );

  return {
    sentTo: toEmail,
    pendingDocs: pendingDocs.length,
    pendingForms: pendingForms.length,
  };
};
