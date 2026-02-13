import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../context/AlertContext";

const useEmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert, showConfirm, showPrompt } = useAlert();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [hrAdmins, setHrAdmins] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [editForm, setEditForm] = useState({
    department: "",
    jobTitle: "",
    location: "",
    dateOfJoining: "",
    personalEmail: "",
    onboardingHrId: "",
  });

  useEffect(() => {
    fetchEmployeeDetails();
    fetchHrAdmins();
    fetchDocuments();
  }, [id]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`/api/documents/list/${id}`, config);
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchHrAdmins = async () => {
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
  };

  const fetchEmployeeDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 1. Fetch Basic Info
      const { data: empData } = await axios.get(`/api/employees/${id}`, config);

      // 2. Fetch Form Data (AutoFill) to get statuses and details
      const { data: formData } = await axios.get(
        `/api/forms/auto-fill/${id}`,
        config
      );

      // Merge Data
      setEmployee({ ...empData, ...formData });

      setEditForm({
        department: empData.department || "",
        jobTitle: empData.jobTitle || "",
        location: empData.location || "",
        dateOfJoining: empData.dateOfJoining || "",
        personalEmail: empData.personalEmail || "",
        onboardingHrId: empData.assignedHR?.id || "",
      });
    } catch (error) {
      console.error("Error fetching employee details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.put(`/api/employees/${id}`, editForm, config);

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

  const handleVerificationAction = async (status, reason = null) => {
    const isConfirmed = await showConfirm(
      `Are you sure you want to ${
        status === "VERIFIED" ? "verify" : "reject"
      } this profile?`,
      { type: status === "VERIFIED" ? "info" : "warning" }
    );
    if (!isConfirmed) return;

    if (status === "REJECTED" && !reason) {
      reason = await showPrompt(
        "Please provide a detailed reason for rejecting this profile:",
        {
          title: "Rejection Reason",
          type: "warning",
          placeholder:
            "Enter the reason for rejection (minimum 10 characters)...",
          confirmText: "Submit Rejection",
          cancelText: "Cancel",
        }
      );
      if (!reason) return; // Cancelled if no reason provided
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/employees/${id}/verify-basic-info`,
        {
          status,
          rejectionReason: reason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchEmployeeDetails();
      await showAlert(
        `Profile ${
          status === "VERIFIED" ? "verified" : "rejected"
        } successfully.`,
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
      `Are you sure you want to ${
        status === "VERIFIED" ? "verify" : "reject"
      } this document?`,
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
          placeholder:
            "Enter the reason for rejection (minimum 10 characters)...",
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
        {
          status,
          rejectionReason: reason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchDocuments();
      await showAlert(
        `Document ${
          status === "VERIFIED" ? "verified" : "rejected"
        } successfully.`,
        { type: "success" }
      );
    } catch (error) {
      console.error("Error verifying document:", error);
      await showAlert("Failed to update document status.", { type: "error" });
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
      `Are you sure you want to ${
        currentStatus ? "ENABLE" : "DISABLE"
      } this form for the employee?`,
      { type: "warning" }
    );
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const newStatus = !currentStatus; // Toggle

      await axios.put(
        `/api/employees/${id}/form-access`,
        {
          formKey: formType,
          disabled: newStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchEmployeeDetails(); // Refresh to get new status
      await showAlert(
        `Form access ${newStatus ? "DISABLED" : "ENABLED"} successfully.`,
        { type: "success" }
      );
    } catch (error) {
      console.error("Error toggling form access:", error);
      await showAlert("Failed to update form access.", { type: "error" });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (employee) {
      setEditForm({
        department: employee.department || "",
        jobTitle: employee.jobTitle || "",
        location: employee.location || "",
        dateOfJoining: employee.dateOfJoining || "",
        personalEmail: employee.personalEmail || "",
        onboardingHrId: employee.assignedHR?.id || "",
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
  };
};

export default useEmployeeDetail;
