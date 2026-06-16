import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAlert } from "../../../context/AlertContext";
import { useDocumentManager } from "../../../hooks/useDocumentManager";
import { usePanVerification } from "../../../hooks/usePanVerification";
import { useEmployeeProfile } from "../../../hooks/useEmployeeProfile";
import {
  basicInfoValidationSchema,
  defaultBasicInfoValues,
  fieldToSectionMap,
} from "../BasicInfo/basicInfoSchema";
import { getSectionStatus, isProfileComplete } from "../../../utils/basicInfoHelpers";

export const useBasicInformation = () => {
  const [expandedSection, setExpandedSection] = useState("identity");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [workLocation, setWorkLocation] = useState(null);
  const { showConfirm, showAlert } = useAlert();

  const {
    documents,
    uploadingState,
    fetchDocuments,
    handleUpload,
    handleDelete,
    getDocStatus,
  } = useDocumentManager(showAlert, showConfirm);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(basicInfoValidationSchema),
    defaultValues: defaultBasicInfoValues,
    mode: "all",
  });

  const formData = watch();

  const {
    panVerifying,
    panVerified,
    setPanVerified,
    panVerificationFailed,
    panFormatError,
    setLastVerifiedPanData,
  } = usePanVerification(formData, setValue, trigger, showAlert, isEditing);

  const {
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
  } = useEmployeeProfile({
    reset,
    setIsEditing,
    setPanVerified,
    setLastVerifiedPanData,
    handleUpload,
    panVerified,
    setMessage,
    showConfirm,
    setWorkLocation,
  });

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
  }, [fetchProfile, fetchDocuments]);

  const handleToggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const effectiveBasicInfoLocked =
    verificationStatus === "SUBMITTED" || verificationStatus === "VERIFIED";

  // Auto-save logic
  useEffect(() => {
    if (!isEditing || effectiveBasicInfoLocked) return;

    const delayDebounceFn = setTimeout(() => {
      const currentData = JSON.stringify(formData);
      if (lastSavedData !== currentData && lastSavedData !== null) {
        onSubmit(formData, true);
        setLastSavedData(currentData);
      } else if (lastSavedData === null) {
        setLastSavedData(currentData);
      }
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [
    formData,
    isEditing,
    effectiveBasicInfoLocked,
    lastSavedData,
    onSubmit,
    setLastSavedData,
  ]);

  const onError = (errors) => {
    console.error("Form Validation Errors:", errors);
    setMessage({
      type: "error",
      text: "Please fix the validation errors highlighting in red before saving.",
    });

    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const sectionToExpand = fieldToSectionMap[firstErrorField];
      if (sectionToExpand) {
        setExpandedSection(sectionToExpand);

        setTimeout(() => {
          const inputElement = document.querySelector(
            `[name="${firstErrorField}"]`
          );
          if (inputElement) {
            inputElement.focus({ preventScroll: true });
            const yOffset = -150;
            const y =
              inputElement.getBoundingClientRect().top +
              window.scrollY +
              yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
          } else {
            const sectionEl = document.getElementById(sectionToExpand);
            if (sectionEl) {
              const yOffset = -100;
              const y =
                sectionEl.getBoundingClientRect().top +
                window.scrollY +
                yOffset;
              window.scrollTo({ top: y, behavior: "smooth" });
            }
          }
        }, 300);
      }
    }
  };

  const fullAddress = [
    formData.perm_address_line1,
    formData.perm_address_line2,
    formData.perm_landmark,
    formData.perm_post_office && formData.perm_district
      ? `${formData.perm_post_office}, ${formData.perm_district}`
      : formData.perm_post_office || formData.perm_district,
    formData.perm_city && formData.perm_pincode
      ? `${formData.perm_city} - ${formData.perm_pincode}`
      : formData.perm_city || formData.perm_pincode,
    formData.perm_state && formData.perm_country
      ? `${formData.perm_state}, ${formData.perm_country}`
      : formData.perm_state || formData.perm_country,
  ]
    .filter(Boolean)
    .join(", ");

  const _getSectionStatus = (id) =>
    getSectionStatus(id, { formData, getDocStatus, panVerified });

  const isComplete = isProfileComplete({
    formData,
    documents,
    previewImage,
    previewSignature,
    panVerified,
  });

  return {
    expandedSection,
    isEditing,
    setIsEditing,
    message,
    workLocation,
    loading,
    saving,
    submitting,
    verificationStatus,
    rejectionReason,
    verifiedByName,
    documents,
    uploadingState,
    handleUpload,
    handleDelete,
    getDocStatus,
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    clearErrors,
    errors,
    formData,
    panVerifying,
    panVerified,
    panVerificationFailed,
    panFormatError,
    autoSaving,
    previewImage,
    previewSignature,
    handleImageChange,
    handleSignatureChange,
    onSubmit,
    handleSubmitForVerification,
    handleToggleSection,
    effectiveBasicInfoLocked,
    onError,
    fullAddress,
    _getSectionStatus,
    isComplete,
    fetchProfile,
    showAlert,
  };
};
