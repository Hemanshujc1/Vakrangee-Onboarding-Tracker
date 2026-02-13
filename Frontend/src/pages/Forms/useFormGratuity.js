import { useEffect, useMemo, useRef, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  yupResolver,
  Yup,
  commonSchemas,
  createSignatureSchema,
  formatDateForAPI,
} from "../../utils/formDependencies";
import useOnboardingForm from "../../hooks/useOnboardingForm";

const useFormGratuity = () => {
  const {
    navigate,
    showAlert,
    user,
    targetId: employeeId,
    autoFillData,
    loading: autoFillLoading,
    signaturePreview,
    setSignaturePreview,
  } = useOnboardingForm();

  // Determine if form is locked
  const isLocked = ["SUBMITTED", "VERIFIED"].includes(
    autoFillData?.gratuityStatus
  );
  const hasSavedSignature = !!(
    autoFillData?.gratuityData?.signature_path || autoFillData?.signature
  );

  // Redirect if locked
  useEffect(() => {
    if (isLocked && autoFillData) {
      navigate(`/forms/gratuity-form/preview/${employeeId}`, {
        state: {
          formData: {
            ...autoFillData.gratuityData,
            employee_full_name:
              autoFillData.gratuityData?.employee_full_name ||
              autoFillData.fullName,
          },
          signaturePreview: autoFillData.gratuityData?.signature_path
            ? `/uploads/signatures/${autoFillData.gratuityData.signature_path}`
            : null,
        },
      });
    }
  }, [isLocked, autoFillData, navigate, employeeId]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        isDraft: Yup.boolean(),
        // Personal
        firstname: commonSchemas.nameString.label("First Name"),
        lastname: commonSchemas.nameString.label("Last Name"),
        middlename: commonSchemas.nameStringOptional.label("Middle Name"),

        // Details
        religion: commonSchemas.stringRequired,
        marital_status: commonSchemas.stringRequired,
        gender: commonSchemas.stringRequired,
        department: commonSchemas.stringRequired,
        ticket_no: Yup.string().optional(),
        date_of_appointment: commonSchemas.dateOptional,

        // Address
        city: commonSchemas.stringRequired,
        thana: commonSchemas.stringRequired,
        sub_division: Yup.string().optional(),
        post_office: commonSchemas.stringRequired,
        district: commonSchemas.stringRequired,
        state: commonSchemas.stringRequired,
        place: commonSchemas.stringRequired,

        nominees: Yup.array().of(
          Yup.object().shape({
            name: commonSchemas.nameString.label("Name"),
            address: commonSchemas.addressString.label("Address"),
            relationship: commonSchemas.stringRequired,
            age: commonSchemas.age.required("Required"),
            share: commonSchemas.numberOptional
              .min(1, "Min 1%")
              .max(100, "Max 100%")
              .required("Required"),
          })
        ),

        // Witnesses - New Array Structure
        witnesses: Yup.array().of(
          Yup.object().shape({
            name: commonSchemas.nameStringOptional,
            address: commonSchemas.addressStringOptional.label("Address"),
          })
        ),

        witnesses_place: Yup.string().when("isDraft", {
          is: false,
          then: (schema) => commonSchemas.stringOptional,
          otherwise: (schema) => schema.optional(),
        }),
        witnesses_date: Yup.date().when("isDraft", {
          is: false,
          then: (schema) => commonSchemas.dateOptional,
          otherwise: (schema) => schema.optional(),
        }),

        signature: Yup.mixed().when("isDraft", {
          is: true,
          then: (schema) => Yup.mixed().nullable().optional(),
          otherwise: (schema) => createSignatureSchema(hasSavedSignature),
        }),
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
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: useCallback(async (values, context, options) => {
      const resolver = yupResolver(validationSchemaRef.current);
      return resolver(values, context, options);
    }, []),
    defaultValues: {
      firstname: "",
      lastname: "",
      middlename: "",

      religion: "",
      marital_status: "",
      gender: "",
      department: "",
      ticket_no: "",
      date_of_appointment: "",

      city: "",
      thana: "",
      sub_division: "",
      post_office: "",
      district: "",
      state: "",
      place: "",

      nominees: [
        { name: "", address: "", relationship: "", age: "", share: "" },
      ],

      witnesses: [
        { name: "", address: "" },
        { name: "", address: "" },
      ],

      witnesses_place: "",
      witnesses_date: "",

      signature: undefined,
      isDraft: false,
    },
  });

  const {
    fields: nomineeFields,
    append: appendNominee,
    remove: removeNominee,
  } = useFieldArray({
    control,
    name: "nominees",
  });

  const { fields: witnessFields } = useFieldArray({
    control,
    name: "witnesses",
  });

  useEffect(() => {
    if (autoFillData) {
      const savedData = autoFillData.gratuityData || {};
      const appData = autoFillData.applicationData || {};

      // Extract common witness place/date from first witness if available
      const wPlace = savedData.witnesses?.[0]?.place || "";
      const wDate = savedData.witnesses?.[0]?.date || "";

      reset({
        firstname: savedData.firstname || "",
        lastname: savedData.lastname || "",
        middlename: savedData.middlename || "",

        religion: savedData.religion || appData.religion || "",
        marital_status:
          savedData.marital_status || autoFillData.maritalStatus || "Unmarried",
        gender: savedData.gender || "",
        department: savedData.department || "",
        ticket_no: savedData.ticket_no || "",
        date_of_appointment:
          formatDateForAPI(savedData.date_of_appointment) || "",

        city: savedData.city || autoFillData.address?.city || "",
        thana: savedData.thana || "",
        sub_division: savedData.sub_division || "",
        post_office:
          savedData.post_office || autoFillData.address?.post_office || "",
        district: savedData.district || "",
        state: savedData.state || "",
        place: savedData.place || "",

        nominees:
          savedData.nominees?.length > 0
            ? savedData.nominees
            : savedData.nominee_name
            ? [
                {
                  // Fallback for legacy single fields
                  name: savedData.nominee_name,
                  address: savedData.nominee_address,
                  relationship: savedData.nominee_relationship,
                  age: savedData.nominee_age,
                  share: savedData.nominee_share,
                },
              ]
            : [
                {
                  name: "",
                  address: "",
                  relationship: "",
                  age: "",
                  share: "",
                },
              ],

        witnesses:
          savedData.witnesses?.length > 0
            ? savedData.witnesses
            : [
                { name: "", address: "" },
                { name: "", address: "" },
              ], // Default 2 empty

        witnesses_place: wPlace,
        witnesses_date: formatDateForAPI(wDate),

        signature: undefined,
        isDraft: false,
      });

      const sigPath = savedData.signature_path || savedData.signature;
      if (sigPath) {
        // If it's a full URL (rare), use it, otherwise assume filename
        const url = sigPath.startsWith("http")
          ? sigPath
          : `/uploads/signatures/${sigPath}`;
        setSignaturePreview(url);
      }
    }
  }, [autoFillData, reset, setSignaturePreview]);

  const onFormSubmit = async (values) => {
    if (values.isDraft) {
      try {
        const formData = new FormData();
        const formattedWitnessDate = formatDateForAPI(values.witnesses_date);

        Object.keys(values).forEach((key) => {
          if (key === "witnesses") {
            // Inject place and date into each witness object
            const enhancedWitnesses = (values.witnesses || []).map((w) => ({
              ...w,
              place: values.witnesses_place || "",
              date: formattedWitnessDate || "",
            }));
            formData.append(key, JSON.stringify(enhancedWitnesses));
          } else if (key === "nominees") {
            formData.append(key, JSON.stringify(values[key]));
          } else if (key === "signature") {
            if (values.signature instanceof File) {
              formData.append("signature", values.signature);
            }
          } else if (
            key === "date_of_appointment" ||
            key === "witnesses_date"
          ) {
            const dateVal = formatDateForAPI(values[key]);
            formData.append(key, dateVal || "");
          } else {
            formData.append(key, values[key] || "");
          }
        });

        const token = localStorage.getItem("token");
        const response = await fetch("/api/forms/gratuity", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (response.ok) {
          await showAlert("Draft Saved!", { type: "success" });
        } else {
          await showAlert("Failed to save draft.", { type: "error" });
        }
      } catch (error) {
        console.error(error);
        await showAlert("Submission failed.", { type: "error" });
      }
    } else {
      const savedData = autoFillData?.gratuityData || {};
      navigate(`/forms/gratuity-form/preview/${employeeId}`, {
        state: {
          formData: {
            ...values,
            signature_path: savedData.signature_path || autoFillData?.signature,
          },
          signaturePreview: signaturePreview,
          employeeId: autoFillData?.id || employeeId,
          isHR: false,
          status: "DRAFT",
        },
      });
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
    control,
    handleSubmit,
    setValue,
    watch,
    errors,
    isSubmitting,
    onFormSubmit,
    showAlert,
    nomineeFields,
    witnessFields,
    appendNominee,
    removeNominee,
  };
};

export default useFormGratuity;
