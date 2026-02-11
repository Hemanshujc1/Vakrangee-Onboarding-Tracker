import {
  React,
  useEffect,
  useState,
  useMemo,
  useRef,
  useForm,
  useNavigate,
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
import FormInput from "../../Components/Forms/FormInput";

const FormNDA = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  // Get logged-in user ID from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId = user.id;

  useEffect(() => {
    if (!employeeId) {
      navigate("/login");
    }
  }, [employeeId, navigate]);

  const { data: autoFillData, loading } = useAutoFill(employeeId);
  const [signaturePreview, setSignaturePreview] = useState(null);

  // Determine if form is locked (Submitted or Verified)
  const isLocked = ["SUBMITTED", "VERIFIED"].includes(autoFillData?.ndaStatus);

  // Determine if a signature is already saved on the server
  const hasSavedSignature = !!(
    autoFillData?.ndaData?.signature_path || autoFillData?.signature
  );

  // Validation Schema
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        isDraft: Yup.boolean(),
        employee_full_name: commonSchemas.nameString.label("Full Name"),
        address_line1: commonSchemas.addressString.label("Address Line 1"),
        address_line2:
          commonSchemas.addressStringOptional.label("Address Line 2"),
        post_office: commonSchemas.stringRequired.label("Post Office"),
        city: commonSchemas.stringRequired,
        district: commonSchemas.stringRequired,
        state: commonSchemas.stringRequired,
        pincode: commonSchemas.pincode,

        signature: Yup.mixed().when("isDraft", {
          is: true,
          then: (schema) => Yup.mixed().nullable().optional(),
          otherwise: (schema) => createSignatureSchema(hasSavedSignature),
        }),
      }),
    [hasSavedSignature],
  );

  // Redirect if locked
  useEffect(() => {
    if (isLocked && autoFillData) {
      navigate(`/forms/non-disclosure-agreement/preview/${employeeId}`, {
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
  }, [isLocked, autoFillData, navigate]);

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
          `/uploads/signatures/${savedData.signature_path || autoFillData.signature}`,
        );
      }
    }
  }, [autoFillData, reset]);

  const isPreviewRef = React.useRef(false);

  const onFormSubmit = async (values) => {
    // Disabled fields are excluded from 'values', so fetch them manually
    const allValues = {
      ...values,
      employee_full_name: getValues("employee_full_name"),
      address_line1: getValues("address_line1"),
      address_line2: getValues("address_line2"),
      post_office: getValues("post_office"),
      city: getValues("city"),
      district: getValues("district"),
      state: getValues("state"),
      pincode: getValues("pincode"),
    };

    try {
      const formData = new FormData();

      // Always treat as draft for saving data before preview, unless actually submitting final (which is not handled here anymore for direct submit)
      // But we use isDraft from form state to distinguish "Save Draft" vs "Next/Preview"

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
        // Navigate to Preview
        const savedData = autoFillData?.ndaData || {};
        navigate(`/forms/non-disclosure-agreement/preview/${employeeId}`, {
          state: {
            formData: {
              ...allValues,
              signature_path:
                savedData.signature_path || autoFillData?.signature,
            },
            employeeId: employeeId,
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

  if (loading) return <div>Loading Form Data...</div>;

  return (
    <FormLayout
      title="Non-Disclosure Agreement"
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
          setValue("isDraft", true); // Save as Draft first
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
      {/* Content */}
      <div className="bg-white border-b border-gray-300 p-4 mb-6 text-sm text-gray-800">
        <div className="flex flex-col gap-1">
          <p className="font-serif tracking-wide text-gray-900 mb-1 pb-1">
            The “Agreement” is made effective from:
          </p>
          <p className="font-semibold mt-1">
            Date: {new Date().toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>

      {/* Party 1: Employee */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <span className="font-bold">BETWEEN:</span>
            <div className="mt-2 ml-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 items-end">
                <label className="md:col-span-2 font-semibold">
                  Employee Name:
                </label>
                <div className="md:col-span-10">
                  <FormInput
                    register={register}
                    name="employee_full_name"
                    className="font-bold uppercase"
                    disabled
                    error={errors.employee_full_name}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="ml-4 space-y-2 mt-4">
            <p className="font-semibold">Residing at:</p>
            <div className="grid grid-cols-1 gap-2">
              <FormInput
                register={register}
                name="address_line1"
                placeholder="Address Line 1"
                disabled
                error={errors.address_line1}
                required
              />
              <FormInput
                register={register}
                name="address_line2"
                placeholder="Address Line 2"
                disabled
                error={errors.address_line2}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  register={register}
                  name="post_office"
                  placeholder="Post Office"
                  disabled
                  error={errors.post_office}
                  required
                />
                <FormInput
                  register={register}
                  name="district"
                  placeholder="District"
                  disabled
                  error={errors.district}
                  required
                />
              </div>
              <div className="flex gap-4">
                <FormInput
                  register={register}
                  name="city"
                  disabled
                  className="flex-1"
                  error={errors.city}
                  required
                />
                <FormInput
                  register={register}
                  name="state"
                  disabled
                  className="flex-1"
                  error={errors.state}
                  required
                />
                <FormInput
                  register={register}
                  name="pincode"
                  disabled
                  className="w-32"
                  error={errors.pincode}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <span className="font-bold">AND:</span>
          <div className="ml-4 mt-2">
            <p className="text-justify">
              <strong className="uppercase">Vakrangee Limited</strong>, a
              corporation organized and existing under ‘Companies Act, 1956’ and
              having its Head office located at:
            </p>
            <p className="mt-1 font-medium pl-4">
              <strong>
                Plot No. 93, Road No-16, M.I.D.C., Marol, Andheri (East),
                Mumbai: - 400093, Maharashtra.
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* Preamble */}
      <div className="text-justify space-y-4">
        <p>
          In consideration of employment by Company and disclosure by Company of
          confidential data and trade secret information, the undersigned
          Employee hereby covenants and agrees as follows:
        </p>
      </div>

      {/* Terms */}
      <div className="space-y-6 text-justify">
        <div>
          <h4 className="font-bold text-sm uppercase mb-2">
            1. Confidentiality:
          </h4>
          <p className="mb-3">
            Employee acknowledges that in the course of employee’s employment by
            company employee will be exposed to company’s confidential data/
            trade secret information or any other data which is crucial to
            company. Employee agrees to treat all such information or data
            confidential and to take all necessary precautions against
            disclosure of such information to unauthorized persons or any third
            party during and after terms of this agreement.
          </p>
          <p className="mb-2">
            Employee acknowledges that trade secret or any crucial information
            of company will consist but may not be limited to:
          </p>
          <ul className="pl-8 space-y-1">
            <li className="before:content-['a)'] before:mr-2">
              <strong>Technical Information:</strong> Methods, processes,
              formulae, composition, techniques, systems, computer programs,
              inventions, machines, research projects etc.
            </li>
            <li className="before:content-['b)'] before:mr-2">
              <strong>Business Information:</strong> Customer lists, pricing
              data, sources of supply, financial data, marketing or production.
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm uppercase mb-2">2. Use</h4>
          <p>
            Employee shall not use company’s confidential and trade secret
            information, except to the extent necessary to provide services or
            goods requested by company.
          </p>
        </div>
      </div>
    </FormLayout>
  );
};

export default FormNDA;
