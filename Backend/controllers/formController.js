const {
  User,
  EmployeeMaster,
  EmployeeRecord,
  FormSubmission,
} = require("../models");
const sequelize = require("../config/database");
const logger = require("../utils/logger");

// Helper to resolve verified_by ID to Name
const resolveVerifierName = async (verifierId) => {
  if (!verifierId) return null;
  const user = await User.findOne({ where: { employee_id: verifierId } });
  if (!user) return "Unknown";

  const empMaster = await EmployeeMaster.findOne({
    where: { employee_id: user.employee_id },
  });
  if (!empMaster) return user.username;

  const empRecord = await EmployeeRecord.findOne({
    where: { employee_id: empMaster.employee_id },
  });

  if (empRecord && (empRecord.firstname || empRecord.lastname)) {
    return `${empRecord.firstname || ""} ${empRecord.lastname || ""}`.trim();
  }

  return user.username;
};

// Work location display helper
const formatWorkLocation = (wl) => {
  if (!wl) return null;
  if (typeof wl === "string") return wl;
  return [wl.city, wl.district, wl.state].filter(Boolean).join(", ") || null;
};

// Fetch data for auto-filling forms
exports.getAutoFillData = async (req, res) => {
  try {
    const { employeeId } = req.params;
    let targetEmpId = employeeId;

    // Validate if the requesting user is allowed to see this data
    if (req.user.role === "EMPLOYEE") {
      const myEmployee = await EmployeeMaster.findOne({
        where: { employee_id: req.user.employee_id },
      });
      if (!myEmployee) {
        return res
          .status(404)
          .json({ message: "Employee profile not found for this user." });
      }
      targetEmpId = myEmployee.id;
    }

    const employee = await EmployeeMaster.findOne({
      where: { id: targetEmpId },
      include: [{ model: EmployeeRecord }],
    });

    if (!employee || !employee.EmployeeRecord) {
      return res.status(404).json({ message: "Employee record not found." });
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

    const formsMap = {
      EMPLOYMENT_APP: getFormStatus("EMPLOYMENT_APP"),
      MEDICLAIM: getFormStatus("MEDICLAIM"),
      NDA: getFormStatus("NDA"),
      DECLARATION: getFormStatus("DECLARATION"),
      TDS: getFormStatus("TDS"),
      EPF: getFormStatus("EPF"),
      GRATUITY: getFormStatus("GRATUITY"),
      EMPLOYEE_INFO: getFormStatus("EMPLOYEE_INFO"),
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
      employeeCode: employee.employee_id || "", // Use actual custom string employee_id
      panNo: pi.pan_number || "",
      hasPan: "Yes", // Default as per request
      aadhaar: pi.adhar_number || "", // Add aadhaar mapping

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

      // Degree (top-level for PersonalInfoGrid)
      degree_name: acad.degree_name || "",
      degree_percentage: acad.degree_percentage || "",

      mediclaimData: null,
      applicationData: null,
    };

    // 1. Employment Application ('EMPLOYMENT_APP')
    const subApp = getFormStatus("EMPLOYMENT_APP");

    // Helper to find latest rejection reason from history -- Keep this helper
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

    // 3. NDA ('NDA' - POST)
    const subNDA = getFormStatus("NDA");

    autoFillData.ndaId = subNDA.id;
    autoFillData.ndaData = subNDA.data;
    autoFillData.ndaStatus = subNDA.status;
    autoFillData.ndaRejectionReason = subNDA.reason;
    autoFillData.ndaVerifiedByName = await resolveVerifierName(
      subNDA.verifiedBy,
    );
    autoFillData.ndaDisabled = disabledForms.includes("NDA");

    // 4. Declaration ('DECLARATION' - POST)
    const subDec = getFormStatus("DECLARATION");

    autoFillData.declarationId = subDec.id;
    autoFillData.declarationData = subDec.data;
    autoFillData.declarationStatus = subDec.status;
    autoFillData.declarationRejectionReason = subDec.reason;
    autoFillData.declarationVerifiedByName = await resolveVerifierName(
      subDec.verifiedBy,
    );
    autoFillData.declarationDisabled = disabledForms.includes("DECLARATION");

    // 5. TDS ('TDS' - POST)
    const subTDS = getFormStatus("TDS");

    autoFillData.tdsId = subTDS.id;
    autoFillData.tdsData = subTDS.data;
    autoFillData.tdsStatus = subTDS.status;
    autoFillData.tdsRejectionReason = subTDS.reason;
    autoFillData.tdsVerifiedByName = await resolveVerifierName(
      subTDS.verifiedBy,
    );
    autoFillData.tdsDisabled = disabledForms.includes("TDS");

    // 6. EPF ('EPF' - POST)
    const subEPF = getFormStatus("EPF");

    autoFillData.epfId = subEPF.id;
    autoFillData.epfData = subEPF.data;
    autoFillData.epfStatus = subEPF.status;
    autoFillData.epfRejectionReason = subEPF.reason;
    autoFillData.epfVerifiedByName = await resolveVerifierName(
      subEPF.verifiedBy,
    );
    autoFillData.epfDisabled = disabledForms.includes("EPF");

    // 7. Gratuity ('GRATUITY' - PRE)
    const subGrat = getFormStatus("GRATUITY");

    // Populate autoFillData with Gratuity specific pre-fills or existing data
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

    // 8. Employee Info ('EMPLOYEE_INFO' - PRE)
    const subInfo = getFormStatus("EMPLOYEE_INFO");

    let employeeInfoData = subInfo.data;

    if (!employeeInfoData && autoFillData.applicationData) {
      // Construct auto-fill from Application Data if explicit info form doesn't exist
      const app = autoFillData.applicationData;
      employeeInfoData = {
        // Personal
        first_name: app.firstname,
        middle_name: app.middlename,
        last_name: app.lastname,
        date_of_birth: app.dob,
        gender: app.gender,
        blood_group: pi.blood_group || "",
        designation: ji.job_title || "", // Map from employee_records as requested

        // Birth Details (Mapped from EmployeeRecord as requested)
        birth_city: permAddr.city || "",
        birth_state: permAddr.state || "",
        country: permAddr.country || "",

        // Contact
        mobile_no: app.mobileNo,
        alternate_no: app.alternateNo,
        personal_email: app.email,
        emergency_no: app.emergencyNo,

        // IDs
        passport_number: app.passportNo,
        passport_date_of_issue: app.passportIssueDate,
        passport_expiry_date: app.passportExpiryDate,
        pan_number: app.panNo,
        aadhar_number: pi.adhar_number || "",

        // Addresses
        current_building_name: "",
        current_city: "",
        current_district: "",
        current_state: "",

        permanent_building_name: "",

        // Education (Cleared as requested)
        educational_details: [],

        // Employment (Mapped with specific adjustments)
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

        // References
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

    res.status(200).json(autoFillData);
  } catch (error) {
    logger.error("Error fetching auto-fill data: %o", error);
    res.status(500).json({ message: "Server error fetching form data." });
  }
};

// Toggle Form Access (Disable/Enable)
exports.toggleFormAccess = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { formType, category, isDisabled } = req.body; // category: 'PRE' or 'POST'

    if (req.user.role !== "HR_ADMIN" && req.user.role !== "HR_SUPER_ADMIN") {
      return res.status(403).json({ message: "Access denied. HR only." });
    }

    const employee = await EmployeeMaster.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    let disabledForms = employee.disabled_forms || [];

    if (isDisabled) {
      // Add if not present
      if (!disabledForms.includes(formType)) {
        disabledForms.push(formType);
      }
    } else {
      // Remove if present
      disabledForms = disabledForms.filter((f) => f !== formType);
    }

    employee.disabled_forms = disabledForms;
    await employee.save();

    // Check if disabling this form triggers a stage update
    await handler.checkAndUpdateOnboardingStage(employeeId);

    res.json({ message: `Form access updated`, isDisabled });
  } catch (error) {
    logger.error("Error toggling form access: %o", error);
    res.status(500).json({ message: "Server error toggling access" });
  }
};
