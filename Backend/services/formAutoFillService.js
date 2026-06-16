const {
  User,
  EmployeeMaster,
  EmployeeRecord,
  FormSubmission,
} = require("../models");

const { resolveVerifierName } = require("./userService");

// Work location display helper
const formatWorkLocation = (wl) => {
  if (!wl) return null;
  if (typeof wl === "string") return wl;
  return [wl.city, wl.district, wl.state].filter(Boolean).join(", ") || null;
};

exports.generateAutoFillData = async (employeeIdParam, reqUser) => {
  let targetEmpId = employeeIdParam;

  // Validate if the requesting user is allowed to see this data
  if (reqUser.role === "EMPLOYEE") {
    const myEmployee = await EmployeeMaster.findOne({
      where: { employee_id: reqUser.employee_id },
    });
    if (!myEmployee) {
      const err = new Error("Employee profile not found for this user.");
      err.status = 404;
      throw err;
    }
    targetEmpId = myEmployee.id;
  }

  const employee = await EmployeeMaster.findOne({
    where: { id: targetEmpId },
    include: [{ model: EmployeeRecord }],
  });

  if (!employee || !employee.EmployeeRecord) {
    const err = new Error("Employee record not found.");
    err.status = 404;
    throw err;
  }

  // Fetch All Latest Forms
  const forms = await FormSubmission.findAll({
    where: { employee_id: employee.employee_id },
    order: [["version", "DESC"]],
  });

  const getFormStatus = (type) => {
    const f = forms.find((x) => x.form_type === type);
    return f
      ? {
          id: f.id,
          status: f.status,
          reason: f.rejection_reason,
          verifiedBy: f.verified_by,
          data: f.data,
        }
      : {
          id: null,
          status: "PENDING",
          reason: null,
          verifiedBy: null,
          data: null,
        };
  };

  const record = employee.EmployeeRecord;
  const pi = record.personal_info || {};
  const ci = record.contact_info || {};
  const ji = record.job_info || {};
  const acad = record.academic_details || {};
  const permAddr = (record.address_info || [])[0] || {};
  const commAddr = (record.address_info || [])[1] || {};

  let age = "";
  if (pi.date_of_birth) {
    const dob = new Date(pi.date_of_birth);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    age = Math.abs(age_dt.getUTCFullYear() - 1970).toString();
  }

  // Map to a standard format for frontend forms
  const onboardingStage = employee.employee_status?.onboarding_stage;
  const disabledForms = employee.disabled_forms || [];

  const autoFillData = {
    onboardingStage: onboardingStage,

    // Identity
    fullName: `${pi.firstname || ""} ${pi.lastname || ""}`.trim(),
    firstname: pi.firstname || "",
    middlename: pi.middlename || "",
    lastname: pi.lastname || "",
    dateOfBirth: pi.date_of_birth || null,
    gender: pi.gender || "",
    age: age,
    bloodGroup: pi.blood_group || "",

    // Contact
    email: ci.personal_email_id || "",
    phone: ci.phone || "",
    mobileNo: ci.phone || "", // mapping for FormApplication
    emergencyNo: ci.emergency_contact_number || "",

    address: {
      line1: permAddr.address_line1 || "",
      line2: permAddr.address_line2 || "",
      landmark: permAddr.landmark || "",
      post_office: permAddr.post_office || "",
      district: permAddr.district || "",
      city: permAddr.city || "",
      state: permAddr.state || "",
      pincode: permAddr.pincode || "",
      country: permAddr.country || "India",
    },

    communicationAddress:
      commAddr && Object.keys(commAddr).length > 0 && commAddr.address_line1
        ? {
            line1: commAddr.address_line1 || "",
            line2: commAddr.address_line2 || "",
            landmark: commAddr.landmark || "",
            post_office: commAddr.post_office || "",
            district: commAddr.district || "",
            city: commAddr.city || "",
            state: commAddr.state || "",
            pincode: commAddr.pincode || "",
            country: commAddr.country || "India",
          }
        : {
            line1: permAddr.address_line1 || "",
            line2: permAddr.address_line2 || "",
            landmark: permAddr.landmark || "",
            post_office: permAddr.post_office || "",
            district: permAddr.district || "",
            city: permAddr.city || "",
            state: permAddr.state || "",
            pincode: permAddr.pincode || "",
            country: permAddr.country || "India",
          },

    // Address string for FormApplication
    currentAddress:
      commAddr && Object.keys(commAddr).length > 0 && commAddr.address_line1
        ? [
            commAddr.address_line1,
            commAddr.address_line2,
            commAddr.landmark,
            commAddr.post_office,
            commAddr.district,
            commAddr.city && commAddr.pincode
              ? `${commAddr.city} - ${commAddr.pincode}`
              : commAddr.city || commAddr.pincode,
            commAddr.state,
          ]
            .filter(Boolean)
            .join(", ")
        : [
            permAddr.address_line1,
            permAddr.address_line2,
            permAddr.landmark,
            permAddr.post_office,
            permAddr.district,
            permAddr.city && permAddr.pincode
              ? `${permAddr.city} - ${permAddr.pincode}`
              : permAddr.city || permAddr.pincode,
            permAddr.state,
          ]
            .filter(Boolean)
            .join(", "),

    permanentAddress: [
      permAddr.address_line1,
      permAddr.address_line2,
      permAddr.landmark,
      permAddr.post_office,
      permAddr.district,
      permAddr.city && permAddr.pincode
        ? `${permAddr.city} - ${permAddr.pincode}`
        : permAddr.city || permAddr.pincode,
      permAddr.state,
    ]
      .filter(Boolean)
      .join(", "),

    // Employment
    designation: ji.job_title || "",
    department: ji.department_name || "",
    dateOfJoining: ji.date_of_joining || "",
    location: formatWorkLocation(record.work_location),
    employeeCode: employee.employee_id || "",
    panNo: pi.pan_number || "",
    hasPan: "Yes",
    aadhaar: pi.adhar_number || "",

    // FormApplication specific
    positionApplied: ji.job_title || "",
    education: [
      {
        qualification: "10th",
        percentage: acad.tenth_percentage?.toString() || "",
      },
      {
        qualification: "12th",
        percentage: acad.twelfth_percentage?.toString() || "",
      },
      ...(acad.degree_name
        ? [
            {
              qualification: acad.degree_name,
              percentage: acad.degree_percentage?.toString() || "",
            },
          ]
        : []),
    ],

    // Assets
    profilePhoto: record.profile_photo || null,
    signature: record.signature || null,

    // Degree
    degree_name: acad.degree_name || "",
    degree_percentage: acad.degree_percentage || "",

    mediclaimData: null,
    applicationData: null,
  };

  // 1. Employment Application ('EMPLOYMENT_APP')
  const subApp = getFormStatus("EMPLOYMENT_APP");

  const getLatestRejectionReason = (type) => {
    const rejectedForm = forms.find(
      (x) => x.form_type === type && x.status === "REJECTED",
    );
    return rejectedForm ? rejectedForm.rejection_reason : null;
  };

  autoFillData.applicationId = subApp.id;
  autoFillData.applicationData = subApp.data;
  autoFillData.applicationStatus = subApp.status;
  autoFillData.applicationRejectionReason =
    subApp.reason ||
    (subApp.status === "DRAFT"
      ? getLatestRejectionReason("EMPLOYMENT_APP")
      : null);
  autoFillData.applicationVerifiedByName = await resolveVerifierName(
    subApp.verifiedBy,
  );
  autoFillData.applicationDisabled = disabledForms.includes("EMPLOYMENT_APP");

  // 2. Mediclaim ('MEDICLAIM')
  const subMed = getFormStatus("MEDICLAIM");

  autoFillData.mediclaimId = subMed.id;
  autoFillData.mediclaimData = subMed.data;
  autoFillData.mediclaimStatus = subMed.status;
  autoFillData.mediclaimRejectionReason = subMed.reason;
  autoFillData.mediclaimVerifiedByName = await resolveVerifierName(
    subMed.verifiedBy,
  );
  autoFillData.mediclaimDisabled = disabledForms.includes("MEDICLAIM");

  // 3. NDA ('NDA')
  const subNDA = getFormStatus("NDA");

  autoFillData.ndaId = subNDA.id;
  autoFillData.ndaData = subNDA.data;
  autoFillData.ndaStatus = subNDA.status;
  autoFillData.ndaRejectionReason = subNDA.reason;
  autoFillData.ndaVerifiedByName = await resolveVerifierName(
    subNDA.verifiedBy,
  );
  autoFillData.ndaDisabled = disabledForms.includes("NDA");

  // 4. Declaration ('DECLARATION')
  const subDec = getFormStatus("DECLARATION");

  autoFillData.declarationId = subDec.id;
  autoFillData.declarationData = subDec.data;
  autoFillData.declarationStatus = subDec.status;
  autoFillData.declarationRejectionReason = subDec.reason;
  autoFillData.declarationVerifiedByName = await resolveVerifierName(
    subDec.verifiedBy,
  );
  autoFillData.declarationDisabled = disabledForms.includes("DECLARATION");

  // 5. TDS ('TDS')
  const subTDS = getFormStatus("TDS");

  autoFillData.tdsId = subTDS.id;
  autoFillData.tdsData = subTDS.data;
  autoFillData.tdsStatus = subTDS.status;
  autoFillData.tdsRejectionReason = subTDS.reason;
  autoFillData.tdsVerifiedByName = await resolveVerifierName(
    subTDS.verifiedBy,
  );
  autoFillData.tdsDisabled = disabledForms.includes("TDS");

  // 6. EPF ('EPF')
  const subEPF = getFormStatus("EPF");

  autoFillData.epfId = subEPF.id;
  autoFillData.epfData = subEPF.data;
  autoFillData.epfStatus = subEPF.status;
  autoFillData.epfRejectionReason = subEPF.reason;
  autoFillData.epfVerifiedByName = await resolveVerifierName(
    subEPF.verifiedBy,
  );
  autoFillData.epfDisabled = disabledForms.includes("EPF");

  // 7. Gratuity ('GRATUITY')
  const subGrat = getFormStatus("GRATUITY");

  autoFillData.gratuityData = subGrat.data || {
    firstname: pi.firstname || "",
    middlename: pi.middlename || "",
    lastname: pi.lastname || "",
    gender: pi.gender || "",
    department: ji.department_name || "",
    date_of_appointment: ji.date_of_joining || "",
    permanent_address: [
      permAddr.address_line1,
      permAddr.address_line2,
      permAddr.city,
      permAddr.district,
      permAddr.pincode,
    ]
      .filter(Boolean)
      .join(", "),
    district: permAddr.district || "",
    state: permAddr.state || "",
    place: permAddr.city || "",
    signature_path: null,
    employee_full_name: `${pi.firstname || ""} ${pi.lastname || ""}`.trim(),
  };

  autoFillData.gratuityId = subGrat.id;
  autoFillData.gratuityStatus = subGrat.status;
  autoFillData.gratuityRejectionReason = subGrat.reason;
  autoFillData.gratuityVerifiedByName = await resolveVerifierName(
    subGrat.verifiedBy,
  );
  autoFillData.gratuityDisabled = disabledForms.includes("GRATUITY");

  // 8. Employee Info ('EMPLOYEE_INFO')
  const subInfo = getFormStatus("EMPLOYEE_INFO");

  let employeeInfoData = subInfo.data;

  if (!employeeInfoData && autoFillData.applicationData) {
    const app = autoFillData.applicationData;
    employeeInfoData = {
      first_name: app.firstname,
      middle_name: app.middlename,
      last_name: app.lastname,
      date_of_birth: app.dob,
      gender: app.gender,
      blood_group: pi.blood_group || "",
      designation: ji.job_title || "", 

      birth_city: permAddr.city || "",
      birth_state: permAddr.state || "",
      country: permAddr.country || "",

      mobile_no: app.mobileNo,
      alternate_no: app.alternateNo,
      personal_email: app.email,
      emergency_no: app.emergencyNo,

      passport_number: app.passportNo,
      passport_date_of_issue: app.passportIssueDate,
      passport_expiry_date: app.passportExpiryDate,
      pan_number: app.panNo,
      aadhar_number: pi.adhar_number || "",

      current_building_name: "",
      current_city: "",
      current_district: "",
      current_state: "",
      permanent_building_name: "",

      educational_details: [],
      employment_details: (app.workExperience || []).map((exp) => ({
        companyName: exp.employer,
        address: exp.location,
        position: exp.designation || exp.currentDesignation,
        startDate: exp.joiningDate,
        compensation: exp.currentCTC || exp.joiningCTC,
        reasonLeaving: exp.reasonLeaving,
        duties: exp.responsibilities,
        designation: "",
      })),

      references: app.references || [],
    };
  }

  autoFillData.employeeInfoId = subInfo.id;
  autoFillData.employeeInfoData = employeeInfoData;
  autoFillData.employeeInfoStatus = subInfo.status;
  autoFillData.employeeInfoRejectionReason = subInfo.reason;
  autoFillData.employeeInfoVerifiedByName = await resolveVerifierName(
    subInfo.verifiedBy,
  );
  autoFillData.employeeInfoDisabled = disabledForms.includes("EMPLOYEE_INFO");

  return autoFillData;
};
