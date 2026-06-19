const {
  User,
  EmployeeMaster,
  EmployeeRecord,
  EmployeeDocument,
  FormSubmission,
} = require("../models");
const logger = require("../utils/logger");
const fs = require("fs");
const path = require("path");
const sequelize = require("../config/database");

const getBasicInfo = (emp) => emp?.basic_info || {};
const getPersonalInfo = (rec) => rec?.personal_info || {};

const resolveVerifierName = async (verifierId) => {
  if (!verifierId) return null;

  // Try finding by employee_id string first (e.g. "EMP001")
  let user = await User.findOne({ where: { employee_id: verifierId } });

  // Fallback: if verifierId is a numeric DB id (legacy data stored req.user.id)
  if (!user && !isNaN(verifierId)) {
    user = await User.findByPk(Number(verifierId));
  }

  if (!user) return null;

  const empRecord = await EmployeeRecord.findOne({
    where: { employee_id: user.employee_id },
  });

  // Names are stored inside the personal_info JSON column
  const pi = getPersonalInfo(empRecord);
  if (pi.firstname) {
    return pi.firstname.trim();
  }

  // Last resort: extract readable name from email
  if (user.username && user.username.includes("@")) {
    const localPart = user.username.split("@")[0];
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }

  return user.username || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/profile
// Returns the full record with JSON groups (frontend hook maps them)
// ─────────────────────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const employeeMaster = await EmployeeMaster.findOne({
      where: { employee_id: user.employee_id },
      include: [{ model: EmployeeRecord }],
    });

    if (!employeeMaster) {
      return res.status(404).json({ message: "Employee record not found" });
    }

    const bi = getBasicInfo(employeeMaster);
    const verifiedByName = await resolveVerifierName(bi.basic_info_verified_by);

    res.json({
      id: employeeMaster.id,
      userId: employeeMaster.employee_id,
      employeeId: employeeMaster.employee_id || "",
      role: employeeMaster.role,
      email: employeeMaster.company_email_id,
      basic_info_status: bi.basic_info_status,
      basic_info_rejection_reason: bi.basic_info_rejection_reason,
      verifiedByName,
      signature: employeeMaster.EmployeeRecord?.signature || null,
      record: employeeMaster.EmployeeRecord || null,
    });
  } catch (error) {
    logger.error("Get Profile Error: %o", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/profile
// Accepts flat fields from frontend, maps them into JSON group columns
// ─────────────────────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // ── Personal Info ─────────────────────────────────────────────────────────
    const {
      firstname,
      middlename,
      lastname,
      date_of_birth,
      gender,
      adhar_number,
      pan_number,
      pan_verified,
      blood_group,
    } = req.body;

    // ── Contact Info ──────────────────────────────────────────────────────────
    const {
      personal_email_id,
      phone,
      emergency_contact_name,
      emergency_contact_relationship,
      emergency_contact_number,
    } = req.body;

    // ── Permanent Address ─────────────────────────────────────
    const {
      perm_address_line1,
      perm_address_line2,
      perm_landmark,
      perm_post_office,
      perm_pincode,
      perm_city,
      perm_district,
      perm_state,
      perm_country,
    } = req.body;

    // ── Communication Address ─────────────────────────────────
    const {
      comm_same_as_permanent,
      comm_address_line1,
      comm_address_line2,
      comm_landmark,
      comm_post_office,
      comm_pincode,
      comm_city,
      comm_district,
      comm_state,
      comm_country,
    } = req.body;

    // ── Academic Details ──────────────────────────────────────────────────────
    const {
      tenth_percentage,
      twelfth_percentage,
      degree_name,
      degree_percentage,
    } = req.body;

    // ── Job Info ─
    const { department_name, job_title, work_location } = req.body;

    // Helper utilities
    const cleanDate = (date) => {
      if (!date || date === "") return null;
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      return d.toISOString().split("T")[0];
    };
    const cleanNumber = (num) =>
      num === "" || num === null || num === undefined ? null : Number(num);
    const cleanBool = (val) => val === true || val === "true";

    // ── Find EmployeeMaster ────────────────────────────────────────────────────
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const employeeMaster = await EmployeeMaster.findOne({
      where: { employee_id: user.employee_id },
    });
    if (!employeeMaster) {
      return res.status(404).json({ message: "Employee master not found" });
    }

    // ── Lock Checks ───────────────────────────────────────────────────────────
    const bi = getBasicInfo(employeeMaster);
    if (bi.basic_info_status === "SUBMITTED") {
      return res.status(403).json({
        message: "Profile is locked for verification. Updates not allowed.",
        status: bi.basic_info_status,
      });
    }

    if (bi.basic_info_status === "VERIFIED") {
      const pendingDocsCount = await EmployeeDocument.count({
        where: {
          employee_id: employeeMaster.employee_id,
          status: ["REJECTED", "UPLOADED"],
        },
      });
      if (pendingDocsCount === 0 && bi.final_verification_email_sent) {
        return res.status(403).json({
          message: "Profile is verified and locked. Updates not allowed.",
          status: bi.basic_info_status,
        });
      }
    }

    const personalInfoData = {
      firstname: firstname || null,
      middlename: middlename || null,
      lastname: lastname || null,
      date_of_birth: cleanDate(date_of_birth),
      gender: gender || null,
      adhar_number: adhar_number || null,
      pan_number: pan_number || null,
      pan_verified: cleanBool(pan_verified),
      blood_group: blood_group || null,
    };

    const contactInfoData = {
      personal_email_id: personal_email_id || null,
      phone: phone || null,
      emergency_contact_name: emergency_contact_name || null,
      emergency_contact_relationship: emergency_contact_relationship || null,
      emergency_contact_number: emergency_contact_number || null,
    };

    const permAddr = {
      address_type: "Permanent",
      address_line1: perm_address_line1 || null,
      address_line2: perm_address_line2 || null,
      landmark: perm_landmark || null,
      post_office: perm_post_office || null,
      pincode: perm_pincode || null,
      city: perm_city || null,
      district: perm_district || null,
      state: perm_state || null,
      country: perm_country || "India",
      is_same_as_permanent: false,
    };

    const isSameAsPermanent = cleanBool(comm_same_as_permanent);
    let commAddr;
    if (isSameAsPermanent) {
      commAddr = {
        ...permAddr,
        address_type: "Communication Address",
        is_same_as_permanent: true,
      };
    } else {
      commAddr = {
        address_type: "Communication Address",
        address_line1: comm_address_line1 || null,
        address_line2: comm_address_line2 || null,
        landmark: comm_landmark || null,
        post_office: comm_post_office || null,
        pincode: comm_pincode || null,
        city: comm_city || null,
        district: comm_district || null,
        state: comm_state || null,
        country: comm_country || "India",
        is_same_as_permanent: false,
      };
    }

    const addressInfoData = [permAddr, commAddr];

    const academicDetailsData = {
      tenth_percentage: cleanNumber(tenth_percentage),
      twelfth_percentage: cleanNumber(twelfth_percentage),
      degree_name: degree_name || null,
      degree_percentage: cleanNumber(degree_percentage),
    };

    let resolvedWorkLocation = undefined;
    if (work_location) {
      if (typeof work_location === "object") {
        resolvedWorkLocation = work_location;
      } else {
        try {
          resolvedWorkLocation = JSON.parse(work_location);
        } catch {
          resolvedWorkLocation = {
            state: null,
            district: null,
            city: work_location,
          };
        }
      }
    }

    const profile_photo_file = req.body.profile_photo;
    const signature_file = req.body.signature_path;

    let [record, created] = await EmployeeRecord.findOrCreate({
      where: { employee_id: employeeMaster.employee_id },
      defaults: {
        personal_info: personalInfoData,
        contact_info: contactInfoData,
        address_info: addressInfoData,
        academic_details: academicDetailsData,
        work_location: resolvedWorkLocation || null,
        profile_photo: profile_photo_file || null,
        signature: signature_file || null,
      },
    });

    if (!created) {
      const existingJobInfo = record.job_info || {};
      const jobInfoUpdate =
        department_name || job_title
          ? {
              ...existingJobInfo,
              department_name:
                department_name || existingJobInfo.department_name,
              job_title: job_title || existingJobInfo.job_title,
            }
          : existingJobInfo;

      const updatePayload = {
        personal_info: personalInfoData,
        contact_info: contactInfoData,
        address_info: addressInfoData,
        academic_details: academicDetailsData,
        job_info: jobInfoUpdate,
      };

      if (resolvedWorkLocation !== undefined) {
        updatePayload.work_location = resolvedWorkLocation;
      }

      if (profile_photo_file) {
        if (record.profile_photo) {
          const oldPhotoPath = path.join(
            __dirname,
            "..",
            "uploads",
            "profilepic",
            record.profile_photo,
          );
          if (fs.existsSync(oldPhotoPath)) {
            try {
              fs.unlinkSync(oldPhotoPath);
            } catch (err) {
              logger.warn("Error deleting old profile photo: %o", err);
            }
          }
        }
        updatePayload.profile_photo = profile_photo_file;

        const [photoDoc] = await EmployeeDocument.findOrCreate({
          where: {
            employee_id: employeeMaster.employee_id,
            document_type: "Passport Size Photo",
          },
          defaults: { file_path: profile_photo_file, status: "UPLOADED" },
        });
        if (!photoDoc.isNewRecord) {
          await photoDoc.update({
            file_path: profile_photo_file,
            status: "UPLOADED",
            uploaded_at: new Date(),
          });
        }
      }

      if (signature_file) {
        if (record.signature) {
          const oldSigPath = path.join(
            __dirname,
            "..",
            "uploads",
            "signatures",
            record.signature,
          );
          if (fs.existsSync(oldSigPath)) {
            try {
              fs.unlinkSync(oldSigPath);
            } catch (err) {
              logger.warn("Error deleting old signature: %o", err);
            }
          }
        }
        updatePayload.signature = signature_file;

        const [sigDoc] = await EmployeeDocument.findOrCreate({
          where: {
            employee_id: employeeMaster.employee_id,
            document_type: "Signature",
          },
          defaults: { file_path: signature_file, status: "UPLOADED" },
        });
        if (!sigDoc.isNewRecord) {
          await sigDoc.update({
            file_path: signature_file,
            status: "UPLOADED",
            uploaded_at: new Date(),
          });
        }
      }

      await record.update(updatePayload);
    } else {
      if (profile_photo_file) {
        await EmployeeDocument.create({
          employee_id: employeeMaster.employee_id,
          document_type: "Passport Size Photo",
          file_path: profile_photo_file,
          status: "UPLOADED",
        });
      }
      if (signature_file) {
        await EmployeeDocument.create({
          employee_id: employeeMaster.employee_id,
          document_type: "Signature",
          file_path: signature_file,
          status: "UPLOADED",
        });
      }
    }
    const { email, employee_id } = req.body;

    if (employee_id && employee_id !== employeeMaster.employee_id) {
      // Check if new employee_id is taken
      const existing = await EmployeeMaster.findOne({ where: { employee_id } });
      if (existing) {
        return res.status(400).json({ message: "Employee ID is already in use by another account." });
      }
      
      const oldEmployeeId = employeeMaster.employee_id;

      // Temporarily disable foreign key checks to update the primary referenced field
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      try {
        // Update references to the old employee_id
        await User.update({ employee_id }, { where: { employee_id: oldEmployeeId } });
        await EmployeeMaster.update({ employee_id }, { where: { employee_id: oldEmployeeId } });
        await EmployeeRecord.update({ employee_id }, { where: { employee_id: oldEmployeeId } });
        await EmployeeDocument.update({ employee_id }, { where: { employee_id: oldEmployeeId } });
        await FormSubmission.update({ employee_id }, { where: { employee_id: oldEmployeeId } });
        
        // Update any employees assigned to this HR
        await EmployeeRecord.update(
          { onboarding_hr_id: employee_id },
          { where: { onboarding_hr_id: oldEmployeeId } }
        );

        // Update any forms verified by this HR
        await FormSubmission.update(
          { verified_by: employee_id },
          { where: { verified_by: oldEmployeeId } }
        );

        // Update any documents verified by this HR
        await EmployeeDocument.update(
          { verified_by: employee_id },
          { where: { verified_by: oldEmployeeId } }
        );

        // Update basic_info_verified_by inside the JSON column of EmployeeMaster
        // (raw SQL is needed since it's a JSON field, not a flat column)
        await sequelize.query(
          `UPDATE employee_master
           SET basic_info = JSON_SET(basic_info, '$.basic_info_verified_by', :newId)
           WHERE JSON_UNQUOTE(JSON_EXTRACT(basic_info, '$.basic_info_verified_by')) = :oldId`,
          { replacements: { newId: employee_id, oldId: oldEmployeeId } }
        );
      } finally {
        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      }
      
      employeeMaster.employee_id = employee_id;
    }

    if (email) {
      employeeMaster.company_email_id = email;
      await User.update({ username: email }, { where: { id: userId } });
    }

    await employeeMaster.save();


    // Reload for response
    await record.reload();
    res.json({ message: "Profile updated successfully", record });
  } catch (error) {
    logger.error("Update Profile Error: %o", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};
