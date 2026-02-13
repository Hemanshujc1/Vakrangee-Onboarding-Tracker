import { useMemo, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import {
  onValidationFail,
  formatDateForAPI,
} from "../../utils/formDependencies";
import {
  getValidationSchema,
  defaultValues,
} from "./InformationSections/formInformationSchema";
import useOnboardingForm from "../../hooks/useOnboardingForm";

const useFormInformation = () => {
  const {
    navigate,
    showAlert,
    targetId: employeeId,
    autoFillData,
    autoFillLoading: loading,
    signaturePreview,
    setSignaturePreview,
    isPreviewMode: isPreview,
    setIsPreviewMode: setIsPreview,
  } = useOnboardingForm();

  const hasSavedSignature = !!(
    autoFillData?.employeeInfoData?.signature_path || autoFillData?.signature
  );

  const isLocked = ["SUBMITTED", "VERIFIED"].includes(
    autoFillData?.employeeInfoStatus
  );

  const validationSchema = useMemo(
    () => getValidationSchema(hasSavedSignature),
    [hasSavedSignature]
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  const { fields: eduFields } = useFieldArray({
    control,
    name: "educational_details",
  });
  const { fields: empFields } = useFieldArray({
    control,
    name: "employment_details",
  });
  const { fields: refFields } = useFieldArray({
    control,
    name: "references",
  });

  // Address Copy Logic
  const sameAddress = watch("sameAddress");
  const currentAddress = watch([
    "current_residence_type",
    "current_building_name",
    "current_flat_house_no",
    "current_block_street_no",
    "current_street_name",
    "current_city",
    "current_district",
    "current_post_office",
    "current_state",
    "current_pin_code",
  ]);

  useEffect(() => {
    if (sameAddress) {
      const fields = [
        "residence_type",
        "building_name",
        "flat_house_no",
        "block_street_no",
        "street_name",
        "city",
        "district",
        "post_office",
        "state",
        "pin_code",
      ];
      fields.forEach((field, index) => {
        setValue(`permanent_${field}`, currentAddress[index], {
          shouldValidate: true,
        });
      });
    }
  }, [sameAddress, JSON.stringify(currentAddress), setValue]);

  // AutoFill
  useEffect(() => {
    if (autoFillData) {
      const saved = autoFillData.employeeInfoData || {};
      const base = autoFillData; // Fallback to base user data

      reset({
        ...defaultValues, // start with clean defaults
        designation: saved.designation || base.designation || "",
        first_name: saved.first_name || base.firstname || "",
        middle_name: saved.middle_name || base.middlename || "",
        last_name: saved.last_name || base.lastname || "",
        father_name: saved.father_name || "",
        father_middle_name: saved.father_middle_name || "",
        father_last_name: saved.father_last_name || "",
        date_of_birth: formatDateForAPI(saved.date_of_birth || base.dob),
        birth_city: saved.birth_city || "",
        birth_state: saved.birth_state || "",
        country: saved.country || "India",
        blood_group: saved.blood_group || "",
        gender: saved.gender || base.gender || "",
        marital_status: saved.marital_status || base.maritalStatus || "",

        passport_number: saved.passport_number || autoFillData.passportNo || "",
        passport_date_of_issue: formatDateForAPI(saved.passport_date_of_issue || autoFillData.passportIssueDate),
        passport_expiry_date: formatDateForAPI(saved.passport_expiry_date || autoFillData.passportExpiryDate),
        pan_number: saved.pan_number || base.panNo || "",
        aadhar_number: saved.aadhar_number || autoFillData.aadhaar || "",

        std_code: saved.std_code || "",
        alternate_no: saved.alternate_no || "",
        mobile_no: saved.mobile_no || base.mobileNo || "",
        emergency_no: saved.emergency_no || "",
        personal_email: saved.personal_email || base.email || "",

        // Address - simplify mapping?
        ...saved, // Spread saved address fields

        current_residence_type: saved.current_residence_type || "",

        educational_details:
          saved.educational_details?.length > 0
            ? saved.educational_details
            : defaultValues.educational_details,
        employment_details:
          saved.employment_details?.length > 0
            ? saved.employment_details
            : [],
        references:
          saved.references?.length >= 2
            ? saved.references
            : defaultValues.references,
      });

      if (saved.signature_path || autoFillData.signature) {
        const path = saved.signature_path || autoFillData.signature;
        setSignaturePreview(
          path.startsWith("http") ? path : `/uploads/signatures/${path}`
        );
      }
    }
  }, [autoFillData, reset, setSignaturePreview]);

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();

      // Date formatting helpers
      const dateFields = [
        "date_of_birth",
        "passport_date_of_issue",
        "passport_expiry_date",
      ];
      dateFields.forEach((f) => {
        if (values[f]) values[f] = formatDateForAPI(values[f]);
      });

      // Process arrays
      if (values.educational_details) {
        values.educational_details = values.educational_details.map((e) => ({
          ...e,
          startDate: formatDateForAPI(e.startDate),
          endDate: formatDateForAPI(e.endDate),
        }));
      }
      if (values.employment_details) {
        values.employment_details = values.employment_details.map((e) => ({
          ...e,
          startDate: formatDateForAPI(e.startDate),
          endDate: formatDateForAPI(e.endDate),
          reportStartDate: formatDateForAPI(e.reportStartDate),
          reportEndDate: formatDateForAPI(e.reportEndDate),
          reportStartDate2: formatDateForAPI(e.reportStartDate2),
          reportEndDate2: formatDateForAPI(e.reportEndDate2),
        }));
      }

      Object.keys(values).forEach((key) => {
        if (key === "signature") {
          if (values.signature instanceof File) {
            formData.append("signature", values.signature);
          }
        } else if (
          [
            "educational_details",
            "employment_details",
            "references",
            "documents_attached",
          ].includes(key)
        ) {
          formData.append(key, JSON.stringify(values[key]));
        } else {
          formData.append(key, values[key] == null ? "" : values[key]);
        }
      });

      const token = localStorage.getItem("token");
      await axios.post("/api/forms/save-employee-info", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (isPreview) {
        const saved = autoFillData?.employeeInfoData || {};
        navigate(`/forms/information/preview/${employeeId}`, {
          state: {
            formData: {
              ...values,
              signature_path: saved.signature_path || autoFillData?.signature,
            },
            signaturePreview: signaturePreview,
            employeeId,
          },
        });
      } else if (values.isDraft) {
        await showAlert("Draft Saved!", { type: "success" });
      } else {
        navigate(`/forms/information/preview/${employeeId}`, {
          state: { formData: values, signaturePreview, employeeId },
        });
      }
    } catch (error) {
      console.error("Submission Error:", error);
      await showAlert("Failed to save form. Check console for details.", {
        type: "error",
      });
    }
  };

  return {
    autoFillData,
    loading,
    signaturePreview,
    setSignaturePreview,
    hasSavedSignature,
    isLocked,
    register,
    control,
    handleSubmit,
    setValue,
    errors,
    isSubmitting,
    eduFields,
    empFields,
    refFields,
    onSubmit,
    onValidationFail,
    setIsPreview,
    showAlert,
  };
};

export default useFormInformation;
