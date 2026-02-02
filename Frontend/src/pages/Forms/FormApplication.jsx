import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { DocumentFields } from "../../Components/Forms/Shared";
import { onValidationFail, formatDateForAPI } from "../../utils/formUtils";
import { commonSchemas, createSignatureSchema } from "../../utils/validationSchemas";
import FormLayout from "../../Components/Forms/FormLayout";
import useAutoFill from "../../hooks/useAutoFill";
import { useAlert } from "../../context/AlertContext";
import PersonalInformation from "./ApplicationSections/PersonalInformation";
import AddressDetails from "./ApplicationSections/AddressDetails";
import EducationAndTraining from "./ApplicationSections/EducationAndTraining";
import WorkExperience from "./ApplicationSections/WorkExperience";
import OtherDetails from "./ApplicationSections/OtherDetails";

const FormApplication = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { employeeId } = user.id ? { employeeId: user.id } : { employeeId: null };

  const { showAlert } = useAlert();
  
  useEffect(() => {
    if (!employeeId) navigate("/login");
  }, [employeeId, navigate]);

  const { data: autoFillData, loading } = useAutoFill(employeeId);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const isLocked = ["SUBMITTED", "VERIFIED"].includes(
    autoFillData?.applicationStatus
  );
  const hasSavedSignature = !!(
    autoFillData?.applicationData?.signature_path || autoFillData?.signature
  );

  const validationSchema = Yup.object().shape({
    // Personal Info
    firstname: commonSchemas.nameString.max(15, "Maximum 15 characters allowed"),
    lastname: commonSchemas.nameString.max(15, "Maximum 15 characters allowed"),
    middlename: Yup.string()
    .min(3, "Minimum 3 characters required")
    .max(15, "Maximum 15 characters allowed")
    .matches(/^[a-zA-Z\s]+$/, "Only letters allowed"),
    Maidenname: Yup.string()
    .min(3, "Minimum 3 characters required")
    .max(15, "Maximum 15 characters allowed")
    .matches(/^[a-zA-Z\s]+$/, "Only letters allowed"),  
    currentAddress: Yup.string()
      .min(10, "Address must be at least 10 characters")
      .required("Required"),
    permanentAddress: Yup.string()
      .min(10, "Address must be at least 10 characters")
      .required("Required"),
    mobileNo: commonSchemas.mobile,
    alternateNo: commonSchemas.mobile,
    email: commonSchemas.email,
    emergencyNo: commonSchemas.mobile,
    gender: commonSchemas.stringRequired,
    dob: Yup.date()
         .min(1900, "Enter a valid year")
         .max(new Date().getFullYear(), "Enter a valid year")
         .required("Required"),
    
    // Conditional Documents
    hasPan: Yup.string().oneOf(["Yes", "No"]),
    panNo: Yup.string().when("hasPan", {
      is: "Yes",
      then: (schema) => commonSchemas.pan.required("Required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    hasLicense: Yup.string().oneOf(["Yes", "No"]),
    licenseNo: Yup.string().when("hasLicense", {
      is: "Yes",
      then: (schema) => commonSchemas.license.required("License Number is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    licenseIssueDate: Yup.date().nullable().when("hasLicense", {
        is: "Yes",
        then: (schema) => schema.max(new Date(), "Date cannot be in future").required("Required"),
        otherwise: (schema) => schema.notRequired()
    }),
    licenseExpiryDate: Yup.date().nullable().when("hasLicense", {
        is: "Yes",
        then: (schema) => schema.min(new Date(), "License has expired").required("Required"),
        otherwise: (schema) => schema.notRequired()
    }),
    
    hasPassport: Yup.string().oneOf(["Yes", "No"]),
    passportNo: Yup.string().when("hasPassport", {
      is: "Yes",
      then: (schema) => commonSchemas.passport.required("Passport Number is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    passportIssueDate: Yup.date().nullable().when("hasPassport", {
        is: "Yes",
        then: (schema) => schema.max(new Date(), "Date cannot be in future").required("Required"),
        otherwise: (schema) => schema.notRequired()
    }),
    passportExpiryDate: Yup.date().nullable().when("hasPassport", {
        is: "Yes",
        then: (schema) => schema.min(new Date(), "Passport has expired").required("Required"),
        otherwise: (schema) => schema.notRequired()
    }),

    // Arrays
    education: Yup.array()
      .min(1, "At least one education entry is required")
      .max(5, "You can add a maximum of 5 education entries")
      .of(
        Yup.object().shape({
          qualification: Yup.string().required("Required"),
          institute: Yup.string().required("Required"),
          year: Yup.number()
            .typeError("Year must be a number")
            .min(1900, "Enter a valid year")
            .max(new Date().getFullYear(), "Enter a valid year")
            .required("Required"),
          percentage: Yup.number()
            .typeError("Must be a number")
            .min(0, "Min 0")
            .max(100, "Max 100")
            .required("Required"),
          location: Yup.string(),
        })
      ),

    otherTraining: Yup.array().max(4, "Maximum 4 entries allowed").of(
        Yup.object().shape({
            institute: Yup.string(),
            location: Yup.string(),
            duration: Yup.string(),
            details: Yup.string(),
        })
    ),

    achievements: Yup.array().max(4, "Maximum 4 entries allowed").of(
        Yup.object()
        .shape({
            year: Yup.number()
            .typeError("Year must be a number")
            .min(1900, "Enter a valid year")
            .max(new Date().getFullYear(), "Cannot be in future"),
            details: Yup.string(),
        })
    ),
  
    employmentHistory: Yup.array()
      .max(5, "Maximum 5 entries allowed")
      .of(
        Yup.object().shape({
          employer: Yup.string().required("Required"),
          designation: Yup.string().required("Required"),
          fromDate: Yup.date()
          .nullable()
          .transform((v, o) => o === "" ? null : v)
          .min(1900, "Enter a valid year")
          .max(new Date().getFullYear(), "Enter a valid year")
          .required("Required"),
          toDate: Yup.date()
          .nullable()
          .transform((v, o) => o === "" ? null : v)
          .min(1900, "Enter a valid year")
          .max(new Date().getFullYear(), "Enter a valid year")  
          .required("Required"),
          ctc: Yup.number().typeError("Must be number").nullable().transform((v, o) => o === "" ? null : v),
          reportingOfficer: Yup.string(),
        })
      ),

    workExperience: Yup.array().of(
      Yup.object().shape({
        employer: Yup.string().required("Required"),
        designation: Yup.string().required("Required"),
        turnover: Yup.number().typeError("Must be number").nullable().transform((v, o) => o === "" ? null : v),
        noOfEmployees: Yup.number().typeError("Must be number").nullable().transform((v, o) => o === "" ? null : v),
        joiningCTC: Yup.number().typeError("Must be number").nullable().transform((v, o) => o === "" ? null : v).required("Required"),
        currentCTC: Yup.number().typeError("Must be number").nullable().transform((v, o) => o === "" ? null : v).required("Required"),
        expectedSalary: Yup.number().typeError("Must be number").nullable().transform((v, o) => o === "" ? null : v).required("Required"),
        noticePeriod: Yup.number().typeError("Days (number)").nullable().transform((v, o) => o === "" ? null : v),
        joiningDate: Yup.date().nullable().transform((v, o) => o === "" ? null : v)
        .min(1900, "Enter a valid year")
        .max(new Date(), "Cannot be in future").required("Required"),
      })
    ),

    references: Yup.array()
      .max(2, "Maximum 2 references needed")
      .of(
        Yup.object().shape({
          name: Yup.string().required("Required"),
          company: Yup.string().required("Required"),
          contact: Yup.string().required("Required"),
          position: Yup.string(),
          address: Yup.string(),
        })
      ),
      
    family: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required("Required"),
            relationship: Yup.string().required("Required"),
            age: Yup.number()
            .min(0,"Minium age value is 0")
            .max(120,"Max Age value can't exceed 120")
            .typeError("Age must be a number")
            .positive().integer().required("Required"),
            occupation: Yup.string(),
        })
    ),
    
    languages: Yup.array().max(4, "Maximum 4 entries allowed").of(
        Yup.object().shape({
            language: Yup.string().required("Required"),
            speak: Yup.boolean(),
            read: Yup.boolean(),
            write: Yup.boolean(),
        })
    ),

    // Signature
    signature: createSignatureSchema(hasSavedSignature),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstname: "",
      middlename: "",
      lastname: "",
      Maidenname: "",
      currentAddress: "",
      permanentAddress: "",
      mobileNo: "",
      alternateNo: "",
      email: "",
      emergencyNo: "",
      gender: "",
      age: "",
      dob: "",
      positionApplied: "",
      currentlyEmployed: "No",
      // Arrays
      education: [
        {
          qualification: "",
          institute: "",
          year: "",
          percentage: "",
          location: "",
        },
      ],
      otherTraining: [],
      achievements: [],
      family: [],
      languages: [{ language: "", speak: false, read: false, write: false }],
      workExperience: [
        {
          employer: "",
          designation: "",
          joiningCTC: "",
          currentCTC: "",
          responsibilities: "",
          reasonLeaving: "",
        },
      ], // Default one entry
      employmentHistory: [],
      references: [
        { name: "", position: "", company: "", address: "", contact: "" },
        { name: "", position: "", company: "", address: "", contact: "" },
      ],

      // Documents
      hasLicense: "No",
      licenseNo: "",
      licenseIssueDate: "",
      licenseExpiryDate: "",
      hasPassport: "No",
      passportNo: "",
      passportIssueDate: "",
      passportExpiryDate: "",
      hasPan: "No",
      panNo: "",

      // Habits
      smoking: "No",
      tobacco: "No",
      liquor: "No",

      // Q&A
      careerObjectives: "",
      majorAchievements: "",
      disability: "",
      interviewedBefore: "",
      hobbies: "",
      conviction: "",

      isDraft: false,
      signature: undefined,
    },
  });

  // Field Arrays
  const {
    fields: educationFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control, name: "education" });
  const {
    fields: trainingFields,
    append: appendTraining,
    remove: removeTraining,
  } = useFieldArray({ control, name: "otherTraining" });
  const {
    fields: achievementFields,
    append: appendAchievement,
    remove: removeAchievement,
  } = useFieldArray({ control, name: "achievements" });
  const {
    fields: familyFields,
    append: appendFamily,
    remove: removeFamily,
  } = useFieldArray({ control, name: "family" });
  const {
    fields: languageFields,
    append: appendLang,
    remove: removeLang,
  } = useFieldArray({ control, name: "languages" });
  const {
    fields: historyFields,
    append: appendHistory,
    remove: removeHistory,
  } = useFieldArray({ control, name: "employmentHistory" });
  const {
    fields: referenceFields,
    append: appendRef,
    remove: removeRef,
  } = useFieldArray({ control, name: "references" });

  // Watchers
  const currentAddressValue = watch("currentAddress");

  const copyAddress = (e) => {
    if (e.target.checked) {
      setValue("permanentAddress", currentAddressValue);
    } else {
      setValue("permanentAddress", "");
    }
  };

  useEffect(() => {
    if (autoFillData) {
      const saved = autoFillData.applicationData || {};
      reset({
        firstname: saved.firstname || autoFillData.firstname || "",
        lastname: saved.lastname || autoFillData.lastname || "",
        middlename: saved.middlename || "",
        Maidenname: saved.Maidenname || "",

        currentAddress:
          saved.currentAddress || autoFillData.currentAddress || "",
        permanentAddress: saved.permanentAddress || "",

        mobileNo:
          saved.mobileNo || autoFillData.mobileNo || autoFillData.phone || "",
        email: saved.email || autoFillData.email || "",
        dob: saved.dob || autoFillData.dateOfBirth || autoFillData.dob || "",
        gender: saved.gender || autoFillData.gender || "",
        age: saved.age || autoFillData.age || "",

        positionApplied:
          saved.positionApplied || autoFillData.positionApplied || "",

        panNo: saved.panNo || autoFillData.panNo || "",
        hasPan: saved.hasPan || autoFillData.hasPan || "No",

        ...saved,

        // Ensure arrays have at least one row if empty and required
        education: saved.education?.length
          ? saved.education
          : autoFillData.education?.length
          ? autoFillData.education
          : [
              {
                qualification: "",
                institute: "",
                year: "",
                percentage: "",
                location: "",
              },
            ],
        workExperience: saved.workExperience?.length
          ? saved.workExperience
          : [
              {
                employer: "",
                designation: "",
                joiningCTC: "",
                currentCTC: "",
                responsibilities: "",
                reasonLeaving: "",
              },
            ],
        references: saved.references?.length
          ? saved.references
          : [
              { name: "", position: "", company: "", address: "", contact: "" },
              { name: "", position: "", company: "", address: "", contact: "" },
            ],
      });

      if (saved.signature_path) {
        setSignaturePreview(
          `http://localhost:3001/uploads/signatures/${saved.signature_path}`
        );
      }
    }
  }, [autoFillData, reset]);

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const onFormSubmit = async (values) => {
    // Dates are handled by formatDateForAPI utility


    // Clean top-level dates
    const dateFields = ['dob', 'licenseIssueDate', 'licenseExpiryDate', 'passportIssueDate', 'passportExpiryDate'];
    dateFields.forEach(field => {
        if (values[field]) values[field] = formatDateForAPI(values[field]);
    });

    // Clean nested arrays
    if (values.employmentHistory && Array.isArray(values.employmentHistory)) {
        values.employmentHistory = values.employmentHistory.map(item => ({
            ...item,
            fromDate: formatDateForAPI(item.fromDate),
            toDate: formatDateForAPI(item.toDate)
        }));
    }

    if (values.workExperience && Array.isArray(values.workExperience)) {
        values.workExperience = values.workExperience.map(item => ({
            ...item,
            joiningDate: formatDateForAPI(item.joiningDate)
        }));
    }

    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();

      // Append basic fields
      Object.keys(values).forEach((key) => {
        if (Array.isArray(values[key])) {
          formData.append(key, JSON.stringify(values[key]));
        } else if (key === "signature") {
          if (values.signature instanceof File) {
            formData.append("signature", values.signature);
          }
        } else {
          formData.append(key, values[key] === null || values[key] === undefined ? "" : values[key]);
        }
      });

      // Assuming endpoint exists or will exist
      const response = await fetch(
        "http://localhost:3001/api/forms/application",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (response.ok) {
        if (values.isDraft) {
          const resData = await response.json();
          // If in Preview Mode, don't alert, just navigate
          if (isPreviewMode) {
             const savedData = autoFillData?.applicationData || {};
             // We need to pass the saved form ID if possible, or just rely on autoFill
             navigate("/forms/application/preview", {
                state: {
                  formData: {
                    ...values,
                    signature_path: savedData.signature_path || autoFillData?.signature,
                  },
                  signaturePreview: signaturePreview,
                  employeeId: employeeId,
                  isHR: false,
                  fromPreviewSubmit: true // Flag to enable submit button in preview
                },
             });
          } else {
             await showAlert(`Draft Saved Successfully! Status: ${resData.status}`, { type: 'success' });
          }
        } else {
          await showAlert("Form Submitted!", { type: 'success' });
          const savedData = autoFillData?.applicationData || {};
          navigate("/forms/application/preview", {
            state: {
              formData: {
                ...values,
                signature_path:
                  savedData.signature_path || autoFillData?.signature,
              },
              signaturePreview: signaturePreview,
              employeeId: employeeId,
              isHR: false,
            },
          });
        }
      } else {
        const err = await response.json();
        await showAlert(`Error: ${err.message || "Submission failed"}`, { type: 'error' });
      }
    } catch (error) {
      console.error(error);
      await showAlert("An error occurred during submission.", { type: 'error' });
    } finally {
        setIsPreviewMode(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <FormLayout
      title="Employment Application Form"
      employeeData={autoFillData}
      showPhoto={true}
      showSignature={true}
      signaturePreview={signaturePreview}
      isLocked={isLocked}
      onSubmit={handleSubmit(onFormSubmit, (e) => onValidationFail(e, showAlert))}
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
      {/* Personal Information & Address */}
      <PersonalInformation register={register} errors={errors} autoFillData={autoFillData} />
      <AddressDetails register={register} errors={errors} autoFillData={autoFillData} setValue={setValue} watch={watch} />

      {/* Education & Training */}
      <EducationAndTraining 
        register={register} 
        errors={errors} 
        control={control}
        educationFields={educationFields}
        appendEdu={appendEdu}
        removeEdu={removeEdu}
        trainingFields={trainingFields}
        appendTraining={appendTraining}
        removeTraining={removeTraining}
        achievementFields={achievementFields}
        appendAchievement={appendAchievement}
        removeAchievement={removeAchievement}
      />

      {/* Documents */}
      <DocumentFields 
        register={register} 
        errors={errors} 
        watch={watch} 
        setValue={setValue}
        autoFillData={autoFillData}
      />

      {/* Work Experience & Employment History */}
      <WorkExperience 
        register={register} 
        errors={errors} 
        historyFields={historyFields}
        appendHistory={appendHistory}
        removeHistory={removeHistory}
      />

      {/* Other Details */}
      <OtherDetails 
        register={register} 
        errors={errors} 
        languageFields={languageFields}
        appendLang={appendLang}
        removeLang={removeLang}
        familyFields={familyFields}
        appendFamily={appendFamily}
        removeFamily={removeFamily}
        referenceFields={referenceFields}
        appendRef={appendRef}
        removeRef={removeRef}
      />

      {/* Declaration */}
      <div className="bg-gray-50 p-6 rounded border border-gray-200">
        <h4 className="font-bold mb-4 uppercase">Declaration</h4>
        <p className="text-sm text-justify">
          I declare that the particulars given above are true & complete to the
          best of my knowledge & belief. I agree to produce any documentary
          evidence in proof of the above statements as may be demanded by the
          company. If found otherwise, my appointment shall be liable for
          termination. I confirm that I do not have any criminal record. I will
          also abide by all rules & regulations, Code of Conduct framed by the
          company from time to time.
        </p>
      </div>
    </FormLayout>
  );
};

export default FormApplication;

