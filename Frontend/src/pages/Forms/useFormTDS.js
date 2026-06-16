import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "axios";
import { createSignatureSchema } from "../../utils/validations";
import useOnboardingForm from "../../hooks/useOnboardingForm";

const useFormTDS = () => {
  const {
    navigate,
    showAlert,
    targetId,
    autoFillData,
    autoFillLoading,
    signaturePreview,
    setSignaturePreview,
    isRef: isPreviewRef, 
  } = useOnboardingForm();
  const isLocked = ["SUBMITTED", "VERIFIED"].includes(autoFillData?.tdsStatus);
  const hasSavedSignature = !!(
    autoFillData?.tdsData?.signature_path || autoFillData?.signature
  );

  const validationSchema = useMemo(
    () =>
      Yup.object({
        isDraft: Yup.boolean(),
        tax_regime: Yup.string().required("Please select a tax regime"),
        pan_no: commonSchemas.pan,
        contact_no: commonSchemas.mobile,
        employee_name: commonSchemas.nameString.label("Employee Name"),
        job_title: commonSchemas.stringRequired,

        education_loan_amt: commonSchemas.currency,
        education_interest: commonSchemas.currency,
        housing_loan_principal: commonSchemas.currency,
        housing_loan_interest: commonSchemas.currency,
        nps_contribution: commonSchemas.currency,
        hra_rent_per_month: commonSchemas.currency,
        hra_months: Yup.number()
          .transform((value) => (isNaN(value) ? null : value))
          .nullable()
          .min(0, "Enter a Valid month")
          .max(12, "Enter the valid month"),
        medical_total_contribution: commonSchemas.currency,
        medical_self_family: commonSchemas.currency,
        medical_parents: commonSchemas.currency,
        medical_senior_parents: commonSchemas.currency,
        life_insurance_premium: commonSchemas.currency,
        ssy_contribution: commonSchemas.currency,
        ppf_contribution: commonSchemas.currency,
        nsc_subscription: commonSchemas.currency,
        united_link_subsciption: commonSchemas.currency,
        banks_bonds: commonSchemas.currency,
        fd_bank: commonSchemas.currency,
        children_tuition_fees: commonSchemas.currency,
        mf_investment: commonSchemas.currency,
        other_investment_amt: commonSchemas.currency,
        education_loan_start_year: Yup.string()
          .test(
            "year-or-zero",
            "Enter a valid year (YYYY), 0, or leave empty",
            (val) => {
              if (!val || val === "") return true;
              if (val === "0") return true;
              if (!/^(19|20)\d{2}$/.test(val)) return false;

              const year = parseInt(val, 10);
              return year >= 1900 && year <= new Date().getFullYear();
            },
          )
          .nullable(),

        financial_year: Yup.string()
          .matches(/^\d{4}-\d{2}$/, "Invalid Financial Year (YYYY-YY)")
          .optional(),
        assessment_year: Yup.string()
          .matches(/^\d{4}-\d{2}$/, "Invalid Assessment Year (YYYY-YY)")
          .optional(),

        signature: Yup.mixed().when("isDraft", {
          is: true,
          then: () => Yup.mixed().nullable().optional(),
          otherwise: () => createSignatureSchema(hasSavedSignature),
        }),
      }),
    [hasSavedSignature],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "all",
    resolver: yupResolver(validationSchema),
    defaultValues: {
      financial_year: "2024-25",
      assessment_year: "2025-26",
      tax_regime: "",
      hra_is_related_landlord: "no",
      isDraft: false,
      employee_name: "",
      job_title: "",
      pan_no: "",
      contact_no: "",
      address_line1: "",
      address_line2: "",
      landmark: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
    },
  });

  const watchRelatedLandlord = watch("hra_is_related_landlord");

  useEffect(() => {
    if (autoFillData) {
      const savedData = autoFillData.tdsData || {};

      reset({
        ...savedData,
        financial_year: savedData.financial_year || "2024-25",
        assessment_year: savedData.assessment_year || "2025-26",
        tax_regime: savedData.tax_regime || "",

        employee_name: savedData.employee_name || autoFillData.fullName || "",
        employee_code:
          savedData.employee_code || autoFillData.employeeCode || "",
        address_line1: savedData.address_line1 || autoFillData.currentAddress || "",
        address_line2: savedData.address_line2 || "",
        landmark: savedData.landmark || "",
        city: savedData.city || "",
        district: savedData.district || "",
        state: savedData.state || "",
        pincode: savedData.pincode || "",

        job_title: savedData.job_title || autoFillData.designation || "",
        pan_no: savedData.pan_no || autoFillData.panNo || "",
        contact_no: savedData.contact_no || autoFillData.phone || "",

        hra_is_related_landlord: savedData.hra_is_related_landlord || "no",

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
          autoFillData?.tdsData?.signature_path || autoFillData?.signature;
        if (existingPath) formData.append("signature_path", existingPath);
      }

      const token = localStorage.getItem("token");
      await axios.post("/api/forms/tds", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (allValues.isDraft && !isPreviewRef.current) {
        await showAlert("Draft Saved!", { type: "success" });
      } else {
        const savedData = autoFillData?.tdsData || {};
        navigate(`/forms/tds-form/preview/${targetId}`, {
          state: {
            formData: {
              ...allValues,
              signature_path:
                savedData.signature_path || autoFillData?.signature,
            },
            signaturePreview: signaturePreview,
            employeeId: targetId,
            isHR: false,
            status: "DRAFT",
            fromPreviewSubmit: true,
          },
        });
      }
    } catch (error) {
      console.error("Submission Error", error);
      await showAlert(
        `Failed to save form: ${
          error.response?.data?.message || error.message
        }`,
        { type: "error" },
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
    getValues,
    watch,
    errors,
    isSubmitting,
    onFormSubmit,
    showAlert,
    watchRelatedLandlord,
    isPreviewRef,
  };
};

export default useFormTDS;
