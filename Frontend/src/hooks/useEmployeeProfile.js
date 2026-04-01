import { useState, useCallback } from "react";
import axios from "axios";

export const useEmployeeProfile = ({
  reset,
  setIsEditing,
  setPanVerified,
  setLastVerifiedPanData,
  handleUpload,
  panVerified,
  setMessage,
  showConfirm,
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
      const token = localStorage.getItem("token");
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
        const formatForDateInput = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const dob = formatForDateInput(record.date_of_birth);
        const doj = formatForDateInput(record.date_of_joining);

        reset({
          firstname: record.firstname || "",
          middlename: record.middlename || "",
          lastname: record.lastname || "",
          email: response.data.email || "",
          personal_email_id: record.personal_email_id || "",
          phone: record.phone || "",
          date_of_birth: dob,
          gender: record.gender || "",
          job_title: record.job_title || "",
          department_name: record.department_name || "",
          work_location: record.work_location || "",
          date_of_joining: doj,
          address_line1: record.address_line1 || "",
          address_line2: record.address_line2 || "",
          landmark: record.landmark || "",
          post_office: record.post_office || "",
          pincode: record.pincode || "",
          city: record.city || "",
          district: record.district || "",
          state: record.state || "",
          country: record.country || "India",
          tenth_percentage: record.tenth_percentage || "",
          twelfth_percentage: record.twelfth_percentage || "",
          degree_name: record.degree_name || "",
          degree_percentage: record.degree_percentage || "",
          adhar_number: record.adhar_number || "",
          pan_number: record.pan_number || "",
        });

        if (record.profile_photo) {
          setPreviewImage(`/uploads/profilepic/${record.profile_photo}`);
        }
        if (response.data.signature) {
          setPreviewSignature(`/uploads/signatures/${response.data.signature}`);
        }

        if (record.pan_verified) {
          setPanVerified(true);
          const currentDataString = `${record.pan_number}-${record.firstname}-${record.lastname}-${dob}`;
          setLastVerifiedPanData(currentDataString);
        }

        if (!record.firstname) {
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
      const token = localStorage.getItem("token");
      const formPayload = new FormData();

      Object.keys(data).forEach((key) => {
        let val = data[key];
        if (val instanceof Date && !isNaN(val.getTime())) {
          const year = val.getFullYear();
          const month = String(val.getMonth() + 1).padStart(2, "0");
          const day = String(val.getDate()).padStart(2, "0");
          val = `${year}-${month}-${day}`;
        }
        formPayload.append(key, val || "");
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
      const token = localStorage.getItem("token");
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
