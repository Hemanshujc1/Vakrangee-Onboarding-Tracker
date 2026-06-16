import { useState, useCallback } from "react";
import axios from "axios";
import { getAuthToken } from "../utils/employeeUtils";
import { formatForDateInput } from "../utils/basicInfoHelpers";

export const useEmployeeProfile = ({
  reset,
  setIsEditing,
  setPanVerified,
  setLastVerifiedPanData,
  handleUpload,
  panVerified,
  setMessage,
  showConfirm,
  setWorkLocation,
}) => {
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSavedData, setLastSavedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [verificationStatus, setVerificationStatus] = useState("PENDING");
  const [rejectionReason, setRejectionReason] = useState(null);
  const [verifiedByName, setVerifiedByName] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewSignature, setPreviewSignature] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        record,
        basic_info_status,
        basic_info_rejection_reason,
        verifiedByName: vName,
      } = response.data;

      setVerificationStatus(basic_info_status || "PENDING");
      setRejectionReason(basic_info_rejection_reason);
      setVerifiedByName(vName);

      if (record) {
        const pi = record.personal_info || {};
        const ci = record.contact_info || {};
        const ji = record.job_info || {};
        const acad = record.academic_details || {};
        const addressInfo = record.address_info || [];
        const perm = addressInfo[0] || {};   
        const comm = addressInfo[1] || {};  

        const dob = formatForDateInput(pi.date_of_birth);
        const doj = formatForDateInput(ji.date_of_joining);

        reset({
          employeeId: response.data.employeeId || ji.employee_id || "",
          // ── Personal Info ────────────────────────────────────────────────
          firstname: pi.firstname || "",
          middlename: pi.middlename || "",
          lastname: pi.lastname || "",
          date_of_birth: dob,
          gender: pi.gender || "",
          adhar_number: pi.adhar_number || "",
          pan_number: pi.pan_number || "",
          blood_group: pi.blood_group || "",

          // ── Contact Info ─────────────────────────────────────────────────
          email: response.data.email || "",
          personal_email_id: ci.personal_email_id || "",
          phone: ci.phone || "",
          emergency_contact_name: ci.emergency_contact_name || "",
          emergency_contact_relationship: ci.emergency_contact_relationship || "",
          emergency_contact_number: ci.emergency_contact_number || "",

          // ── Job Info (read-only) ─────────────────────────────────────────
          job_title: ji.job_title || "",
          department_name: ji.department_name || "",
          date_of_joining: doj,

          // ── Permanent Address (perm_ prefix) ──────────────────────────────
          perm_address_line1: perm.address_line1 || "",
          perm_address_line2: perm.address_line2 || "",
          perm_landmark: perm.landmark || "",
          perm_post_office: perm.post_office || "",
          perm_pincode: perm.pincode || "",
          perm_city: perm.city || "",
          perm_district: perm.district || "",
          perm_state: perm.state || "",
          perm_country: perm.country || "India",

          // ── Communication Address (comm_ prefix) ──────────────────────────
          comm_same_as_permanent: comm.is_same_as_permanent || false,
          comm_address_line1: comm.address_line1 || "",
          comm_address_line2: comm.address_line2 || "",
          comm_landmark: comm.landmark || "",
          comm_post_office: comm.post_office || "",
          comm_pincode: comm.pincode || "",
          comm_city: comm.city || "",
          comm_district: comm.district || "",
          comm_state: comm.state || "",
          comm_country: comm.country || "India",

          // ── Academic Details ─────────────────────────────────────────────
          tenth_percentage: acad.tenth_percentage ?? "",
          twelfth_percentage: acad.twelfth_percentage ?? "",
          degree_name: acad.degree_name || "",
          degree_percentage: acad.degree_percentage ?? "",
        });

        // Work location (passed outside form to parent for display)
        if (setWorkLocation) {
          setWorkLocation(record.work_location || null);
        }

        // Profile Photo
        if (record.profile_photo) {
          setPreviewImage(`/uploads/profilepic/${record.profile_photo}`);
        }
        // Signature (also at top level of response)
        if (response.data.signature) {
          setPreviewSignature(`/uploads/signatures/${response.data.signature}`);
        }

        // PAN verification state
        if (pi.pan_verified) {
          setPanVerified(true);
          const currentDataString = `${pi.pan_number}-${pi.firstname}-${pi.lastname}-${dob}`;
          setLastVerifiedPanData(currentDataString);
        }

        // Auto-open edit mode if profile is empty
        if (!pi.firstname) {
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ type: "error", text: "Failed to load profile data." });
    } finally {
      setLoading(false);
    }
  }, [reset, setPanVerified, setLastVerifiedPanData, setIsEditing, setMessage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
      handleUpload(file, "Passport Size Photo");
    }
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignatureFile(file);
      setPreviewSignature(URL.createObjectURL(file));
      handleUpload(file, "Signature");
    }
  };

  const onSubmit = async (data, isAutoSaveIndicator = false) => {
    const isAutoSave = isAutoSaveIndicator === true;

    if (isAutoSave) setAutoSaving(true);
    else setSaving(true);

    setMessage({ type: "", text: "" });

    try {
      const token = getAuthToken();
      const formPayload = new FormData();

      // Append all form fields (perm_* and comm_* prefixed address fields)
      Object.keys(data).forEach((key) => {
        let val = data[key];
        if (val instanceof Date) {
          val = formatForDateInput(val);
        }
        // Convert booleans to string for FormData
        if (typeof val === "boolean") {
          val = val.toString();
        }
        formPayload.append(key, val ?? "");
      });

      formPayload.append("pan_verified", panVerified.toString());

      if (imageFile) {
        formPayload.append("profile_photo", imageFile);
      }
      if (signatureFile) {
        formPayload.append("signature", signatureFile);
      }

      await axios.put("/api/profile", formPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (!isAutoSave) {
        setMessage({
          type: "success",
          text: "Information updated successfully!",
        });
        setIsEditing(false);
      }
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      if (!isAutoSave) {
        setMessage({
          type: "error",
          text: "Failed to update information. Please try again.",
        });
      }
    } finally {
      if (isAutoSave) setAutoSaving(false);
      else setSaving(false);
    }
  };

  const handleSubmitForVerification = async () => {
    const isConfirmed = await showConfirm(
      "Are you sure you want to submit your profile? You won't be able to edit it afterwards until verified."
    );
    if (!isConfirmed) return;

    setSubmitting(true);
    try {
      const token = getAuthToken();
      await axios.post(
        "/api/employees/submit-basic-info",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setVerificationStatus("SUBMITTED");
      setMessage({
        type: "success",
        text: "Profile submitted successfully for HR verification.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error submitting profile:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to submit profile.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    autoSaving,
    lastSavedData,
    setLastSavedData,
    loading,
    saving,
    submitting,
    verificationStatus,
    rejectionReason,
    verifiedByName,
    previewImage,
    previewSignature,
    fetchProfile,
    handleImageChange,
    handleSignatureChange,
    onSubmit,
    handleSubmitForVerification,
  };
};
