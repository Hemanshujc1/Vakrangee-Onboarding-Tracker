import { useEffect, useMemo, useCallback, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { readOnlySchemas, createSignatureSchema, commonSchemas } from "../../utils/validations";
import { formatDateForAPI } from "../../utils/formUtils";
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
    isRef: isPreviewRef,
    } = useOnboardingForm();

  useEffect(() => {
    if (!employeeId) {
      navigate("/login");
    }
  }, [employeeId, navigate]);

  const isLocked = ["SUBMITTED", "VERIFIED"].includes(
    autoFillData?.mediclaimStatus
  );

  const hasSavedSignature = !!(
    autoFillData?.mediclaimData?.signature_path || autoFillData?.signature
  );

  useEffect(() => {
    if (isLocked) {
     navigate('/forms/mediclaim/preview', { state: { formData: autoFillData.mediclaimData } });
    }
  }, [isLocked, autoFillData, navigate]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        employee_full_name: readOnlySchemas.nameString.label("Full Name"),
        date_of_birth: readOnlySchemas.datePast,
        gender: readOnlySchemas.stringRequired,
        marital_status: readOnlySchemas.stringRequired,
        mobile_number: readOnlySchemas.mobile,
        address_line1: readOnlySchemas.addressString.label("Address Line 1"),
        address_line2: readOnlySchemas.addressStringOptional.label("Address Line 2"),
        landmark: readOnlySchemas.landmark,
        post_office: readOnlySchemas.stringRequired,
        city: readOnlySchemas.stringRequired,
        state: readOnlySchemas.stringRequired,
        pincode: readOnlySchemas.pincode,
        dependents: Yup.array().when("marital_status", {
          is: "Married",
          then: (schema) =>
            schema
              .min(1, "Please add at least one dependent (Spouse is mandatory).")
              .test(
                "has-spouse",
                "Spouse details are mandatory when Married",
                (value) => value && value.some((dep) => dep.relationship === "Spouse")
              )
              .of(
                Yup.object().shape({
                  name: commonSchemas.nameString.label("Name"),
                  relationship: commonSchemas.stringRequired,
                  age: commonSchemas.age.when("relationship", {
                    is: "Spouse",
                    then: (schema) => schema.min(18, "Spouse must be 18+").required("Required"),
                    otherwise: (schema) => schema.required("Required"),
                  }),
                  dob: commonSchemas.datePast.when("relationship", {
                    is: "Spouse",
                    then: (schema) => schema.max(
                      new Date(new Date().setFullYear(new Date().getFullYear() - 18)), 
                      "Spouse must be 18+"
                    ).required("DOB is required"),
                    otherwise: (schema) => schema.required("DOB is required"),
                  }),
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
    mode: "all",
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
    const allValues = { ...getValues(), ...values };

    if (allValues.isDraft) {
      try {
        const formData = new FormData();
        Object.keys(allValues).forEach((key) => {
          if (key === "dependents") {
            const dependents =
              allValues.marital_status === "Married" ? allValues.dependents : null;
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
            if (allValues.signature instanceof File) {
              formData.append("signature", allValues.signature);
            }
          } else if (key === "date_of_birth") {
            formData.append(key, formatDateForAPI(allValues[key]));
          } else {
            formData.append(key, allValues[key] || "");
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
            ...allValues,
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
    isSubmitting,
    onFormSubmit,
    showAlert,
    fields,
    append,
    remove,
    isPreviewRef,
    };
};

export default useFormMediclaim;
