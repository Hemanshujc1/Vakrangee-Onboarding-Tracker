import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  yupResolver,
  Yup,
  axios,
  commonSchemas,
  createSignatureSchema,
} from "../../utils/formDependencies";
import useOnboardingForm from "../../hooks/useOnboardingForm";

const useFormDeclaration = () => {
  const {
    navigate,
    showAlert,
    user,
    targetId: employeeId,
    autoFillData,
    loading: autoFillLoading,
    signaturePreview,
    setSignaturePreview,
    isRef: isPreviewRef, // Use ref matching original logic
  } = useOnboardingForm();

  // Determine if form is locked
  const isLocked = ["SUBMITTED", "VERIFIED"].includes(
    autoFillData?.declarationStatus
  );

  const hasSavedSignature = !!(
    autoFillData?.declarationData?.signature_path || autoFillData?.signature
  );

  // Redirect if locked
  useEffect(() => {
    if (isLocked && autoFillData?.declarationData) {
      const savedData = autoFillData.declarationData;
      const signatureUrl = savedData.signature_path
        ? `/uploads/signatures/${savedData.signature_path}`
        : null;

      navigate(`/forms/declaration-form/preview/${employeeId}`, {
        state: {
          formData: savedData,
          signaturePreview: signatureUrl,
        },
      });
    }
  }, [isLocked, autoFillData, navigate, employeeId]);

  // Validation Schema
  const validationSchema = useMemo(
    () =>
      Yup.object({
        isDraft: Yup.boolean(),
        title: Yup.string().required("Required"),
        employee_full_name: commonSchemas.nameString.label("Full Name"),
        previous_company_name:
          commonSchemas.stringOptional.label("Company Name"),
        previous_job_title: commonSchemas.stringOptional.label("Designation"),
        current_job_title: commonSchemas.stringOptional.label(
          "Current Designation"
        ),
        signature: Yup.mixed().when("isDraft", {
          is: true,
          then: (schema) => Yup.mixed().nullable().optional(),
          otherwise: (schema) => createSignatureSchema(hasSavedSignature),
        }),
      }),
    [hasSavedSignature]
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: "Mr.",
      employee_full_name: "",
      employee_code: "",
      previous_company_name: "",
      previous_job_title: "",
      current_job_title: "",
      signature: undefined,
      isDraft: false,
    },
  });

  useEffect(() => {
    if (autoFillData) {
      const savedData = autoFillData.declarationData || {};

      reset({
        title:
          savedData.title || (autoFillData.gender === "Female" ? "Ms." : "Mr."),
        employee_full_name:
          savedData.employee_full_name || autoFillData.fullName || "",
        previous_company_name: savedData.previous_company_name || "",
        previous_job_title: savedData.previous_job_title || "",
        current_job_title:
          savedData.current_job_title || autoFillData.designation || "",
        signature: undefined,
        isDraft: false,
      });

      if (savedData.signature_path || autoFillData.signature) {
        setSignaturePreview(
          `/uploads/signatures/${
            savedData.signature_path || autoFillData.signature
          }`
        );
      }
    }
  }, [autoFillData, reset, setSignaturePreview]);

  const onFormSubmit = async (values) => {
    // Disabled fields are excluded from 'values', so fetch them manually
    const allValues = {
      ...values,
      employee_full_name: getValues("employee_full_name"),
      current_job_title: getValues("current_job_title"),
    };

    try {
      const formData = new FormData();

      Object.keys(allValues).forEach((key) => {
        if (key === "signature") {
          if (allValues.signature instanceof File) {
            formData.append("signature", allValues.signature);
          }
        } else if (key !== "signature_path") {
          formData.append(key, allValues[key] == null ? "" : allValues[key]);
        }
      });

      if (!allValues.signature && !allValues.isDraft) {
        const existingPath =
          autoFillData?.declarationData?.signature_path ||
          autoFillData?.signature;
        if (existingPath) formData.append("signature_path", existingPath);
      }

      const token = localStorage.getItem("token");
      await axios.post("/api/forms/declaration", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (allValues.isDraft && !isPreviewRef.current) {
        await showAlert("Draft Saved!", { type: "success" });
      } else {
        // Navigate to Preview
        const savedData = autoFillData?.declarationData || {};
        navigate(`/forms/declaration-form/preview/${employeeId}`, {
          state: {
            formData: {
              ...allValues,
              signature_path:
                savedData.signature_path || autoFillData?.signature,
            },
            signaturePreview: signaturePreview,
            employeeId: employeeId,
            isHR: false,
            status: "DRAFT", // Still Draft until confirmed
            fromPreviewSubmit: true,
          },
        });
      }
    } catch (error) {
      console.error("Submission Error", error);
      await showAlert(
        `Failed to submit: ${error.response?.data?.message || error.message}`,
        { type: "error" }
      );
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
    handleSubmit,
    setValue,
    errors,
    isSubmitting,
    onFormSubmit,
    showAlert,
    isPreviewRef,
  };
};

export default useFormDeclaration;
