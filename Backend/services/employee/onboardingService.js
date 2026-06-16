const {
  EmployeeMaster,
  EmployeeRecord,
  User,
  EmployeeDocument,
} = require("../../models");
const logger = require("../../utils/logger");
const formHandler = require("../../utils/formHandler");
const {
  getEmpStatus,
  getBasicInfo,
  getPersonalInfo,
  getContactInfo,
  getAcademicDetails,
  getPermanentAddress,
  getCommunicationAddress,
} = require("../../utils/employeeHelpers");
const sendEmail = require("../../utils/emailService");

exports.submitBasicInfo = async (employeeIdAuth) => {
  const employee = await EmployeeMaster.findOne({
    where: { employee_id: employeeIdAuth },
    include: [{ model: EmployeeRecord }],
  });

  if (!employee) throw new Error("Employee not found");

  const record = employee.EmployeeRecord;
  if (!record) throw new Error("Personal details not found. Please save your profile first.");

  const bi = getBasicInfo(employee);
  const pi = getPersonalInfo(record);
  const ci = getContactInfo(record);
  const perm = getPermanentAddress(record);
  const acad = getAcademicDetails(record);

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
    const err = new Error("Please complete all mandatory fields before submitting.");
    err.missingFields = missingFields;
    err.status = 400;
    throw err;
  }

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
    const err = new Error("Please upload all mandatory documents (and replace rejected ones) before submitting.");
    err.missingDocs = missingDocs;
    err.status = 400;
    throw err;
  }

  const hasRejectedDocs = documents.some((doc) => doc.status === "REJECTED");
  const hasUploadedDocs = documents.some((doc) => doc.status === "UPLOADED");
  const biStatus = bi.basic_info_status;
  const canSubmit = ["PENDING", "REJECTED"].includes(biStatus) || hasRejectedDocs || hasUploadedDocs;

  if (!canSubmit) {
    const err = new Error("Profile is already submitted or verified, and no items are pending resubmission.");
    err.status = 400;
    throw err;
  }

  if (biStatus !== "VERIFIED") {
    employee.basic_info = {
      ...bi,
      basic_info_status: "SUBMITTED",
      basic_info_verified_by: null,
      basic_info_verified_at: null,
      final_verification_email_sent: false,
    };
  }

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
  await formHandler.sendHRSubmissionNotification(employee.id, "Basic Information");

  return { message: "Profile submitted for verification", status: "SUBMITTED" };
};

exports.verifyBasicInfo = async (id, status, rejectionReason, hrUserId) => {
  if (!["VERIFIED", "REJECTED"].includes(status)) {
    const err = new Error("Invalid status");
    err.status = 400;
    throw err;
  }

  const employee = await EmployeeMaster.findByPk(id);
  if (!employee) throw new Error("Employee not found");

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

  if (status === "VERIFIED") {
    await formHandler.checkAndUpdateBasicInfoStage(employee.id);
  }

  const updatedBi = getBasicInfo(employee);
  const empStatus = getEmpStatus(employee);

  return {
    message: `Profile ${status}`,
    status: updatedBi.basic_info_status,
    stage: empStatus.onboarding_stage,
  };
};

exports.updateFormAccess = async (id, formKey, disabled) => {
  const employee = await EmployeeMaster.findByPk(id);
  if (!employee) throw new Error("Employee not found");

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

  return {
    message: "Form access updated",
    disabledForms: employee.disabled_forms,
  };
};

exports.advanceOnboardingStage = async (id, stage) => {
  if (!["PRE_JOINING", "POST_JOINING", "ONBOARDED"].includes(stage)) {
    const err = new Error("Invalid stage transition requested.");
    err.status = 400;
    throw err;
  }

  const employee = await EmployeeMaster.findByPk(id);
  if (!employee) throw new Error("Employee not found");

  const empStatus = getEmpStatus(employee);
  const bi = getBasicInfo(employee);

  employee.employee_status = { ...empStatus, onboarding_stage: stage };

  if (stage === "PRE_JOINING") {
    employee.disabled_forms = [];
    employee.basic_info = { ...bi, basic_info_rejection_reason: null };
  }

  await employee.save();
  const updatedStatus = getEmpStatus(employee);

  return {
    message: `Stage updated to ${stage}`,
    stage: updatedStatus.onboarding_stage,
  };
};

exports.finalVerifyEmployee = async (id, hrUserId) => {
  const employee = await EmployeeMaster.findByPk(id, {
    include: [{ model: EmployeeRecord }, { model: User }],
  });

  if (!employee) throw new Error("Employee not found");

  const bi = getBasicInfo(employee);

  const documents = await EmployeeDocument.findAll({
    where: { employee_id: employee.employee_id },
  });

  const pendingDocuments = documents.filter(
    (doc) => doc.status === "PENDING" || doc.status === "UPLOADED"
  );

  if (bi.basic_info_status === "PENDING" || bi.basic_info_status === "SUBMITTED") {
    const err = new Error("Basic Information must be reviewed (Approved or Rejected) first.");
    err.status = 400;
    throw err;
  }

  if (pendingDocuments.length > 0) {
    const err = new Error("All documents must be reviewed (Approved or Rejected) first.");
    err.status = 400;
    throw err;
  }

  const rejectedDocs = documents.filter((doc) => doc.status === "REJECTED");
  const isBasicInfoRejected = bi.basic_info_status === "REJECTED";
  const isSuccess = !isBasicInfoRejected && rejectedDocs.length === 0;

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

  if (emailTo) {
    await sendEmail({ to: emailTo, subject, html, text: subject });
    logger.info(`Final verification email sent to ${emailTo} (Success: ${isSuccess})`);

    employee.basic_info = { ...bi, final_verification_email_sent: true };
    await employee.save();
  }

  if (isSuccess) {
    await formHandler.checkAndUpdateBasicInfoStage(employee.id);
  }

  return {
    message: `Final verification processed: ${isSuccess ? "Verified" : "Rejected"}`,
    isSuccess,
  };
};
