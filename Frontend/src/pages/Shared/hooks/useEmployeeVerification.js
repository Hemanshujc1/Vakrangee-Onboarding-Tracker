import { useState } from "react";
import axios from "axios";
import { useAlert } from "../../../context/AlertContext";

export const useEmployeeVerification = (
  id,
  fetchEmployeeDetails,
  fetchDocuments,
  setEmailSent
) => {
  const [actionLoading, setActionLoading] = useState(false);
  const { showAlert, showConfirm, showPrompt } = useAlert();

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
      if (!reason) return;
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

  return {
    actionLoading,
    setActionLoading,
    handleVerificationAction,
    handleDocumentVerification,
    handleFinalVerify,
  };
};
