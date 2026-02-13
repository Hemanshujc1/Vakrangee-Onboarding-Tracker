import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAutoFill, useAlert } from "../utils/formDependencies";

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
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const targetId =
    employeeId ||
    user.employeeId ||
    (user.role === "EMPLOYEE" ? user.id : null);

  // 2. Fetch AutoFill Data
  const { data: autoFillData, loading: autoFillLoading } = useAutoFill(targetId);

  // 3. State Management
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // 4. Derive Common Status
  // Note: Specific locking status key (e.g., epfStatus, tdsStatus) needs to be checked in the specific form hook
  // but we can provide helper to check it easily.
  
  // 5. Common Effects
  // (e.g., redirect if no access, though usually handled by ProtectedRoute)

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
    isRef: useRef(false), // To track preview mode ref across re-renders if needed
  };
};

export default useOnboardingForm;
