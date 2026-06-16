import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../context/AlertContext";
import { MANDATORY_DOC_KEYS } from "../../config/documentConfig";

// ---------------------------------------------------------------------------
// Pure computed helpers
// ---------------------------------------------------------------------------
const isBasicInfoComplete = (employee) => {
  if (!employee) return false;
  const mandatoryFields = [
    "firstName", "lastName", "personalEmail", "phone", "gender",
    "dateOfBirth", "adharNumber", "panNumber", "addressLine1",
    "city", "district", "state", "pincode", "postOffice",
  ];
  return mandatoryFields.every((field) => {
    const val = employee[field];
    return val !== null && val !== undefined && String(val).trim() !== "";
  });
};

const isEverythingReviewed = (employee, documents) => {
  if (!employee) return false;
  const isBasicInfoReviewed =
    employee.basicInfoStatus === "VERIFIED" || employee.basicInfoStatus === "REJECTED";
  const areAllDocumentsReviewed =
    documents.length > 0 &&
    documents.every(
      (doc) => doc.status !== "PENDING" && doc.status !== "UPLOADED" && doc.status !== "SUBMITTED"
    );
  return isBasicInfoReviewed && areAllDocumentsReviewed;
};

const isEverythingVerified = (employee, documents) => {
  if (!employee) return false;
  const isBasicInfoVerified = employee.basicInfoStatus === "VERIFIED";
  const verifiedDocs = documents.filter((doc) => doc.status === "VERIFIED");
  const areAllMandatoryDocsVerified = MANDATORY_DOC_KEYS.every((docType) =>
    verifiedDocs.some((d) => d.document_type === docType)
  );
  return isBasicInfoVerified && areAllMandatoryDocsVerified;
};

