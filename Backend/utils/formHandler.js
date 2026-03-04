const { FormSubmission, EmployeeMaster, EmployeeDocument, EmployeeRecord, User } = require("../models");
const logger = require("./logger");
const sendEmail = require("./emailService");

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

    if (status === "SUBMITTED") {
        await exports.sendHRSubmissionNotification(employee.id, `Form: ${formType.replace(/_/g, ' ')}`);
    }

    res.json({ message: "Form submitted successfully", formId: form.id, status: form.status });

  } catch (error) {
    logger.error(`Error saving ${formType}: %o`, error);
    res.status(500).json({ message: "Server error saving form." });
  }
};

exports.checkAndUpdateBasicInfoStage = async (employeeId) => {
    try {
        const employee = await EmployeeMaster.findByPk(employeeId);
        if (!employee || employee.onboarding_stage !== 'BASIC_INFO') return;

        if (employee.basic_info_status !== 'VERIFIED') return;

        const documents = await EmployeeDocument.findAll({
            where: { employee_id: employee.id }
        });

        const docMap = {};
        documents.forEach(d => {
            docMap[d.document_type] = d.status;
        });

        const requiredDocs = [
          "PAN Card",
          "Aadhar Card",
          "10th Marksheet",
          "12th Marksheet",
          "Degree Certificate",
          "Cancelled Cheque"
        ];
        
        let allVerified = true;
        for (const reqDoc of requiredDocs) {
            if (docMap[reqDoc] !== 'VERIFIED') {
                allVerified = false;
                break;
            }
        }
        
        // Also check signature in EmployeeRecord
        const record = await EmployeeRecord.findOne({ where: { employee_id: employee.id } });
        if (!record || !record.signature) {
            allVerified = false;
        }

        if (allVerified) {
            employee.onboarding_stage = 'PRE_JOINING';
            employee.basic_info_rejection_reason = null; 
            employee.disabled_forms = []; // Enable all forms for pre-joining
            await employee.save();
            logger.info(`Auto-updated employee ${employeeId} to PRE_JOINING and enabled forms.`);
        }

    } catch (err) {
        logger.error("Error auto-updating basic info stage: %o", err);
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

        // Send Notification
        await exports.sendVerificationNotification(employeeId, formType.replace(/_/g, ' '), status, finalRejectionReason);

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

exports.sendVerificationNotification = async (employeeId, itemTitle, status, rejectionReason) => {
    try {
        const employee = await EmployeeMaster.findByPk(employeeId, {
            include: [{ model: EmployeeRecord }, { model: User }]
        });

        if (!employee) {
            logger.warn(`Could not send notification: Employee ${employeeId} not found.`);
            return;
        }

        const emailTo = employee.EmployeeRecord?.personal_email_id || employee.User?.username;
        if (!emailTo) {
            logger.warn(`Could not send notification: No email found for employee ${employeeId}.`);
            return;
        }

        const employeeName = employee.EmployeeRecord 
            ? `${employee.EmployeeRecord.firstname} ${employee.EmployeeRecord.lastname}`.trim()
            : "Employee";

        const subject = `Update on your Onboarding: ${itemTitle} is ${status}`;
        
        const statusText = status === 'VERIFIED' ? 'successfully verified' : 'rejected';
        const actionText = status === 'VERIFIED' 
            ? 'You can now proceed with the next steps of your onboarding.' 
            : `Please log in to the portal to correct the details and resubmit. \n\nReason for rejection: ${rejectionReason}`;

        const text = `Dear ${employeeName},\n\nYour ${itemTitle} has been ${statusText}.\n\n${actionText}\n\nBest regards,\nVakrangee HR Team`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: ${status === 'VERIFIED' ? '#2e7d32' : '#d32f2f'};">Onboarding Update</h2>
                <p>Dear <strong>${employeeName}</strong>,</p>
                <p>Your <strong>${itemTitle}</strong> has been <strong>${statusText}</strong>.</p>
                <p>${actionText.replace(/\n\n/g, '<br/><br/>')}</p>
                <br/>
                <p>Best regards,<br/><strong>Vakrangee HR Team</strong></p>
            </div>
        `;

        await sendEmail({ to: emailTo, subject, text, html });
        logger.info(`Verification email sent to ${emailTo} for ${itemTitle} (${status})`);

    } catch (err) {
        logger.error(`Error sending verification notification: %o`, err);
    }
};

exports.sendHRSubmissionNotification = async (employeeId, itemTitle) => {
    try {
        const employee = await EmployeeMaster.findByPk(employeeId, {
            include: [{ model: EmployeeRecord }]
        });

        if (!employee || !employee.EmployeeRecord || !employee.EmployeeRecord.onboarding_hr_id) {
            logger.warn(`Could not send HR notification: No HR assigned to employee ${employeeId}.`);
            return;
        }

        const hrUser = await User.findByPk(employee.EmployeeRecord.onboarding_hr_id);
        if (!hrUser || !hrUser.username) {
            logger.warn(`Could not send HR notification: HR user not found for ID ${employee.EmployeeRecord.onboarding_hr_id}.`);
            return;
        }

        const employeeName = `${employee.EmployeeRecord.firstname} ${employee.EmployeeRecord.lastname}`.trim();
        const subject = `New Submission for Review: ${employeeName} - ${itemTitle}`;
        
        const text = `Dear HR Admin,\n\nEmployee ${employeeName} has submitted ${itemTitle} for your review.\n\nPlease log in to the portal to verify the submission.\n\nBest regards,\nVakrangee Onboarding System`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #1976d2;">New Submission for Review</h2>
                <p>Dear HR Admin,</p>
                <p>Employee <strong>${employeeName}</strong> has submitted <strong>${itemTitle}</strong> for your review.</p>
                <p>Please log in to the portal to verify the submission.</p>
                <br/>
                <p>Best regards,<br/><strong>Vakrangee Onboarding System</strong></p>
            </div>
        `;

        await sendEmail({ to: hrUser.username, subject, text, html });
        logger.info(`HR submission notification sent to ${hrUser.username} for ${employeeName}'s ${itemTitle}`);

    } catch (err) {
        logger.error(`Error sending HR submission notification: %o`, err);
    }
};
