const { User, EmployeeMaster, EmployeeRecord, FormSubmission } = require('../models');
const sequelize = require('../config/database');
const logger = require('../utils/logger');

// Helper to resolve verified_by ID to Name
const resolveVerifierName = async (verifierId) => {
    if (!verifierId) return null;
    const user = await User.findByPk(verifierId);
    if (!user) return "Unknown";
    
    const empMaster = await EmployeeMaster.findOne({ where: { employee_id: user.id } });
    if (!empMaster) return user.username;
    
    const empRecord = await EmployeeRecord.findOne({ where: { employee_id: empMaster.id }});
    
    if (empRecord && (empRecord.firstname || empRecord.lastname)) {
        return `${empRecord.firstname || ""} ${empRecord.lastname || ""}`.trim();
    }
    
    return user.username;
};

// Fetch data for auto-filling forms
exports.getAutoFillData = async (req, res) => {
  try {
    const { employeeId } = req.params;
    let targetEmpId = employeeId;

    // Validate if the requesting user is allowed to see this data
    if (req.user.role === 'EMPLOYEE') {
        const myEmployee = await EmployeeMaster.findOne({ where: { employee_id: req.user.id } });
        if (!myEmployee) {
            return res.status(404).json({ message: 'Employee profile not found for this user.' });
        }
        targetEmpId = myEmployee.id;
    }

    const employee = await EmployeeMaster.findOne({
      where: { id: targetEmpId },
      include: [{ model: EmployeeRecord }]
    });

    if (!employee || !employee.EmployeeRecord) {
      return res.status(404).json({ message: 'Employee record not found.' });
    }

    // Fetch All Latest Forms
    const forms = await FormSubmission.findAll({
        where: { employee_id: employee.id },
        order: [['version', 'DESC']]
    });

    const getFormStatus = (type) => {
        const f = forms.find(x => x.form_type === type);
        return f ? { status: f.status, reason: f.rejection_reason, verifiedBy: f.verified_by, data: f.data } : { status: 'PENDING', reason: null, verifiedBy: null, data: null };
    };

    const formsMap = {
        'EMPLOYMENT_APP': getFormStatus('EMPLOYMENT_APP'),
        'MEDICLAIM': getFormStatus('MEDICLAIM'),
        'NDA': getFormStatus('NDA'),
        'DECLARATION': getFormStatus('DECLARATION'),
        'TDS': getFormStatus('TDS'),
        'EPF': getFormStatus('EPF'),
        'GRATUITY': getFormStatus('GRATUITY'),
        'EMPLOYEE_INFO': getFormStatus('EMPLOYEE_INFO'),
    };

    const record = employee.EmployeeRecord;
    
    let age = "";
    if (record.date_of_birth) {
        const dob = new Date(record.date_of_birth);
        const diff_ms = Date.now() - dob.getTime();
        const age_dt = new Date(diff_ms); 
        age = Math.abs(age_dt.getUTCFullYear() - 1970).toString();
    }

    // Map to a standard format for frontend forms
    const onboardingStage = employee.onboarding_stage;
    const disabledForms = employee.disabled_forms || [];

    const autoFillData = {
      onboardingStage: onboardingStage,
      
      // Identity
      fullName: `${record.firstname} ${record.lastname}`.trim(),
      firstname: record.firstname,
      lastname: record.lastname,
      dateOfBirth: record.date_of_birth,
      gender: record.gender,
      age: age,
      
      // Contact
      email: record.personal_email_id,
      phone: record.phone,
      mobileNo: record.phone, // mapping for FormApplication
      
      address: {
        line1: record.address_line1,
        line2: record.address_line2,
        landmark: record.landmark,
        post_office: record.post_office,
        district: record.district,
        city: record.city,
        state: record.state,
        pincode: record.pincode,
        country: record.country
      },
      
      // Address string for FormApplication
      currentAddress: [
        record.address_line1,
        record.address_line2,
        record.landmark,
        record.post_office,
        record.district,
        record.city && record.pincode
          ? `${record.city} - ${record.pincode}`
          : record.city || record.pincode,
        record.state,
        record.country,
      ]
        .filter(Boolean)
        .join(", "),
      
      permanentAddress: [
        record.address_line1,
        record.address_line2,
        record.landmark,
        record.post_office,
        record.district,
        record.city && record.pincode
          ? `${record.city} - ${record.pincode}`
          : record.city || record.pincode,
        record.state,
        record.country,
      ]
        .filter(Boolean)
        .join(", "),
      
      // Employment
      designation: record.job_title,
      department: record.department_name,
      dateOfJoining: record.date_of_joining,
      location: record.work_location,
      employeeCode: employee.id, // Or add a specific code field if 'ticket_no' is used
      panNo: record.pan_number,
      hasPan: "Yes", // Default as per request
      aadhaar: record.adhar_number, // Add aadhaar mapping
      
      // FormApplication specific
      positionApplied: record.job_title,
      education: [
         { qualification: "10th", percentage: record.tenth_percentage?.toString() || "" },
         { qualification: "12th", percentage: record.twelfth_percentage?.toString() || "" }
      ],

      // Assets
      profilePhoto: record.profile_photo,
      signature: null, 
       
      mediclaimData: null,
      applicationData: null
    };


    // 1. Employment Application ('EMPLOYMENT_APP')
    const subApp = getFormStatus('EMPLOYMENT_APP');
    
    // Helper to find latest rejection reason from history -- Keep this helper
    const getLatestRejectionReason = (type) => {
        const rejectedForm = forms.find(x => x.form_type === type && x.status === "REJECTED");
        return rejectedForm ? rejectedForm.rejection_reason : null;
    };

    autoFillData.applicationData = subApp.data;
    autoFillData.applicationStatus = subApp.status;
    autoFillData.applicationRejectionReason = subApp.reason || (subApp.status === "DRAFT" ? getLatestRejectionReason('EMPLOYMENT_APP') : null);
    autoFillData.applicationVerifiedByName = await resolveVerifierName(subApp.verifiedBy);
    autoFillData.applicationDisabled = disabledForms.includes('EMPLOYMENT_APP');

    // 2. Mediclaim ('MEDICLAIM')
    const subMed = getFormStatus('MEDICLAIM');

    autoFillData.mediclaimData = subMed.data;
    autoFillData.mediclaimStatus = subMed.status; 
    autoFillData.mediclaimRejectionReason = subMed.reason;
    autoFillData.mediclaimVerifiedByName = await resolveVerifierName(subMed.verifiedBy);
    autoFillData.mediclaimDisabled = disabledForms.includes('MEDICLAIM');

    // 3. NDA ('NDA' - POST)
    const subNDA = getFormStatus('NDA');

    autoFillData.ndaData = subNDA.data;
    autoFillData.ndaStatus = subNDA.status;
    autoFillData.ndaRejectionReason = subNDA.reason;
    autoFillData.ndaVerifiedByName = await resolveVerifierName(subNDA.verifiedBy);
    autoFillData.ndaDisabled = disabledForms.includes('NDA');

    // 4. Declaration ('DECLARATION' - POST)
    const subDec = getFormStatus('DECLARATION');

    autoFillData.declarationData = subDec.data;
    autoFillData.declarationStatus = subDec.status;
    autoFillData.declarationRejectionReason = subDec.reason;
    autoFillData.declarationVerifiedByName = await resolveVerifierName(subDec.verifiedBy);
    autoFillData.declarationDisabled = disabledForms.includes('DECLARATION');

    // 5. TDS ('TDS' - POST)
    const subTDS = getFormStatus('TDS');

    autoFillData.tdsData = subTDS.data;
    autoFillData.tdsStatus = subTDS.status;
    autoFillData.tdsRejectionReason = subTDS.reason;
    autoFillData.tdsVerifiedByName = await resolveVerifierName(subTDS.verifiedBy);
    autoFillData.tdsDisabled = disabledForms.includes('TDS');

    // 6. EPF ('EPF' - POST)
    const subEPF = getFormStatus('EPF');

    autoFillData.epfData = subEPF.data;
    autoFillData.epfStatus = subEPF.status;
    autoFillData.epfRejectionReason = subEPF.reason;
    autoFillData.epfVerifiedByName = await resolveVerifierName(subEPF.verifiedBy);
    autoFillData.epfDisabled = disabledForms.includes('EPF');

    // 7. Gratuity ('GRATUITY' - PRE)
    const subGrat = getFormStatus('GRATUITY');

    // Populate autoFillData with Gratuity specific pre-fills or existing data
    autoFillData.gratuityData = subGrat.data || {
        firstname: record.firstname,
        lastname: record.lastname,
        gender: record.gender, 
        department: record.department_name,
        date_of_appointment: record.date_of_joining,
        permanent_address: [record.address_line1, record.address_line2, record.city, record.district, record.pincode].filter(Boolean).join(", "),
        district: record.district,
        state: record.state,
        place: record.city,
        signature_path: null,
        employee_full_name: `${record.firstname} ${record.lastname}`.trim()
    };
    
    autoFillData.gratuityStatus = subGrat.status;
    autoFillData.gratuityRejectionReason = subGrat.reason;
    autoFillData.gratuityVerifiedByName = await resolveVerifierName(subGrat.verifiedBy);
    autoFillData.gratuityDisabled = disabledForms.includes('GRATUITY');

    // 8. Employee Info ('EMPLOYEE_INFO' - PRE)
    const subInfo = getFormStatus('EMPLOYEE_INFO');
    
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
                blood_group:  record.blood_group, 
                designation: record.job_title, // Map from employee_records as requested
                
                // Birth Details (Mapped from EmployeeRecord as requested)
                birth_city: record.city,
                birth_state: record.state,
                country: record.country,

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
                aadhar_number: record.adhar_number,

                // Addresses
                current_building_name: "", 
                current_city: record.city,
                current_district: record.district,
                current_state: record.state,
                
                permanent_building_name: "", 
                
                // Education (Cleared as requested)
                educational_details: [],
                
                // Employment (Mapped with specific adjustments)
                employment_details: (app.workExperience || []).map(exp => ({
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
                references: app.references || []
            };
        }
    
    autoFillData.employeeInfoData = employeeInfoData;
    autoFillData.employeeInfoStatus = subInfo.status;
    autoFillData.employeeInfoRejectionReason = subInfo.reason;
    autoFillData.employeeInfoVerifiedByName = await resolveVerifierName(subInfo.verifiedBy);
    autoFillData.employeeInfoDisabled = disabledForms.includes('EMPLOYEE_INFO');

    res.status(200).json(autoFillData);

  } catch (error) {
    logger.error('Error fetching auto-fill data: %o', error);
    res.status(500).json({ message: 'Server error fetching form data.' });
  }
};

// Toggle Form Access (Disable/Enable)
exports.toggleFormAccess = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { formType, category, isDisabled } = req.body; // category: 'PRE' or 'POST'

        if (req.user.role !== 'HR_ADMIN' && req.user.role !== 'HR_SUPER_ADMIN') {
            return res.status(403).json({ message: 'Access denied. HR only.' });
        }

        const employee = await EmployeeMaster.findOne({ where: { employee_id: employeeId } });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        let disabledForms = employee.disabled_forms || [];

        if (isDisabled) {
            // Add if not present
            if (!disabledForms.includes(formType)) {
                disabledForms.push(formType);
            }
        } else {
            // Remove if present
            disabledForms = disabledForms.filter(f => f !== formType);
        }

        employee.disabled_forms = disabledForms;
        await employee.save();

        // Check if disabling this form triggers a stage update
        await handler.checkAndUpdateOnboardingStage(employeeId);

        res.json({ message: `Form access updated`, isDisabled });

    } catch (error) {
        logger.error('Error toggling form access: %o', error);
        res.status(500).json({ message: 'Server error toggling access' });
    }
};
