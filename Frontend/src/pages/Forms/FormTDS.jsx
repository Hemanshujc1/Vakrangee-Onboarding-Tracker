import {
  React,
  useState,
  useEffect,
  useMemo,
  useParams,
  useNavigate,
  useForm,
  yupResolver,
  Yup,
  axios,
  FormLayout,
  useAutoFill,
  useAlert,
  commonSchemas,
  createSignatureSchema,
  onValidationFail,
} from "../../utils/formDependencies";
import TaxRegimeSelection from "./TDSSections/TaxRegimeSelection";
import EducationLoanSection from "./TDSSections/EducationLoanSection";
import HousingLoanSection from "./TDSSections/HousingLoanSection";
import NPSSection from "./TDSSections/NPSSection";
import HRASection from "./TDSSections/HRASection";
import MedicalInsuranceSection from "./TDSSections/MedicalInsuranceSection";
import OtherInvestmentsSection from "./TDSSections/OtherInvestmentsSection";
import EmployeeDeclaration from "./TDSSections/EmployeeDeclaration";

const FormTDS = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const targetId = employeeId || user.id;

  const { data: autoFillData, loading: autoFillLoading } =
    useAutoFill(targetId);
  const [signaturePreview, setSignaturePreview] = useState(null);

  const isLocked = ["SUBMITTED", "VERIFIED"].includes(autoFillData?.tdsStatus);
  const hasSavedSignature = !!(
    autoFillData?.tdsData?.signature_path || autoFillData?.signature
  );

  useEffect(() => {
    if (isLocked && autoFillData) {
      // navigate('/forms/tds-form/preview', { state: { formData: autoFillData.tdsData } });
    }
  }, [isLocked, autoFillData, navigate]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        isDraft: Yup.boolean(),
        tax_regime: Yup.string().required("Please select a tax regime"),
        pan_no: commonSchemas.pan,
        contact_no: commonSchemas.mobile,
        employee_name: commonSchemas.nameString.label("Employee Name"),
        job_title: commonSchemas.stringRequired,

        // Numerical fields
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
          then: (schema) => Yup.mixed().nullable().optional(),
          otherwise: (schema) => createSignatureSchema(hasSavedSignature),
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
      const address = autoFillData.address || {};

      reset({
        ...savedData,
        financial_year: savedData.financial_year || "2024-25",
        assessment_year: savedData.assessment_year || "2025-26",
        tax_regime: savedData.tax_regime || "",

        employee_name: savedData.employee_name || autoFillData.fullName || "",
        employee_code:
          savedData.employee_code || autoFillData.employeeCode || "",
        address_line1: savedData.address_line1 || address.line1 || "",
        address_line2: savedData.address_line2 || address.line2 || "",
        landmark: savedData.landmark || address.landmark || "",
        city: savedData.city || address.city || "",
        district: savedData.district || address.district || "",
        state: savedData.state || address.state || "",
        pincode: savedData.pincode || address.pincode || "",

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
  }, [autoFillData, reset]);

  const isPreviewRef = React.useRef(false);

  const onFormSubmit = async (values) => {
    const allValues = {
      ...values,
      employee_name: getValues("employee_name"),
      job_title: getValues("job_title"),
      address_line1: getValues("address_line1"),
      pan_no: getValues("pan_no"),
      contact_no: getValues("contact_no"),
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

  if (autoFillLoading) return <div>Loading...</div>;

  return (
    <FormLayout
      title="TDS Declaration Form"
      employeeData={autoFillData}
      showPhoto={false}
      showSignature={true}
      signaturePreview={signaturePreview}
      isLocked={isLocked}
      onSubmit={handleSubmit(onFormSubmit, (e) =>
        onValidationFail(e, showAlert),
      )}
      actions={{
        isSubmitting,
        onSaveDraft: () => {
          setValue("isDraft", true);
          isPreviewRef.current = false;
          handleSubmit(onFormSubmit, (e) => onValidationFail(e, showAlert))();
        },
        onSubmit: () => {
          setValue("isDraft", true);
          isPreviewRef.current = true;
          handleSubmit(onFormSubmit, (e) => onValidationFail(e, showAlert))();
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
      <TaxRegimeSelection register={register} errors={errors} />

      <EducationLoanSection register={register} errors={errors} />

      <HousingLoanSection register={register} errors={errors} />

      <NPSSection register={register} errors={errors} />

      <HRASection
        register={register}
        errors={errors}
        watchRelatedLandlord={watchRelatedLandlord}
      />

      <MedicalInsuranceSection register={register} errors={errors} />

      <OtherInvestmentsSection register={register} errors={errors} />

      <EmployeeDeclaration register={register} errors={errors} watch={watch} />
    </FormLayout>
  );
};

export default FormTDS;
