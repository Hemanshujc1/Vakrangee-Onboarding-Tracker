const { FormSubmission, EmployeeMaster } = require("../models");
const logger = require("./logger");

exports.saveForm = async (req, res, formType) => {
  try {
    const userId = req.user.id;
    // req.body contains the form fields.
    
    // 1. Find Employee
    const employee = await EmployeeMaster.findOne({ where: { employee_id: userId } });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 2. Prepare Data
    let formData = { ...req.body };
    // This ensures specific fields like 'nominees', 'witnesses', 'education' are stored as JSON Arrays/Objects
    for (const key in formData) {
        if (typeof formData[key] === 'string') {
            const val = formData[key].trim();
            if ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('[') && val.endsWith(']'))) {
                try {
                    formData[key] = JSON.parse(val);
                } catch (e) {
                    // Not valid JSON, keep as string
                }
            }
        }
    }
    
    // Handle Files (Signature, etc.)
    if (req.file) {
        formData[req.file.fieldname] = req.file.filename;
    }
    if (req.files && !Array.isArray(req.files)) {
        // Object of arrays (upload.fields)
        for (const [key, files] of Object.entries(req.files)) {
            if (files.length > 0) {
                formData[key] = files[0].filename; 
            }
        }
    }

    // 3. Find Draft or Create New
    let form = await FormSubmission.findOne({
      where: {
        employee_id: employee.id,
        form_type: formType,
        status: ["DRAFT", "REJECTED"], 
      },
      order: [["version", "DESC"]],
    });

    // Determine Status
    const isDraft = formData.isDraft === "true" || formData.isDraft === true;
    const status = isDraft ? "DRAFT" : "SUBMITTED";

    if (form) {
      // Update
      const oldData = form.data || {};
      form.data = { ...oldData, ...formData };
      
      form.status = status; 
      if (!isDraft) {
          form.submitted_at = new Date();
      }
      await form.save();
    } else {
      // Create New
      // Check for existing approved/submitted to increment version?
      const latest = await FormSubmission.findOne({
         where: { employee_id: employee.id, form_type: formType },
         order: [['version', 'DESC']]
      });
      const nextVersion = latest ? latest.version + 1 : 1;

      form = await FormSubmission.create({
        employee_id: employee.id,
        form_type: formType,
        version: nextVersion,
        status: status,
        submitted_at: isDraft ? null : new Date(),
        data: formData
      });
    }

    res.json({ message: "Form submitted successfully", formId: form.id, status: form.status });

  } catch (error) {
    logger.error(`Error saving ${formType}: %o`, error);
    res.status(500).json({ message: "Server error saving form." });
  }
};

exports.checkAndUpdateOnboardingStage = async (employeeId) => {
    try {
        const employee = await EmployeeMaster.findByPk(employeeId);
        if (!employee) return;

        // PRE-JOINING Logic
        if (employee.onboarding_stage === 'PRE_JOINING') {
            const disabledParams = employee.disabled_forms || [];
            const preJoiningForms = ['GRATUITY', 'EMPLOYEE_INFO', 'MEDICLAIM', 'EMPLOYMENT_APP']; 
            
            let allVerified = true;
            
            for (const type of preJoiningForms) {
                if (disabledParams.includes(type)) continue;

                const f = await FormSubmission.findOne({
                    where: { employee_id: employeeId, form_type: type },
                    order: [['version', 'DESC']]
                });
                
                if (!f || f.status !== 'VERIFIED') {
                    allVerified = false;
                    break;
                }
            }

            if (allVerified) {
                employee.onboarding_stage = 'PRE_JOINING_VERIFIED';
                await employee.save();
                logger.info(`Auto-updated employee ${employeeId} to PRE_JOINING_VERIFIED`);
            }
        }
        
        // POST-JOINING Logic
        else if (employee.onboarding_stage === 'POST_JOINING') {
            const disabledParams = employee.disabled_forms || [];
            const postJoiningForms = ['NDA', 'DECLARATION', 'TDS', 'EPF'];
            
            let allVerified = true;
            
            for (const type of postJoiningForms) {
                if (disabledParams.includes(type)) continue; 

                const f = await FormSubmission.findOne({
                    where: { employee_id: employeeId, form_type: type },
                    order: [['version', 'DESC']]
                });
                
                if (!f || f.status !== 'VERIFIED') {
                    allVerified = false;
                    break;
                }
            }

            if (allVerified) {
                employee.onboarding_stage = 'ONBOARDED';
                await employee.save();
                logger.info(`Auto-updated employee ${employeeId} to ONBOARDED`);
            }
        }

    } catch (err) {
        logger.error("Error auto-updating stage: %o", err);
    }
};

exports.verifyForm = async (req, res, formType) => {
    try {
        const { employeeId } = req.params;


        const { status, rejectionReason, remarks } = req.body;
        // Check both rejectionReason and remarks (frontend often sends remarks)
        const finalRejectionReason = rejectionReason || remarks;
        const hrId = req.user.id;

        // Find the latest SUBMITTED form for this employee
        const form = await FormSubmission.findOne({
            where: {
                employee_id: employeeId,
                form_type: formType,
                status: 'SUBMITTED'
            },
            order: [['version', 'DESC']]
        });
        
        if (!form) {
            return res.status(404).json({ message: "Form not found or not in Submitted state" });
        }

        form.status = status; // VERIFIED or REJECTED
        form.verified_by = hrId;
        form.verified_at = new Date();
        if (status === 'REJECTED') {
            form.rejection_reason = finalRejectionReason;
        }

        await form.save();

        res.json({ message: `Form ${status}`, form });

        // --- Auto-Update Onboarding Stage Logic ---
        if (status === 'VERIFIED') {
             await exports.checkAndUpdateOnboardingStage(employeeId);
        }
        // ------------------------------------------

    } catch (error) {
        logger.error(`Error verifying ${formType}: %o`, error);
        res.status(500).json({ message: "Server error verifying form." });
    }
};
