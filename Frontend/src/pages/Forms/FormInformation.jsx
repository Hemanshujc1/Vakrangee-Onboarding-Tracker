import React, { useEffect, useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "axios";
import FormLayout from "../../Components/Forms/FormLayout";
import FormInput from "../../Components/Forms/FormInput";
import useAutoFill from "../../hooks/useAutoFill";
import {
  commonSchemas,
  createSignatureSchema,
} from "../../utils/validationSchemas";
import { onValidationFail, formatDateForAPI } from "../../utils/formUtils";
import PersonalDetails from "./InformationSections/PersonalDetails";
import ContactDetails from "./InformationSections/ContactDetails";
import EducationDetails from "./InformationSections/EducationDetails";
import EmploymentDetails from "./InformationSections/EmploymentDetails";
import ReferenceDetails from "./InformationSections/ReferenceDetails";

import { useAlert } from "../../context/AlertContext";

const FormInformation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // Get logged-in user ID
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId = id || user.id;

  const { data: autoFillData, loading } = useAutoFill(employeeId);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [isPreview, setIsPreview] = useState(false);

  const hasSavedSignature = !!(
    autoFillData?.employeeInfoData?.signature_path || autoFillData?.signature
  );

  const isLocked = ["SUBMITTED", "VERIFIED"].includes(
    autoFillData?.employeeInfoStatus
  );

  // --- Validation Schema ---
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        isDraft: Yup.boolean(),

        // Header
        designation: commonSchemas.stringRequired,

        // Personal Details
        first_name: commonSchemas.nameString.label("First Name"),
        middle_name: commonSchemas.nameStringOptional.label("Middle Name"),
        last_name: commonSchemas.nameString.label("Last Name"),
        father_name: commonSchemas.nameStringOptional.label("Father's Name"),
        father_middle_name: commonSchemas.nameStringOptional.label("Father's Middle Name"),
        father_last_name: commonSchemas.nameStringOptional.label("Father's Last Name"),
        date_of_birth: commonSchemas.datePast,
        birth_city: commonSchemas.stringRequired,
        birth_state: commonSchemas.stringRequired,
        country: commonSchemas.country,
        blood_group: Yup.string().required("Required"),
        gender: Yup.string().required("Required"),
        marital_status: Yup.string().required("Required"),

        // IDs (Optional but validated if present)
        passport_number: commonSchemas.passport.nullable().optional(),
        passport_date_of_issue: commonSchemas.datePast.nullable().optional(),
        passport_expiry_date: commonSchemas.dateFuture.nullable().optional(),

        pan_number: commonSchemas.pan.required("Required"),
        aadhar_number: commonSchemas.aadhaar.required("Required"),

        // Contacts
        std_code: Yup.string().nullable().optional(),
        alternate_no: commonSchemas.mobile,
        mobile_no: commonSchemas.mobile,
        emergency_no: commonSchemas.mobile,
        personal_email: commonSchemas.email,

        // Address - Current
        current_residence_type: Yup.string().required("Required"),
        current_landlord_name: commonSchemas.nameStringOptional,
        current_building_name: Yup.string().required("Required"),
        current_flat_house_no: Yup.string().required("Required"),
        current_block_street_no: Yup.string().required("Required"),
        current_street_name: Yup.string().required("Required"),
        current_city: Yup.string().required("Required"),
        current_district: Yup.string().required("Required"),
        current_post_office: Yup.string().required("Required"),
        current_state: Yup.string().required("Required"),
        current_pin_code: commonSchemas.pincode,

        // Address - Permanent
        permanent_residence_type: Yup.string().required("Required"),
        permanent_building_name: Yup.string().required("Required"),
        permanent_flat_house_no: Yup.string().required("Required"),
        permanent_block_street_no: Yup.string().required("Required"),
        permanent_street_name: Yup.string().required("Required"),
        permanent_city: Yup.string().required("Required"),
        permanent_district: Yup.string().required("Required"),
        permanent_post_office: Yup.string().required("Required"),
        permanent_state: Yup.string().required("Required"),
        permanent_pin_code: commonSchemas.pincode,

        educational_details: Yup.array().of(
          Yup.object().shape({
            course: Yup.string().required("Required"),
            degree: Yup.string().required("Required"),
            institute: Yup.string().required("Required"),
            address: commonSchemas.addressString.label("Address"),
            state: Yup.string().required("Required"),
            pin: commonSchemas.pincode,
            university: Yup.string().required("Required"),
            universityAddress: commonSchemas.addressStringOptional.label("University Address"),
            universitystate: Yup.string().optional(),
            universitypin: Yup.string()
              .optional()
              .nullable()
              .test("len", "Must be 6 digits", (v) => !v || v.length === 6),
            startDate: commonSchemas.dateRequired,
            endDate: Yup.date()
              .min(1900,"Enter a valid date")
              .max(3000,"Enter a vlaid date")
              .required("Required"),
            status: Yup.string().required("Required"),
            marks: Yup.number()
            .min(0,"Enter a valid number")
            .max(100,"Enter a valid number")
            .required("Required"),
            educationType: Yup.string().required("Required"),
            rollNo: Yup.string().required(),
            enrollmentNo: Yup.string().optional(),
            anyOther: Yup.string().optional(), 
            achievements: Yup.string().optional(), 
            documentsAttached: Yup.string().optional(), 
          })
        ),

        // Employment Details
        employment_details: Yup.array().of(
          Yup.object().shape({
            companyName: Yup.string()
            .min(2, "Min 2 chars")
            .max(30, "Max 30 chars")
            .nullable().optional(),
            address: commonSchemas.addressStringOptional.label("Address"),
            empType: Yup.string().nullable().optional(),
            empCode: Yup.string().optional(),
            startDate: Yup.string().nullable().optional(),
            endDate: Yup.string().nullable().optional(),
            position: Yup.string()
            .min(2,"Min 2 chars").max(30,"Max 30 chars").nullable().optional(),
            compensation: commonSchemas.currency.optional(),
            city: Yup.string().min(3,"Min 3 chars").max(40,"Max 40 chars").nullable().optional(),

            hrRep: commonSchemas.nameStringOptional,
            hrTel: commonSchemas.mobile.optional(),
            hrMob: commonSchemas.mobile.optional(),
            hrEmail:  commonSchemas.email.optional(),

            supervisorName: commonSchemas.nameStringOptional,
            supTel: commonSchemas.mobile.optional(),
            supMob: commonSchemas.mobile.optional(),
            supEmail: commonSchemas.email.optional(),
            designation: Yup.string()
            .min(2,"Min 2 chars").max(30,"Max 30 chars").nullable().optional(),
            reportStartDate: commonSchemas.datePast.nullable().optional(),
            reportEndDate: Yup.date() 
            .min(1900, "Enter a valid date")
            .max(3000, "Enter a  valid date").nullable().optional(),

            supervisorName2: commonSchemas.nameStringOptional,
            supTel2: commonSchemas.mobile.optional(),
            supMob2: commonSchemas.mobile.optional(),
            supEmail2: commonSchemas.email.optional(),
            designation2: Yup.string()
            .min(2,"Min 2 chars")
            .max(30,"Max 30 chars").nullable().optional(),
            reportStartDate2: commonSchemas.datePast.nullable().optional(),
            reportEndDate2:  Yup.date() 
            .min(1900, "Enter a valid date")
            .max(3000, "Enter a  valid date").nullable().optional(),

            duties: Yup.string().max(400,"Max 400 chars").nullable().optional(),
            reasonLeaving: Yup.string()
            .max(300,"Max 300 chars").nullable().optional(),
          })
        ),

        // References - Min 2
        references: Yup.array()
          .min(2, "At least 2 references are required")
          .of(
            Yup.object().shape({
              name: Yup.string()
              .min(3, "Min 3 chars")
              .max(30, "Max 30 chars")
              .matches(/^[a-zA-Z\s]+$/, "Only letters allowed")
              .optional(),
              address: commonSchemas.addressStringOptional.label("Address"),
              tel: commonSchemas.mobile.optional(),
              mob: commonSchemas.mobile.optional(),
              email: commonSchemas.email.optional(),
              designation: Yup.string()
              .min(2,"Min 2 chars")
              .max(30,"Max 30 chars").nullable().optional(),
            })
          ),

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
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      designation: "",

      first_name: "",
      middle_name: "",
      last_name: "",
      father_name: "",
      father_middle_name: "",
      father_last_name: "",
      date_of_birth: "",
      birth_city: "",
      birth_state: "",
      country: "",
      blood_group: "",
      gender: "",
      marital_status: "",

      passport_number: "",
      passport_date_of_issue: "",
      passport_expiry_date: "",
      pan_number: "",
      aadhar_number: "",

      std_code: "",
      alternate_no: "",
      mobile_no: "",
      emergency_no: "",
      personal_email: "",

      current_residence_type: "",
      current_building_name: "",
      current_landlord_name:"",
      current_flat_house_no: "",
      current_block_street_no: "",
      current_street_name: "",
      current_city: "",
      current_district: "",
      current_post_office: "",
      current_state: "",
      current_pin_code: "",

      permanent_residence_type: "",
      permanent_building_name: "",
      permanent_flat_house_no: "",
      permanent_block_street_no: "",
      permanent_street_name: "",
      permanent_city: "",
      permanent_district: "",
      permanent_post_office: "",
      permanent_state: "",
      permanent_pin_code: "",

      educational_details: [
        {
          course: "",
          degree: "",
          institute: "",
          address: "",
          state: "",
          pin: "",
          university: "",
          universityAddress: "",
          universitystate: "",
          universitypin: "",
          startDate: "",
          endDate: "",
          status: "",
          marks: "",
          educationType: "",
          rollNo: "",
          enrollmentNo: "",
          anyOther: "",
          achievements: "",
          documentsAttached: "",
        },
      ],
      employment_details: [
        {
          companyName: "",
          address: "",
          empType: "",
          empCode: "",
          startDate: "",
          endDate: "",
          position: "",
          compensation: "",
          city: "",
          hrRep: "",
          hrTel: "",
          hrMob: "",
          hrEmail: "",
          supervisorName: "",
          supTel: "",
          supMob: "",
          supEmail: "",
          designation: "",
          reportStartDate: "",
          reportEndDate: "",
          supervisorName2: "",
          supTel2: "",
          supMob2: "",
          supEmail2: "",
          designation2: "",
          reportStartDate2: "",
          reportEndDate2: "",
          duties: "",
          reasonLeaving: "",
        },
      ],
      references: [
        { name: "", address: "", tel: "", mob: "", email: "", designation: "" },
        { name: "", address: "", tel: "", mob: "", email: "", designation: "" },
      ],
      documents_attached: [{ name: "" }],

      signature: undefined,
      isDraft: false,
    },
  });

  const {
    fields: eduFields,
  } = useFieldArray({
    control,
    name: "educational_details",
  });
  const {
    fields: empFields,
  } = useFieldArray({
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
        designation: saved.designation || base.designation ||"",
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

        passport_number: saved.passport_number || "",
        passport_date_of_issue: formatDateForAPI(saved.passport_date_of_issue),
        passport_expiry_date: formatDateForAPI(saved.passport_expiry_date),
        pan_number: saved.pan_number || base.panNo || "",
        aadhar_number: saved.aadhar_number || "",

        std_code: saved.std_code || "",
        alternate_no: saved.alternate_no || "",
        mobile_no: saved.mobile_no || base.mobileNo || "",
        emergency_no: saved.emergency_no || "",
        personal_email: saved.personal_email || base.email || "",

        // Address - simplify mapping?
        ...saved, // Spread saved address fields

        current_residence_type: saved.current_residence_type || "",
        // ... ensure defaults if needed

        educational_details:
          saved.educational_details?.length > 0
            ? saved.educational_details
            : [
                {
                  course: "",
                  degree: "",
                  institute: "",
                  address: "",
                  state: "",
                  pin: "",
                  university: "",
                  startDate: "",
                  endDate: "",
                  status: "",
                  marks: "",
                  educationType: "",
                  rollNo: "",
                  enrollmentNo: "",
                  anyOther: "",
                  achievements: "",
                  documentsAttached: "",
                },
              ],
        employment_details:
          saved.employment_details?.length > 0 ? saved.employment_details : [],
        // If empty employment, maybe default 1 empty is okay or let user add? Previous code had 1 default.
        references:
          saved.references?.length >= 2
            ? saved.references
            : [
                {
                  name: "",
                  address: "",
                  tel: "",
                  mob: "",
                  email: "",
                  designation: "",
                },
                {
                  name: "",
                  address: "",
                  tel: "",
                  mob: "",
                  email: "",
                  designation: "",
                },
              ],
      });

      if (saved.signature_path || autoFillData.signature) {
        const path = saved.signature_path || autoFillData.signature;
        setSignaturePreview(
          path.startsWith("http")
            ? path
            : `http://localhost:3001/uploads/signatures/${path}`
        );
      }
    }
  }, [autoFillData, reset]);

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
      await axios.post(
        "http://localhost:3001/api/forms/save-employee-info",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (isPreview) {
        const saved = autoFillData?.employeeInfoData || {};
        navigate("/forms/information/preview", {
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
        await showAlert("Draft Saved!", { type: 'success' });
      } else {
         // Should not reach here if logic is correct, but fallback to preview or alert
         navigate("/forms/information/preview", { state: { formData: values, signaturePreview, employeeId } });
      }
    } catch (error) {
      console.error("Submission Error:", error);
      await showAlert("Failed to save form. Check console for details.", { type: 'error' });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <FormLayout
      title="Employee Information Form"
      showPhoto={true}
      showSignature={true}
      employeeData={autoFillData}
      signaturePreview={signaturePreview}
      isLocked={isLocked}
      onSubmit={handleSubmit(onSubmit, (e) => onValidationFail(e, showAlert))}
      actions={{
        isSubmitting,
        onSaveDraft: () => {
          setValue("isDraft", true);
          setIsPreview(false);
          handleSubmit(onSubmit, (e) => onValidationFail(e, showAlert))();
        },
        onSubmit: () => {
          setValue("isDraft", true); // Save as draft first for preview
          setIsPreview(true);
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
      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded mb-6 text-sm text-blue-900 border border-blue-200">
        <h3 className="font-bold mb-2 uppercase">Personal and Confidential</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            All fields are Mandatory, where Not Applicable please specify (NA).
          </li>
          <li>
            Kindly furnish all details correctly; verification will be conducted
            based on antecedents stated.
          </li>
        </ul>
      </div>

      <FormInput
        label="Designation"
        name="designation"
        register={register}
        error={errors.designation}
        required
        disabled
      />

      <PersonalDetails
        register={register}
        errors={errors}
        autoFillData={autoFillData}
      />

      <ContactDetails register={register} errors={errors} />

      <EducationDetails
        register={register}
        errors={errors}
        eduFields={eduFields}
      />

      <EmploymentDetails
        register={register}
        errors={errors}
        empFields={empFields}
      />

      <ReferenceDetails
        register={register}
        errors={errors}
        refFields={refFields}
      />

      {/* Declaration */}
      <div className="p-4 rounded bg-gray-50 border text-sm text-gray-700 text-justify mt-6">
        <span className="font-bold block mb-2">Declaration</span>I have no
        objection, the Management of Vakrangee Ltd. to verify the information
        such as personal details, contact details, education details, criminal
        verification and previous employment details wherever applicable prior
        to my appointment. If the information given to you is not found correct
        as per my declaration, then the company can take disciplinary action
        against me.
      </div>
    </FormLayout>
  );
};

export default FormInformation;


