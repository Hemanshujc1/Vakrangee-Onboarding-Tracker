const { FormSubmission, EmployeeMaster } = require("../models");

exports.saveForm = async (req, res, formType) => {
  try {
    const userId = req.user.id;
    // req.body contains the form fields.
    // req.file/req.files might contain signature/documents.
    
    // 1. Find Employee
    // Note: If HR saves, we might need a target employee ID in body or params.
    // For now, assume Employee saves their own form (typical flow).
    // Or if admin saves, we check logic.
    const employee = await EmployeeMaster.findOne({ where: { employee_id: userId } });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 2. Prepare Data
    let formData = { ...req.body };

    // Helper: Attempt to parse JSON strings (commonly sent via FormData for arrays)
    // This ensures specific fields like 'nominees', 'witnesses', 'education' are stored as JSON Arrays/Objects
    // instead of strings in the JSONB column.
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
    if (req.files) {
        if (Array.isArray(req.files)) {
             // Handle array of files if needed (usually using fieldname)
             req.files.forEach(f => {
                 // For now, simple mapping. If multiple files same field, might need array logic.
                 // But most forms here use upload.single or upload.fields with maxCount 1
             });
        } else {
            // Object of arrays (upload.fields)
            for (const [key, files] of Object.entries(req.files)) {
                if (files.length > 0) {
                    formData[key] = files[0].filename; 
                }
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
    console.error(`Error saving ${formType}:`, error);
    res.status(500).json({ message: "Server error saving form." });
  }
};

exports.verifyForm = async (req, res, formType) => {
    try {
        const { employeeId } = req.params; // Note: Route uses :employeeId (EmployeeMaster ID or UserID? backend usually confusing here)
        // routes/formRoutes.js says: /:employeeId. usually Logic expects EmployeeMaster ID.
        // Let's assume EmployeeMaster.id because `employeeId` naming usually implies that in this codebase.
        // Wait, legacy `getAutoFillData` used `employeeId` as EmployeeMaster ID.

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

        // Note: New schema logic might need to update EmployeeMaster.onboarding_stage 
        // if this was the last form? Legacy controllers often did that. 
        // For 'Take your time', we stick to basic Verify.

        res.json({ message: `Form ${status}`, form });

    } catch (error) {
        console.error(`Error verifying ${formType}:`, error);
        res.status(500).json({ message: "Server error verifying form." });
    }
};
