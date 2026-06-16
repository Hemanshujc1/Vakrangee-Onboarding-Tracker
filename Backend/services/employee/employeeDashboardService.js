const {
  EmployeeMaster,
  EmployeeRecord,
  FormSubmission,
  EmployeeDocument,
} = require("../../models");
const {
  getEmpStatus,
  getBasicInfo,
} = require("../../utils/employeeHelpers");

exports.getDashboardStats = async (employeeId) => {
  const employee = await EmployeeMaster.findOne({
    where: { employee_id: employeeId },
    include: [{ model: EmployeeRecord }],
  });

  if (!employee) throw new Error("Employee not found");

  const empStatus = getEmpStatus(employee);
  const bi = getBasicInfo(employee);

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

  const PRE_JOINING_FORMS = ["EMPLOYMENT_APP", "MEDICLAIM", "EMPLOYEE_INFO", "GRATUITY"];
  const POST_JOINING_FORMS = ["NDA", "TDS", "DECLARATION", "EPF"];

  let basicInfoProgress = 0;
  const biStatus = bi.basic_info_status || "PENDING";
  if (biStatus === "VERIFIED") {
    basicInfoProgress = 34;
  } else if (biStatus === "SUBMITTED") {
    basicInfoProgress = 15;
  } else if (biStatus === "REJECTED" || biStatus === "DRAFT") {
    basicInfoProgress = 7;
  } else {
    basicInfoProgress = 0;
  }

  const disabledForms = employee.disabled_forms || [];
  const enabledPreForms = PRE_JOINING_FORMS.filter(f => !disabledForms.includes(f));
  const enabledPostForms = POST_JOINING_FORMS.filter(f => !disabledForms.includes(f));

  const allFormSubmissions = await FormSubmission.findAll({
    where: { employee_id: employee.employee_id },
    raw: true
  });

  const getFormStatusPercentage = (status) => {
    if (status === "VERIFIED") return 1.0;
    if (status === "SUBMITTED") return 0.5;
    if (status === "DRAFT" || status === "REJECTED") return 0.25;
    return 0;
  };

  let preJoiningProgress = 0;
  if (enabledPreForms.length === 0) {
    preJoiningProgress = 33;
  } else {
    const weightPerForm = 33 / enabledPreForms.length;
    let preScore = 0;
    for (const formKey of enabledPreForms) {
      const submission = allFormSubmissions.find(s => s.form_type === formKey);
      const status = submission ? submission.status : "PENDING";
      preScore += weightPerForm * getFormStatusPercentage(status);
    }
    preJoiningProgress = preScore;
  }

  let postJoiningProgress = 0;
  if (enabledPostForms.length === 0) {
    postJoiningProgress = 33;
  } else {
    const weightPerForm = 33 / enabledPostForms.length;
    let postScore = 0;
    for (const formKey of enabledPostForms) {
      const submission = allFormSubmissions.find(s => s.form_type === formKey);
      const status = submission ? submission.status : "PENDING";
      postScore += weightPerForm * getFormStatusPercentage(status);
    }
    postJoiningProgress = postScore;
  }

  let progressPercentage = Math.round(basicInfoProgress + preJoiningProgress + postJoiningProgress);
  progressPercentage = Math.min(100, Math.max(0, progressPercentage));

  let nextAction = null;
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

  return {
    progress: Math.min(progressPercentage, 100),
    basicInfoStatus: biStatus,
    onboardingStage: stage,
    completedFormsCount: allFormSubmissions.filter(s => s.status === "SUBMITTED" || s.status === "VERIFIED").length,
    docsVerified: areDocsVerified,
    nextAction,
  };
};
