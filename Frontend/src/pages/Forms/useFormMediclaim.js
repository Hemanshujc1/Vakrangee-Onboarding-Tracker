import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  commonSchemas,
  createSignatureSchema,
  formatDateForAPI,
  onValidationFail,
} from "../../utils/formDependencies";
import useOnboardingForm from "../../hooks/useOnboardingForm";

const defaultValues = {
  employee_full_name: "",
  date_of_birth: "",
  gender: "",
  marital_status: "",
  mobile_number: "",
  address_line1: "",
  address_line2: "",
  landmark: "",
  post_office: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
  employee_code: "",
  dependents: [{ relationship: "Spouse", name: "", age: "", dob: "" }],
  signature: undefined,
  isDraft: false,
};

const useFormMediclaim = () => {
  const {
    navigate,
    showAlert,
    targetId: employeeId,
    autoFillData,
    autoFillLoading: loading,
    signaturePreview,
    setSignaturePreview,
  } = useOnboardingForm();

  // Redirect if no employeeId
  useEffect(() => {
    if (!employeeId) {
      navigate("/login");
    }
  }, [employeeId, navigate]);

  // Determine if form is locked (Submitted or Verified)
  const isLocked = ["SUBMITTED", "VERIFIED"].includes(
    autoFillData?.mediclaimStatus
  );

  // Determine if a signature is already saved on the server
  const hasSavedSignature = !!(
    autoFillData?.mediclaimData?.signature_path || autoFillData?.signature
  );

  // Redirect if locked (Optional)
  useEffect(() => {
    if (isLocked) {
     navigate('/forms/mediclaim/preview', { state: { formData: autoFillData.mediclaimData } });
    }
  }, [isLocked, autoFillData, navigate]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        employee_full_name: commonSchemas.nameString.label("Full Name"),
        date_of_birth: commonSchemas.dateRequired,
        gender: commonSchemas.stringRequired,
        marital_status: commonSchemas.stringRequired,
        mobile_number: commonSchemas.mobile,
        address_line1: commonSchemas.addressString.label("Address Line 1"),
        address_line2: commonSchemas.addressString.label("Address Line 2"),
        landmark: commonSchemas.landmark,
        post_office: commonSchemas.stringRequired,
        city: commonSchemas.stringRequired,
        state: commonSchemas.stringRequired,
        pincode: commonSchemas.pincode,
        dependents: Yup.array().when("marital_status", {
          is: "Married",
          then: (schema) =>
            schema.of(
              Yup.object().shape({
                name: commonSchemas.nameString.label("Name"),
                relationship: commonSchemas.stringRequired,
                age: commonSchemas.age.required("Required"),
                dob: commonSchemas.datePast.required("DOB is required"),
              })
            ),
          otherwise: (schema) => schema.notRequired().nullable(),
        }),
        signature: createSignatureSchema(hasSavedSignature),
      }),
    [hasSavedSignature]
  );

  const validationSchemaRef = useRef(validationSchema);
  useEffect(() => {
    validationSchemaRef.current = validationSchema;
  }, [validationSchema]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: useCallback(async (values, context, options) => {
      const resolver = yupResolver(validationSchemaRef.current);
      return resolver(values, context, options);
    }, []),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dependents",
  });

  // const maritalStatus = watch("marital_status");

  useEffect(() => {
    if (autoFillData) {
      const savedData = autoFillData.mediclaimData || {};
      const address = autoFillData.address || {};

      reset({
        employee_full_name:
          savedData.employee_full_name || autoFillData.fullName || "",
        date_of_birth:
          savedData.date_of_birth || autoFillData.dateOfBirth || "",
        gender: savedData.gender || autoFillData.gender || "",
        mobile_number: savedData.mobile_number || autoFillData.phone || "",
        employee_code:
          savedData.employee_code || autoFillData.employeeCode || "",

        address_line1: savedData.address_line1 || address.line1 || "",
        address_line2: savedData.address_line2 || address.line2 || "",
        landmark: savedData.landmark || address.landmark || "",
        post_office: savedData.post_office || address.post_office || "",
        city: savedData.city || address.city || "",
        district: savedData.district || address.district || "",
        state: savedData.state || address.state || "",

        pincode: savedData.pincode || address.pincode || "",

        marital_status: savedData.marital_status || "",
        dependents: savedData.dependents
          ? typeof savedData.dependents === "string"
            ? JSON.parse(savedData.dependents)
            : savedData.dependents
          : defaultValues.dependents,

        signature: undefined,
        isDraft: false,
      });

      const existingSignature =
        savedData.signature_path || autoFillData.signature;
      if (existingSignature) {
        setSignaturePreview(`/uploads/signatures/${existingSignature}`);
      }
    }
  }, [autoFillData, reset, setSignaturePreview]);

  const onFormSubmit = async (values) => {
    // If it's a draft, save via API immediately
    if (values.isDraft) {
      try {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (key === "dependents") {
            const dependents =
              values.marital_status === "Married" ? values.dependents : null;
            let formattedDependents = null;
            if (dependents && Array.isArray(dependents)) {
              formattedDependents = dependents.map((d) => ({
                ...d,
                dob: d.dob ? new Date(d.dob).toISOString().split("T")[0] : "",
              }));
            }
            formData.append(
              "dependents",
              JSON.stringify(formattedDependents || [])
            );
          } else if (key === "signature") {
            if (values.signature instanceof File) {
              formData.append("signature", values.signature);
            }
          } else if (key === "date_of_birth") {
            formData.append(key, formatDateForAPI(values[key]));
          } else {
            formData.append(key, values[key] || "");
          }
        });

        const token = localStorage.getItem("token");
        const response = await fetch("/api/forms/mediclaim", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (response.ok) {
          await showAlert("Draft Saved!", { type: "success" });
        } else {
          const errorData = await response.json().catch(() => ({}));
          await showAlert(
            `Error: ${errorData.message || response.statusText}`,
            { type: "error" }
          );
        }
      } catch (error) {
        console.error("Submission Error", error);
        await showAlert("Failed to connect to server.", { type: "error" });
      }
    } else {
      const savedData = autoFillData?.mediclaimData || {};
      navigate(`/forms/mediclaim/preview/${employeeId}`, {
        state: {
          formData: {
            ...values,
            signature_path: savedData.signature_path || autoFillData?.signature,
          },
          signaturePreview: signaturePreview,
          employeeId: employeeId,
          isHR: false,
          status: "DRAFT",
        },
      });
    }
  };

  return {
    autoFillData,
    loading,
    signaturePreview,
    setSignaturePreview,
    isLocked,
    hasSavedSignature,
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    trigger,
    errors,
    isSubmitting, // map formState.isSubmitting to isSubmitting
    onFormSubmit,
    showAlert,
    // Field Array refs
    fields,
    append,
    remove,
  };
};

export default useFormMediclaim;
