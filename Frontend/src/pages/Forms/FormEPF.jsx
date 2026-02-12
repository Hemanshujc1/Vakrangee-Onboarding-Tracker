import {
  React,
  useEffect,
  useState,
  useMemo,
  useForm,
  useNavigate,
  useParams,
  useLocation,
  axios,
  yupResolver,
  Yup,
  FormLayout,
  Loader2,
  useAutoFill,
  useAlert,
  commonSchemas,
  createSignatureSchema,
  onValidationFail,
  formatDateForAPI,
} from "../../utils/formDependencies";
import EPFFormHeader from "./EPFSections/EPFFormHeader";
import EPFMemberDetails from "./EPFSections/EPFMemberDetails";
import EPFPreviousEmployment from "./EPFSections/EPFPreviousEmployment";
import EPFInternationalWorker from "./EPFSections/EPFInternationalWorker";
import EPFKYCDetails from "./EPFSections/EPFKYCDetails";
import EPFPFHistory from "./EPFSections/EPFPFHistory";
import EPFUndertaking from "./EPFSections/EPFUndertaking";
import EPFEmployerDeclaration from "./EPFSections/EPFEmployerDeclaration";

const FormEPF = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useAlert();
  const {
    isEdit,
    isResubmitting,
    formData: stateData,
    rejectionReason: stateRejectionReason,
  } = location.state || {};
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [isEmployee, setIsEmployee] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Determine Target Employee ID
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const targetId =
    employeeId ||
    user.employeeId ||
    (user.role === "EMPLOYEE" ? user.id : null);

  const { data: autoFillData, loading: autoFillLoading } =
    useAutoFill(targetId);

  const isLocked = ["SUBMITTED", "VERIFIED"].includes(autoFillData?.epfStatus);

  const hasSavedSignature = !!(
    autoFillData?.epfData?.signature_path || autoFillData?.signature
  );

  // Validation Schema
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

  // Watch fields for conditional rendering
  const prevEpfMember = watch("prev_epf_member");
  const prevEpsMember = watch("prev_eps_member");
  const internationalWorker = watch("international_worker");
  const relationshipType = watch("relationship_type");

  useEffect(() => {
    if (user.role === "EMPLOYEE") {
      setIsEmployee(true);
    }
  }, []);

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
  }, [autoFillData, reset, stateData]);

  const isPreviewRef = React.useRef(false);

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

    if (allValues.isDraft) {
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

        if (isPreviewMode) {
          const savedData = autoFillData?.epfData || {};
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
      } catch (error) {
        console.error("Draft Save Error", error);
        await showAlert(
          `Failed to save draft: ${
            error.response?.data?.message || error.message
          }`,
          { type: "error" }
        );
      } finally {
        setIsPreviewMode(false);
      }
    } else {
      // PREVIEW FLOW
      const savedData = autoFillData?.epfData || {};
      navigate(`/forms/employees-provident-fund/preview/${targetId}`, {
        state: {
          formData: {
            ...allValues,
            signature_path: savedData.signature_path || autoFillData?.signature,
          },
          signaturePreview: signaturePreview,
          employeeId: targetId,
          isHR: false,
          status: "DRAFT",
        },
      });
    }
  };

  if (autoFillLoading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );

  return (
    <FormLayout
      title="EPF REGISTRATION FORM"
      employeeData={targetId}
      showPhoto={false}
      showSignature={true}
      signaturePreview={signaturePreview}
      isLocked={isLocked}
      onSubmit={handleSubmit(onFormSubmit, (e) =>
        onValidationFail(e, showAlert)
      )}
      actions={{
        isSubmitting,
        onSaveDraft: () => {
          setValue("isDraft", true);
          handleSubmit(onFormSubmit, (e) => onValidationFail(e, showAlert))();
        },
        onSubmit: () => {
          setIsPreviewMode(true);
          setValue("isDraft", true);
        },
      }}
      signature={{
        setValue,
        error: errors.signature,
        preview: signaturePreview,
        setPreview: setSignaturePreview,
        isSaved: hasSavedSignature,
        fieldName: "signature",
      }}
    >
      {/* Rejection Alert */}
      {(isResubmitting || autoFillData?.epfStatus === "REJECTED") && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="font-bold flex items-center gap-2 mb-1 text-sm">
            <Loader2 className="h-4 w-4" /> This form was rejected and needs
            corrections
          </div>
          <p className="text-sm px-1">
            <span className="font-semibold">Reason:</span>{" "}
            {stateRejectionReason || autoFillData?.epfRejectionReason}
          </p>
        </div>
      )}

      <EPFFormHeader />

      <EPFMemberDetails
        register={register}
        errors={errors}
        relationshipType={relationshipType}
      />

      <EPFPreviousEmployment
        register={register}
        errors={errors}
        prevEpfMember={prevEpfMember}
        prevEpsMember={prevEpsMember}
      />

      <EPFInternationalWorker
        register={register}
        errors={errors}
        internationalWorker={internationalWorker}
      />

      <EPFKYCDetails register={register} errors={errors} />

      <EPFPFHistory register={register} errors={errors} />

      <EPFUndertaking register={register} errors={errors} />

      <EPFEmployerDeclaration
        register={register}
        errors={errors}
        watch={watch}
        isEmployee={isEmployee}
      />
    </FormLayout>
  );
};

export default FormEPF;
