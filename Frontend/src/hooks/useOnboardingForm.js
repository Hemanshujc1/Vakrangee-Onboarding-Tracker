import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useAutoFill from "../hooks/useAutoFill";
import { useAlert } from "../context/AlertContext";
import { getAuthUser } from "../utils/employeeUtils";

/**
 * Shared hook for Onboarding Forms to handle common logic:
 * - User/Employee ID resolution
 * - AutoFill data fetching
 * - Signature state management
 * - Form locking status
 * - Navigation/Alerts
 */
const useOnboardingForm = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useAlert();

  // 1. Resolve User & Target ID
  const user = getAuthUser();
  const targetId =
    employeeId ||
    user.employeeId ||
    (user.role === "EMPLOYEE" ? user.id : null);

  // 2. Fetch AutoFill Data
  const { data: autoFillData, loading: autoFillLoading } = useAutoFill(targetId);

  // 3. State Management
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  return {
    navigate,
    location,
    showAlert,
    user,
    targetId,
    autoFillData,
    autoFillLoading,
    signaturePreview,
    setSignaturePreview,
    isPreviewMode,
    setIsPreviewMode,
    isRef: useRef(false),
  };
};

export default useOnboardingForm;
