import { useParams, useNavigate } from "react-router-dom";
import { useEmployeeFetch } from "./hooks/useEmployeeFetch";
import { useEmployeeVerification } from "./hooks/useEmployeeVerification";
import { useEmployeeActions } from "./hooks/useEmployeeActions";
import {
  isBasicInfoComplete,
  isEverythingReviewed,
  isEverythingVerified,
} from "./hooks/employeeComputedLogic";

const useEmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Fetching Logic
  const {
    employee,
    loading,
    hrAdmins,
    documents,
    emailSent,
    setEmailSent,
    editForm,
    setEditForm,
    departmentsList,
    designationsList,
    loadingDropdowns,
    fetchEmployeeDetails,
    fetchDocuments,
  } = useEmployeeFetch(id);

  // 2. Verification Logic
  const {
    actionLoading,
    setActionLoading,
    handleVerificationAction,
    handleDocumentVerification,
    handleFinalVerify,
  } = useEmployeeVerification(
    id,
    fetchEmployeeDetails,
    fetchDocuments,
    setEmailSent
  );

  // 3. Actions Logic
  const {
    isEditing,
    setIsEditing,
    handleSave: baseHandleSave,
    handleAdvanceStage: baseHandleAdvanceStage,
    handleToggleFormAccess,
  } = useEmployeeActions(id, fetchEmployeeDetails);

  // Wrap actions to inject actionLoading state dependency
  const handleSave = () => baseHandleSave(editForm, setActionLoading);
  const handleAdvanceStage = (stage) => baseHandleAdvanceStage(stage, setActionLoading);

  // 4. Input Handlers
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
