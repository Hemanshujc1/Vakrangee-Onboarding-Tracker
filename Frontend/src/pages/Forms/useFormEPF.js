import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  yupResolver,
  Yup,
  axios,
  commonSchemas,
  createSignatureSchema,
  onValidationFail,
  formatDateForAPI,
} from "../../utils/formDependencies";
import useOnboardingForm from "../../hooks/useOnboardingForm";

const useFormEPF = () => {
  const {
    navigate,
    location,
    showAlert,
    user,
    targetId,
    autoFillData,
    autoFillLoading,
    signaturePreview,
    setSignaturePreview,
  } = useOnboardingForm();

  const { formData: stateData } = location.state || {};
  const isPreviewRef = useRef(false);
  
  const isLocked = ["SUBMITTED", "VERIFIED"].includes(autoFillData?.epfStatus);
  const hasSavedSignature = !!(
    autoFillData?.epfData?.signature_path || autoFillData?.signature
  );

  // --- Validation Schema ---
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        isDraft: Yup.boolean(),
        member_name_aadhar: commonSchemas.nameString,
        dob: commonSchemas.datePast,
        gender: Yup.string().required("Required"),
        marital_status: Yup.string().required("Required"),
        relationship_type: Yup.string().nullable().optional(),

        father_name: Yup.string().when("relationship_type", {
          is: "Father",
          then: (schema) => commonSchemas.nameStringOptional.optional(),
        }),
        spouse_name: Yup.string().when("relationship_type", {
          is: "Spouse",
          then: (schema) => commonSchemas.nameStringOptional.optional(),
        }),
        email: commonSchemas.email,
        mobile: commonSchemas.mobile,

        uan_number: Yup.string().when(["prev_epf_member", "prev_eps_member"], {
          is: (epf, eps) => epf === "Yes" || eps === "Yes",
          then: (schema) => commonSchemas.uan.required("UAN Required"),
          otherwise: (schema) => schema.notRequired().nullable(),
        }),
        prev_pf_number: Yup.string().nullable().optional(),
        date_of_exit_prev: commonSchemas.datePastOptional
          .nullable()
          .transform((v, o) => (o === "" ? null : v)),
        scheme_cert_no: Yup.string().nullable().optional(),
        ppo_no: Yup.string().nullable().optional(),

        // International Worker
        international_worker: Yup.string().required("Required"),
        country_of_origin: Yup.string().when("international_worker", {
          is: "Yes",
          then: (schema) =>
            commonSchemas.stringRequired
              .label("Country")
              .required("Country Required"),
        }),
        passport_no: Yup.string().when("international_worker", {
          is: "Yes",
          then: (schema) =>
            commonSchemas.passport.required("Passport Required"),
        }),
        passport_valid_from: Yup.date()
          .nullable()
          .when("international_worker", {
            is: "Yes",
            then: (schema) => commonSchemas.datePast.required("Required"),
          })
          .transform((v, o) => (o === "" ? null : v)),
        passport_valid_to: Yup.date()
          .nullable()
          .when("international_worker", {
            is: "Yes",
            then: (schema) => commonSchemas.dateFuture.required("Required"),
          })
          .transform((v, o) => (o === "" ? null : v)),

        // KYC
        bank_account_no: commonSchemas.bankAccount,
        ifsc_code: commonSchemas.ifsc,
        aadhaar_no: commonSchemas.aadhaar,
        pan_no: commonSchemas.pan,

        // PF History
        first_epf_enrolled_date: commonSchemas.datePast
          .nullable()
          .transform((v, o) => (o === "" ? null : v)),
        first_epf_wages: commonSchemas.currency,
        pre_2014_member: Yup.string().nullable().optional(),
        withdrawn_epf: Yup.string().nullable().optional(),
        withdrawn_eps: Yup.string().nullable().optional(),
        post_2014_eps_withdrawn: Yup.string().nullable().optional(),

        // Previous Employment
        prev_epf_member: Yup.string().optional(),
        prev_eps_member: Yup.string().optional(),

        place: Yup.string().required("Required"),
        present_joining_date: commonSchemas.datePastOptional
          .nullable()
          .transform((v, o) => (o === "" ? null : v)),
        present_pf_number: Yup.string().nullable().optional(),
        present_kyc_status: Yup.string().nullable().optional(),
        present_transfer_status: Yup.string().nullable().optional(),

        // Signature
        signature: Yup.mixed().when("isDraft", {
          is: true,
          then: (schema) => Yup.mixed().nullable().optional(),
          otherwise: (schema) => createSignatureSchema(hasSavedSignature),
        }),
      }),
    [hasSavedSignature]
  );

  // --- React Hook Form ---
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      prev_epf_member: "No",
      prev_eps_member: "No",
      international_worker: "No",
      isDraft: false,
    },
  });

  // --- Watchers ---
  const prevEpfMember = watch("prev_epf_member");
  const prevEpsMember = watch("prev_eps_member");
  const internationalWorker = watch("international_worker");
  const relationshipType = watch("relationship_type");
  const isEmployee = user.role === "EMPLOYEE";

  // --- Load Data ---
  useEffect(() => {
    if (stateData) {
      // Prioritize stateData (from preview 'Back' or 'Edit')
      reset(stateData);
      if (stateData.signature_path) {
        setSignaturePreview(`/uploads/signatures/${stateData.signature_path}`);
      }
    } else if (autoFillData) {
      const savedData = autoFillData.epfData || {};
      const appData = autoFillData.applicationData || {};

      const formValues = {
        ...savedData,
        member_name_aadhar:
          savedData.member_name_aadhar || autoFillData.fullName || "",
        dob: formatDateForAPI(savedData.dob || autoFillData.dateOfBirth || ""),
        gender: savedData.gender || autoFillData.gender || "",
        email: savedData.email || autoFillData.email || "",
        mobile: savedData.mobile || autoFillData.mobileNo || "",

        bank_account_no:
          savedData.bank_account_no || autoFillData.bankAccountNo || "",
        ifsc_code: savedData.ifsc_code || autoFillData.ifscCode || "",
        aadhaar_no: savedData.aadhaar_no || autoFillData.aadhaar || "",
        pan_no: savedData.pan_no || autoFillData.panNo || "",

        passport_no: savedData.passport_no || appData.passportNo || "",
        passport_valid_from: formatDateForAPI(
          savedData.passport_valid_from || appData.passportIssueDate || ""
        ),
        passport_valid_to: formatDateForAPI(
          savedData.passport_valid_to || appData.passportExpiryDate || ""
        ),

        present_joining_date: formatDateForAPI(
          savedData.present_joining_date || autoFillData.joiningDate || ""
        ),
        date_of_exit_prev: formatDateForAPI(savedData.date_of_exit_prev || ""),
        first_epf_enrolled_date: formatDateForAPI(
          savedData.first_epf_enrolled_date || ""
        ),
        signature_path:
          savedData.signature_path || autoFillData.signature || "",
      };

      reset(formValues);

      // Handle Signature Preview
      const sigPath = savedData.signature_path || autoFillData.signature;
      if (sigPath) {
        setSignaturePreview(`/uploads/signatures/${sigPath}`);
      }
    }
  }, [autoFillData, reset, stateData, setSignaturePreview]);

  // --- Submit Handler ---
  const onFormSubmit = async (values) => {
    const allValues = {
      ...values,
      member_name_aadhar: getValues("member_name_aadhar"),
      dob: getValues("dob"),
      present_joining_date: getValues("present_joining_date"),
      date_of_exit_prev: getValues("date_of_exit_prev"),
      passport_valid_from: getValues("passport_valid_from"),
      passport_valid_to: getValues("passport_valid_to"),
      first_epf_enrolled_date: getValues("first_epf_enrolled_date"),
    };

    const isDraft = allValues.isDraft;

    try {
      const formData = new FormData();
      Object.keys(allValues).forEach((key) => {
        if (key === "signature") {
          if (allValues.signature instanceof File) {
            formData.append("signature", allValues.signature);
          }
        } else if (
          key !== "signature_path" &&
          key !== "sinature_of_employer_path"
        ) {
          let value = allValues[key];

          // Format dates
          if (
            [
              "dob",
              "present_joining_date",
              "date_of_exit_prev",
              "passport_valid_from",
              "passport_valid_to",
              "first_epf_enrolled_date",
            ].includes(key)
          ) {
            value = formatDateForAPI(value);
          }

          formData.append(key, value == null ? "" : value);
        }
      });

      const token = localStorage.getItem("token");
      await axios.post("/api/forms/epf", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const savedData = autoFillData?.epfData || {};

      if (isDraft) {
        if (isPreviewRef.current) {
           navigate(`/forms/employees-provident-fund/preview/${targetId}`, {
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
        } else {
           await showAlert("Draft Saved!", { type: "success" });
        }
      } else {
         navigate(`/forms/employees-provident-fund/preview/${targetId}`, {
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
      console.error("Draft Save Error", error);
      await showAlert(
        `Failed to save: ${error.response?.data?.message || error.message}`,
        { type: "error" }
      );
    }
  };

  return {
    targetId,
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
    onFormSubmit,
    onValidationFail,
    showAlert,
    // Expose setters to UI actions
    isPreviewRef,
    prevEpfMember,
    prevEpsMember,
    internationalWorker,
    relationshipType,
    isEmployee,
  };
};

export default useFormEPF;