// ---------------------------------------------------------------------------
// Main hook
// ---------------------------------------------------------------------------
const useEmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert, showConfirm, showPrompt } = useAlert();

  // --- State ---
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hrAdmins, setHrAdmins] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [emailSent, setEmailSent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [designationsList, setDesignationsList] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const [editForm, setEditForm] = useState({
    department: "", department_id: "", jobTitle: "", designation_id: "",
    location: "", dateOfJoining: "", personalEmail: "", onboardingHrId: "",
    band_id: "", band_name: "", band_level_id: "", level_name: "",
  });

  // --- Fetch helpers ---
  const fetchDropdownData = useCallback(async () => {
    setLoadingDropdowns(true);
    try {
      const BASE_URL = "/vakrangee-onboarding-portal/vakrangee-connect/OnBoarding";
      const responses = await Promise.all([
        fetch(`${BASE_URL}/department-list`),
        fetch(`${BASE_URL}/designation-list`),
      ]);
      const [deptRes, desRes] = await Promise.all(responses.map((r) => r.json()));
      if (deptRes?.status) setDepartmentsList(deptRes.data);
      if (desRes?.status) setDesignationsList(desRes.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    } finally {
      setLoadingDropdowns(false);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`/api/documents/list/${id}`, config);
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }, [id]);

  const fetchEmployeeDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data: empData } = await axios.get(`/api/employees/${id}`, config);
      const { data: formData } = await axios.get(`/api/forms/auto-fill/${id}`, config);

      if (empData.finalVerificationEmailSent === true) setEmailSent(true);

      const permAddr = empData.permanent_address || {};
      const mappedAddressFields = {
        addressLine1: permAddr.address_line1 || "",
        addressLine2: permAddr.address_line2 || "",
        landmark: permAddr.landmark || "",
        postOffice: permAddr.post_office || "",
        city: permAddr.city || "",
        district: permAddr.district || "",
        state: permAddr.state || "",
        pincode: permAddr.pincode || "",
        country: permAddr.country || "India",
      };

      setEmployee({ ...empData, ...formData, ...mappedAddressFields });
      setEditForm({
        department: empData.department || "",
        department_id: empData.department_id || "",
        jobTitle: empData.jobTitle || "",
        designation_id: empData.designation_id || "",
        location: empData.location || "",
        dateOfJoining: empData.dateOfJoining || "",
        personalEmail: empData.personalEmail || "",
        onboardingHrId: empData.onboardingHrId || "",
        band_id: empData.band_id || "",
        band_name: empData.band_name || "",
        band_level_id: empData.band_level_id || "",
        level_name: empData.level_name || "",
      });
    } catch (error) {
      console.error("Error fetching employee details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchHrAdmins = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get("/api/employees", config);
      const hrs = data.filter(
        (emp) =>
          (emp.role === "HR_ADMIN" || emp.role === "HR_SUPER_ADMIN") &&
          emp.accountStatus === "ACTIVE"
      );
      setHrAdmins(hrs);
    } catch (error) {
      console.error("Error fetching HR admins:", error);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchEmployeeDetails();
      fetchHrAdmins();
      fetchDocuments();
      fetchDropdownData();
    }
  }, [id, fetchEmployeeDetails, fetchHrAdmins, fetchDocuments, fetchDropdownData]);

  // --- Actions ---
  const handleSave = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        ...editForm,
        department_id: editForm.department_id === "" ? null : editForm.department_id,
        designation_id: editForm.designation_id === "" ? null : editForm.designation_id,
        onboardingHrId: editForm.onboardingHrId === "" ? null : editForm.onboardingHrId,
        band_id: editForm.band_id === "" ? null : Number(editForm.band_id),
        band_level_id: editForm.band_level_id === "" ? null : Number(editForm.band_level_id),
        band_name: editForm.band_name || null,
        level_name: editForm.level_name || null,
      };
      await axios.put(`/api/employees/${id}`, payload, config);
      await fetchEmployeeDetails();
      setIsEditing(false);
      await showAlert("Details updated successfully!", { type: "success" });
    } catch (error) {
      console.error("Error updating details:", error);
      await showAlert("Failed to update details.", { type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdvanceStage = async (newStage) => {
    const isConfirmed = await showConfirm(
      `Are you sure you want to advance this employee to ${newStage}?`
    );
    if (!isConfirmed) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/employees/${id}/advance-stage`,
        { stage: newStage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchEmployeeDetails();
      await showAlert(`Stage advanced to ${newStage}`, { type: "success" });
    } catch (error) {
      console.error("Error advancing stage:", error);
      await showAlert("Failed to advance stage.", { type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFormAccess = async (formType, category, currentStatus) => {
    const isConfirmed = await showConfirm(
      `Are you sure you want to ${currentStatus ? "ENABLE" : "DISABLE"} this form for the employee?`,
      { type: "warning" }
    );
    if (!isConfirmed) return;
    try {
      const token = localStorage.getItem("token");
      const newStatus = !currentStatus;
      await axios.put(
        `/api/employees/${id}/form-access`,
        { formKey: formType, disabled: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchEmployeeDetails();
      await showAlert(
        `Form access ${newStatus ? "DISABLED" : "ENABLED"} successfully.`,
        { type: "success" }
      );
    } catch (error) {
      console.error("Error toggling form access:", error);
      await showAlert("Failed to update form access.", { type: "error" });
    }
  };

  // --- Verification ---
  const handleVerificationAction = async (status, reason = null) => {
    const isConfirmed = await showConfirm(
      `Are you sure you want to ${status === "VERIFIED" ? "verify" : "reject"} this profile?`,
      { type: status === "VERIFIED" ? "info" : "warning" }
    );
    if (!isConfirmed) return;

    if (status === "REJECTED" && !reason) {
      reason = await showPrompt(
        "Please provide a detailed reason for rejecting this profile:",
        {
          title: "Rejection Reason",
          type: "warning",
          placeholder: "Enter the reason for rejection (minimum 10 characters)...",
          confirmText: "Submit Rejection",
          cancelText: "Cancel",
        }
      );
      if (!reason) return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/employees/${id}/verify-basic-info`,
        { status, rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchEmployeeDetails();
      await showAlert(
        `Profile ${status === "VERIFIED" ? "verified" : "rejected"} successfully.`,
        { type: "success" }
      );
    } catch (error) {
      console.error("Error verifying profile:", error);
      await showAlert("Failed to update status.", { type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDocumentVerification = async (docId, status) => {
    const isConfirmed = await showConfirm(
      `Are you sure you want to ${status === "VERIFIED" ? "verify" : "reject"} this document?`,
      { type: status === "VERIFIED" ? "info" : "warning" }
    );
    if (!isConfirmed) return;

    let reason = null;
    if (status === "REJECTED") {
      reason = await showPrompt(
        "Please provide a detailed reason for rejecting this document:",
        {
          title: "Rejection Reason",
          type: "warning",
          placeholder: "Enter the reason for rejection (minimum 10 characters)...",
          confirmText: "Submit Rejection",
          cancelText: "Cancel",
        }
      );
      if (!reason) return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/documents/verify/${docId}`,
        { status, rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchDocuments();
      await showAlert(
        `Document ${status === "VERIFIED" ? "verified" : "rejected"} successfully.`,
        { type: "success" }
      );
    } catch (error) {
      console.error("Error verifying document:", error);
      await showAlert("Failed to update document status.", { type: "error" });
    } finally {
      setEmailSent(false);
    }
  };

  const handleFinalVerify = async () => {
    const isConfirmed = await showConfirm(
      "Are you sure you want to perform the final verification for this employee? This will send a summary email to the employee.",
      { type: "info" }
    );
    if (!isConfirmed) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `/api/employees/${id}/final-verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchEmployeeDetails();
      await fetchDocuments();
      await showAlert(
        `Final verification completed: ${data.isSuccess ? "Approved" : "Rejected"}`,
        { type: "success" }
      );
      setEmailSent(true);
    } catch (error) {
      console.error("Error in final verification:", error);
      await showAlert(
        error.response?.data?.message || "Failed to complete final verification.",
        { type: "error" }
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --- Input handlers ---
  const handleDeptChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      department: e.target.option.name,
      department_id: e.target.value,
    }));
  };

  const handleDesigChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      jobTitle: e.target.option.name,
      designation_id: e.target.value,
    }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (employee) {
      setEditForm({
        department: employee.department || "",
        department_id: employee.department_id || "",
        jobTitle: employee.jobTitle || "",
        designation_id: employee.designation_id || "",
        location: employee.location || "",
        dateOfJoining: employee.dateOfJoining || "",
        personalEmail: employee.personalEmail || "",
        onboardingHrId: employee.onboardingHrId || "",
        band_id: employee.band_id || "",
        band_name: employee.band_name || "",
        band_level_id: employee.band_level_id || "",
        level_name: employee.level_name || "",
      });
    }
  };

  return {
    navigate,
    employee,
    loading,
    isEditing,
    setIsEditing,
    actionLoading,
    hrAdmins,
    documents,
    editForm,
    setEditForm,
    handleSave,
    handleCancelEdit,
    handleVerificationAction,
    handleDocumentVerification,
    handleAdvanceStage,
    handleToggleFormAccess,
    handleFinalVerify,
    isEverythingReviewed: () => isEverythingReviewed(employee, documents),
    isEverythingVerified: () => isEverythingVerified(employee, documents),
    isBasicInfoComplete: () => isBasicInfoComplete(employee),
    emailSent,
    departmentsList,
    designationsList,
    loadingDropdowns,
    handleDeptChange,
    handleDesigChange,
  };
};

export default useEmployeeDetail;
