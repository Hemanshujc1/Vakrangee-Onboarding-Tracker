import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "axios";
import { readOnlySchemas, createSignatureSchema } from "../../utils/validations";
import useOnboardingForm from "../../hooks/useOnboardingForm";

const useFormNDA = () => {
  const {
    navigate,
    showAlert,
    targetId,
    autoFillData,
    loading,
    signaturePreview,
    setSignaturePreview,
    isRef: isPreviewRef,
  } = useOnboardingForm();

  const isLocked = ["SUBMITTED", "VERIFIED"].includes(autoFillData?.ndaStatus);
  const hasSavedSignature = !!(
    autoFillData?.ndaData?.signature_path || autoFillData?.signature
  );

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        isDraft: Yup.boolean(),
        employee_full_name: readOnlySchemas.nameString.label("Full Name"),
        address_line1: readOnlySchemas.addressString.label("Address Line 1"),
        address_line2:
          readOnlySchemas.addressStringOptional.label("Address Line 2"),
        post_office: readOnlySchemas.stringRequired.label("Post Office"),
        city: readOnlySchemas.stringRequired,
        district: readOnlySchemas.stringRequired,
        state: readOnlySchemas.stringRequired,
        pincode: readOnlySchemas.pincode,

        signature: Yup.mixed().when("isDraft", {
          is: true,
          then: () => Yup.mixed().nullable().optional(),
          otherwise: () => createSignatureSchema(hasSavedSignature),
        }),
      }),
    [hasSavedSignature],
  );

  useEffect(() => {
    if (isLocked && autoFillData) {
      navigate(`/forms/non-disclosure-agreement/preview/${targetId}`, {
        state: {
          formData: {
            ...autoFillData.ndaData,
            employee_full_name:
              autoFillData.ndaData?.employee_full_name || autoFillData.fullName,
            address_line1:
              autoFillData.ndaData?.address_line1 ||
              autoFillData.address?.line1,
            address_line2:
              autoFillData.ndaData?.address_line2 ||
              autoFillData.address?.line2,
            post_office:
              autoFillData.ndaData?.post_office ||
              autoFillData.address?.post_office,
            city: autoFillData.ndaData?.city || autoFillData.address?.city,
            district:
              autoFillData.ndaData?.district || autoFillData.address?.district,
            state: autoFillData.ndaData?.state || autoFillData.address?.state,
            pincode:
              autoFillData.ndaData?.pincode || autoFillData.address?.pincode,
          },
          signaturePreview: autoFillData.ndaData?.signature_path
            ? `/uploads/signatures/${autoFillData.ndaData.signature_path}`
            : null,
        },
      });
    }
  }, [isLocked, autoFillData, navigate, targetId]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "all",
    resolver: yupResolver(validationSchema),
    defaultValues: {
      employee_full_name: "",
      address_line1: "",
      address_line2: "",
      post_office: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      signature: undefined,
      isDraft: false,
    },
  });

  useEffect(() => {
    if (autoFillData) {
      const savedData = autoFillData.ndaData || {};
      const address = autoFillData.address || {};

      reset({
        employee_full_name:
          savedData.employee_full_name || autoFillData.fullName || "",
        address_line1: savedData.address_line1 || address.line1 || "",
        address_line2: savedData.address_line2 || address.line2 || "",
        landmark: savedData.landmark || address.landmark || "",
        post_office: savedData.post_office || address.post_office || "",
        city: savedData.city || address.city || "",
        district: savedData.district || address.district || "",
        state: savedData.state || address.state || "",
        pincode: savedData.pincode || address.pincode || "",
        signature: undefined,
        isDraft: false,
      });

      if (savedData.signature_path || autoFillData.signature) {
        setSignaturePreview(
          `/uploads/signatures/${
            savedData.signature_path || autoFillData.signature
          }`,
        );
      }
    }
  }, [autoFillData, reset, setSignaturePreview]);

  const onFormSubmit = async (values) => {

    const allValues = {
      ...getValues(),
      ...values,
    };

    if (isPreviewRef.current) {
      allValues.isDraft = true;
    }

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
          autoFillData?.ndaData?.signature_path || autoFillData?.signature;
        if (existingPath) formData.append("signature_path", existingPath);
      }

      const token = localStorage.getItem("token");
      await axios.post("/api/forms/nda", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (allValues.isDraft && !isPreviewRef.current) {
        await showAlert("Draft Saved!", { type: "success" });
      } else {

        const savedData = autoFillData?.ndaData || {};
        navigate(`/forms/non-disclosure-agreement/preview/${targetId}`, {
          state: {
            formData: {
              ...allValues,
              signature_path:
                savedData.signature_path || autoFillData?.signature,
            },
            employeeId: targetId,
            isHR: false,
            status: "DRAFT", // Still DRAFT until confirmed in preview
            fromPreviewSubmit: true,
          },
        });
      }
    } catch (error) {
      console.error("Submission Error", error);
      await showAlert(
        `Failed to submit: ${error.response?.data?.message || error.message}`,
        { type: "error" },
      );
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
    handleSubmit,
    setValue,
    getValues,
    errors,
    isSubmitting,
    onFormSubmit,
    showAlert,
    isPreviewRef,
  };
};

export default useFormNDA;
