import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  onValidationFail,
  formatDateForAPI,
} from "../../utils/formDependencies";
import {
  getValidationSchema,
  defaultValues,
} from "./ApplicationSections/formApplicationSchema";
import useOnboardingForm from "../../hooks/useOnboardingForm";

const useFormApplication = () => {
  const {
    navigate,
    showAlert,
    user,
    targetId: employeeId,
    autoFillData,
    autoFillLoading,
    signaturePreview,
    setSignaturePreview,
    isPreviewMode,
    setIsPreviewMode,
  } = useOnboardingForm();

  // Redirect if no employeeId (already handled partially in shared hook via user check, but here specifically)
  useEffect(() => {
    if (!employeeId) navigate("/login");
  }, [employeeId, navigate]);

  const isLocked = ["SUBMITTED", "VERIFIED"].includes(
    autoFillData?.applicationStatus
  );
  const hasSavedSignature = !!(
    autoFillData?.applicationData?.signature_path || autoFillData?.signature
  );

  const validationSchema = getValidationSchema(hasSavedSignature);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "all",
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  // Field Arrays
  const {
    fields: educationFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control, name: "education" });
  const {
    fields: trainingFields,
    append: appendTraining,
    remove: removeTraining,
  } = useFieldArray({ control, name: "otherTraining" });
  const {
    fields: achievementFields,
    append: appendAchievement,
    remove: removeAchievement,
  } = useFieldArray({ control, name: "achievements" });
  const {
    fields: familyFields,
    append: appendFamily,
    remove: removeFamily,
  } = useFieldArray({ control, name: "family" });
  const {
    fields: languageFields,
    append: appendLang,
    remove: removeLang,
  } = useFieldArray({ control, name: "languages" });
  const {
    fields: historyFields,
    append: appendHistory,
    remove: removeHistory,
  } = useFieldArray({ control, name: "employmentHistory" });
  const {
    fields: referenceFields,
    append: appendRef,
    remove: removeRef,
  } = useFieldArray({ control, name: "references" });

  useEffect(() => {
    if (autoFillData) {
      const saved = autoFillData.applicationData || {};
      reset({
        firstname: saved.firstname || autoFillData.firstname || "",
        lastname: saved.lastname || autoFillData.lastname || "",
        middlename: saved.middlename || autoFillData.middlename || "",
        Maidenname: saved.Maidenname || "",

        currentAddress:
          saved.currentAddress || autoFillData.currentAddress || "",
        permanentAddress:
          saved.permanentAddress || autoFillData.permanentAddress || "",
        mobileNo:
          saved.mobileNo || autoFillData.mobileNo || autoFillData.phone || "",
        email: saved.email || autoFillData.email || "",
        dob: saved.dob || autoFillData.dateOfBirth || autoFillData.dob || "",
        gender: saved.gender || autoFillData.gender || "",
        age: saved.age || autoFillData.age || "",
        positionApplied:
          saved.positionApplied || autoFillData.positionApplied || "",
        panNo: saved.panNo || autoFillData.panNo || "",
        hasPan: saved.hasPan || autoFillData.hasPan || "No",
        passportNo: saved.passportNo || autoFillData.passportNo || "",
        hasPassport: saved.hasPassport || autoFillData.hasPassport || "No",
        emergencyNo:
          saved.emergencyNo || autoFillData.emergencyNo || "",
        ...saved,

        // Ensure arrays have at least one row if empty and required
        education: saved.education?.length
          ? saved.education
          : autoFillData.education?.length
          ? autoFillData.education
          : defaultValues.education,
        workExperience: saved.workExperience?.length
          ? saved.workExperience
          : defaultValues.workExperience,
        references: saved.references?.length
          ? saved.references
          : defaultValues.references,
      });

      if (saved.signature_path) {
        setSignaturePreview(`/uploads/signatures/${saved.signature_path}`);
      }
    }
  }, [autoFillData, reset, setSignaturePreview]);

  const onFormSubmit = async (values) => {
    const allValues = { ...getValues(), ...values };
    const dateFields = [
      "dob",
      "licenseIssueDate",
      "licenseExpiryDate",
      "passportIssueDate",
      "passportExpiryDate",
    ];
    dateFields.forEach((field) => {
      if (allValues[field]) allValues[field] = formatDateForAPI(allValues[field]);
    });
    if (allValues.employmentHistory && Array.isArray(allValues.employmentHistory)) {
      allValues.employmentHistory = allValues.employmentHistory.map((item) => ({
        ...item,
        fromDate: formatDateForAPI(item.fromDate),
        toDate: formatDateForAPI(item.toDate),
      }));
    }

    if (allValues.workExperience && Array.isArray(allValues.workExperience)) {
      allValues.workExperience = allValues.workExperience.map((item) => ({
        ...item,
        joiningDate: formatDateForAPI(item.joiningDate),
      }));
    }

    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();

      // Append basic fields
      Object.keys(allValues).forEach((key) => {
        if (Array.isArray(allValues[key])) {
          formData.append(key, JSON.stringify(allValues[key]));
        } else if (key === "signature") {
          if (allValues.signature instanceof File) {
            formData.append("signature", allValues.signature);
          }
        } else {
          formData.append(
            key,
            allValues[key] === null || allValues[key] === undefined ? "" : allValues[key]
          );
        }
      });

      const response = await fetch("/api/forms/application", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        if (allValues.isDraft) {
          const resData = await response.json();
          // If in Preview Mode, don't alert, just navigate
          if (isPreviewMode) {
            const savedData = autoFillData?.applicationData || {};
            navigate(`/forms/application/preview/${employeeId}`, {
              state: {
                formData: {
                  ...allValues,
                  signature_path:
                    savedData.signature_path || autoFillData?.signature,
                },
                signaturePreview: signaturePreview,
                employeeId: employeeId,
                isHR: false,
                fromPreviewSubmit: true, // Flag to enable submit button in preview
              },
            });
          } else {
            await showAlert(
              `Draft Saved Successfully! Status: ${resData.status}`,
              { type: "success" }
            );
          }
        } else {
          await showAlert("Form Submitted!", { type: "success" });
          const savedData = autoFillData?.applicationData || {};
          navigate(`/forms/application/preview/${employeeId}`, {
            state: {
              formData: {
                ...allValues,
                signature_path:
                  savedData.signature_path || autoFillData?.signature,
              },
              signaturePreview: signaturePreview,
              employeeId: employeeId,
              isHR: false,
            },
          });
        }
      } else {
        const err = await response.json();
        await showAlert(`Error: ${err.message || "Submission failed"}`, {
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      await showAlert("An error occurred during submission.", {
        type: "error",
      });
    } finally {
      setIsPreviewMode(false);
    }
  };

  return {
    autoFillData,
    loading: autoFillLoading,
    signaturePreview,
    setSignaturePreview,
    isLocked,
    hasSavedSignature,
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    errors,
    isSubmitting,
    educationFields,
    appendEdu,
    removeEdu,
    trainingFields,
    appendTraining,
    removeTraining,
    achievementFields,
    appendAchievement,
    removeAchievement,
    familyFields,
    appendFamily,
    removeFamily,
    languageFields,
    appendLang,
    removeLang,
    historyFields,
    appendHistory,
    removeHistory,
    referenceFields,
    appendRef,
    removeRef,
    onFormSubmit,
    onValidationFail,
    showAlert,
    setIsPreviewMode,
  };
};

export default useFormApplication;
