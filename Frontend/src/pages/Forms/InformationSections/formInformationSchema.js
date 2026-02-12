import * as Yup from "yup";
import { commonSchemas, createSignatureSchema } from "../../../utils/formDependencies";

export const getValidationSchema = (hasSavedSignature) =>
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
    passport_number: commonSchemas.passport
      .nullable()
      .transform((value) => (value === "" ? null : value))
      .optional(),
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
          .min(1900, "Enter a valid date")
          .max(3000, "Enter a vlaid date")
          .required("Required"),
        status: Yup.string().required("Required"),
        marks: Yup.number()
          .min(0, "Enter a valid number")
          .max(100, "Enter a valid number")
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
          .nullable()
          .transform((v) => (v === "" ? null : v))
          .optional()
          .min(2, "Min 2 chars")
          .max(30, "Max 30 chars"),
        address: commonSchemas.addressStringOptional.label("Address"),
        empType: Yup.string().nullable().optional(),
        empCode: Yup.string().optional(),
        startDate: Yup.string().nullable().optional(),
        endDate: Yup.string().nullable().optional(),
        position: Yup.string()
          .nullable()
          .transform((value) => (value === "" ? null : value))
          .min(2, "Min 2 chars")
          .max(30, "Max 30 chars"),
        compensation: commonSchemas.currency.optional(),
        city: Yup.string()
          .nullable()
          .transform((value) => (value === "" ? null : value))
          .min(3, "Min 3 chars")
          .max(40, "Max 40 chars"),

        hrRep: commonSchemas.nameStringOptional,
        hrTel: commonSchemas.mobileOptional,
        hrMob: commonSchemas.mobileOptional,
        hrEmail: commonSchemas.emailOptional,

        supervisorName: commonSchemas.nameStringOptional,
        supTel: commonSchemas.mobileOptional,
        supMob: commonSchemas.mobileOptional,
        supEmail: commonSchemas.emailOptional,
        designation: Yup.string()
          .nullable()
          .transform((value) => (value === "" ? null : value))
          .min(2, "Min 2 chars")
          .max(30, "Max 30 chars"),
        reportStartDate: commonSchemas.datePastOptional,
        reportEndDate: commonSchemas.dateOptional,

        supervisorName2: commonSchemas.nameStringOptional,
        supTel2: commonSchemas.mobileOptional,
        supMob2: commonSchemas.mobileOptional,
        supEmail2: commonSchemas.emailOptional,
        designation2: Yup.string()
          .nullable()
          .transform((value) => (value === "" ? null : value))
          .min(2, "Min 2 chars")
          .max(30, "Max 30 chars"),
        reportStartDate2: commonSchemas.datePastOptional,
        reportEndDate2: commonSchemas.dateOptional,
        duties: Yup.string()
          .max(400, "Max 400 chars")
          .nullable()
          .optional(),
        reasonLeaving: Yup.string()
          .max(300, "Max 300 chars")
          .nullable()
          .optional(),
      })
    ),

    // References - Min 2
    references: Yup.array()
      .max(2, "At Max 2 references are required")
      .of(
        Yup.object().shape({
          name: commonSchemas.nameStringOptional,
          address: commonSchemas.addressStringOptional.label("Address"),
          tel: commonSchemas.mobileOptional,
          mob: commonSchemas.mobileOptional,
          email: commonSchemas.emailOptional,
          designation: Yup.string()
            .nullable()
            .transform((value) => (value === "" ? null : value))
            .min(2, "Min 2 chars")
            .max(30, "Max 30 chars"),
        })
      ),

    signature: Yup.mixed().when("isDraft", {
      is: true,
      then: (schema) => Yup.mixed().nullable().optional(),
      otherwise: (schema) => createSignatureSchema(hasSavedSignature),
    }),
  });

export const defaultValues = {
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
  current_landlord_name: "",
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
};
