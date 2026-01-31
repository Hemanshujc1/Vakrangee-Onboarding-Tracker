const { FormSubmission, EmployeeMaster, User } = require("../models");
const sequelize = require("../config/database");

// Get Form Data (Draft or Submitted)
exports.getForm = async (req, res) => {
  try {
    const { formType } = req.params;
    const userId = req.user.id;

    // Resolve employee_id from user
    const employee = await EmployeeMaster.findOne({ where: { employee_id: userId } });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const form = await FormSubmission.findOne({
      where: {
        employee_id: employee.id,
        form_type: formType,
      },
      order: [["version", "DESC"]], // Get latest version
    });

    if (!form) {
      return res.json({ status: "NEW", data: {} });
    }

    res.json(form);
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Save/Submit Form
exports.submitForm = async (req, res) => {
  try {
    const { formType } = req.params;
    const { data, status } = req.body; // status: 'DRAFT' or 'SUBMITTED'
    const userId = req.user.id;

    const employee = await EmployeeMaster.findOne({ where: { employee_id: userId } });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let form = await FormSubmission.findOne({
      where: {
        employee_id: employee.id,
        form_type: formType,
        status: ["DRAFT", "REJECTED"], // Can overwrite draft or rejected
      },
      order: [["version", "DESC"]],
    });

    if (form) {
      // Update existing draft
      form.data = data;
      form.status = status;
      if (status === "SUBMITTED") {
        form.submitted_at = new Date();
      }
      await form.save();
    } else {
            const latestInfo = await FormSubmission.findOne({
             where: { employee_id: employee.id, form_type: formType },
             order: [['version', 'DESC']]
        });
        const nextVersion = latestInfo ? latestInfo.version + 1 : 1;

        form = await FormSubmission.create({
            employee_id: employee.id,
            form_type: formType,
            data: data,
            status: status,
            version: nextVersion,
            submitted_at: status === "SUBMITTED" ? new Date() : null
        });
    }

    res.json({ message: "Form saved", form });
  } catch (error) {
    console.error("Error saving form:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify Form (HR)
exports.verifyForm = async (req, res) => {
  try {
    const { id } = req.params; // FormSubmission ID
    const { status, rejectionReason } = req.body;
    const hrId = req.user.id; // User ID of HR

    const form = await FormSubmission.findByPk(id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    form.status = status;
    form.verified_by = hrId;
    form.verified_at = new Date();
    if (status === "REJECTED") {
      form.rejection_reason = rejectionReason;
    }

    await form.save();

    res.json({ message: `Form ${status}`, form });
  } catch (error) {
    console.error("Error verifying form:", error);
    res.status(500).json({ message: "Server error" });
  }
};
