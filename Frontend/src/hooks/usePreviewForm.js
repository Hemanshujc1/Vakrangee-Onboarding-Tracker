import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useAutoFill from "./useAutoFill";
import { useAlert } from "../context/AlertContext";
import { getAuthToken, getAuthUser } from "../utils/employeeUtils";

const usePreviewForm = ({ apiEndpoint, verifyEndpoint, dataKey, statusKey, reasonKey }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { employeeId: paramEmployeeId } = useParams();
  const { showAlert, showConfirm, showPrompt } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = getAuthUser();
  
  const {
    formData: stateData,
    signaturePreview: stateSig,
    status: stateStatus,
    isHR: stateIsHR,
    employeeId: stateEmployeeId,
    rejectionReason: stateRejectionReason,
  } = location.state || {};

  const targetId = paramEmployeeId || stateEmployeeId || user.employeeId;
  const isHR = stateIsHR || ["HR_ADMIN", "HR_SUPER_ADMIN"].includes(user.role);

  const { data: autoFillData, loading: autoFillLoading } = useAutoFill(targetId);

  const data = stateData || autoFillData?.[dataKey];
  const status = stateStatus || autoFillData?.[statusKey];
  const rejectionReason = stateRejectionReason || autoFillData?.[reasonKey];

  const handleVerification = async (newStatus) => {
    if (!targetId) return await showAlert("Missing Employee ID", { type: "error" });

    let reason = null;
    if (newStatus === "REJECTED") {
      reason = await showPrompt("Please provide a detailed reason for rejecting this form:", {
        title: "Rejection Reason",
        type: "warning",
        placeholder: "Enter the reason for rejection (minimum 10 characters)...",
        confirmText: "Submit Rejection",
        cancelText: "Cancel",
      });
      if (!reason) return;
    }

    const isConfirmed = await showConfirm(
      `Are you sure you want to ${newStatus === "VERIFIED" ? "approve" : "reject"} this form?`
    );
    if (!isConfirmed) return;

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      const url = verifyEndpoint ? `${verifyEndpoint}/${targetId}` : `${apiEndpoint}/verify/${targetId}`;
      await axios.post(
        url,
        { status: newStatus, remarks: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await showAlert(`Form ${newStatus === "VERIFIED" ? "Approved" : "Rejected"} Successfully!`, { type: "success" });
      navigate(-1);
    } catch (error) {
      console.error("Verification Error:", error);
      await showAlert("Failed to update status.", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    data,
    status,
    rejectionReason,
    isHR,
    targetId,
    autoFillLoading,
    isSubmitting,
    setIsSubmitting,
    stateSig,
    handleVerification,
    navigate,
    showAlert,
    showConfirm,
  };
};

export default usePreviewForm;
