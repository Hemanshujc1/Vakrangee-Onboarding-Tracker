import * as Yup from "yup";
import { commonSchemas, commonPatterns } from "../../../utils/validationSchemas";

export const basicInfoValidationSchema = Yup.object().shape({
  firstname: commonSchemas.nameStringOptional.label("First Name"),
  middlename: commonSchemas.nameStringOptional.label("Middle Name"),
  lastname: commonSchemas.nameStringOptional.label("Last Name"),
  email: commonSchemas.emailOptional.nullable(),
  personal_email_id: commonSchemas.emailOptional.nullable(),
  phone: commonSchemas.mobileOptional.label("Phone"),
  date_of_birth: commonSchemas.datePastOptional
    .max(
      new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
      "Must be 18 years or older"
    )
    .label("Date of Birth"),
  gender: Yup.string().nullable().optional(),

  // Address
  address_line1: commonSchemas.addressStringOptional.label("Address Line 1"),
  address_line2: commonSchemas.addressStringOptional.label("Address Line 2"),
  landmark: commonSchemas.landmark.nullable(),
  post_office: commonSchemas.stringOptional.label("Post Office").nullable(),
  pincode: Yup.string()
    .nullable()
    .test(
      "valid-pincode",
      "Pincode must be 6 digits",
      (val) => !val || commonPatterns.pincode.test(val)
    ),
  city: commonSchemas.stringOptional.nullable(),
  district: commonSchemas.stringOptional.nullable(),
  state: commonSchemas.stringOptional.nullable(),
  country: commonSchemas.country.nullable().optional(),

  // Education & IDs
  tenth_percentage: Yup.number()
    .typeError("Must be a number")
    .min(0, "Min 0")
    .max(100, "Max 100")
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    ),
  twelfth_percentage: Yup.number()
    .typeError("Must be a number")
    .min(0, "Min 0")
    .max(100, "Max 100")
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    ),
  adhar_number: Yup.string()
    .nullable()
    .test(
      "valid-aadhaar",
      "Aadhaar must be 12 digits",
      (val) => !val || commonPatterns.aadhaar.test(val)
    ),
  pan_number: Yup.string()
    .nullable()
    .transform((value) => (value ? value.toUpperCase() : value))
    .test(
      "valid-pan",
      "Invalid PAN Format",
      (val) => !val || commonPatterns.pan.test(val)
    ),
  degree_name: Yup.string().nullable().optional(),
  degree_percentage: Yup.number()
    .typeError("Must be a number")
    .min(0, "Min 0")
    .max(100, "Max 100")
    .nullable()
    .optional()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    ),
});

export const defaultBasicInfoValues = {
  firstname: "",
  middlename: "",
  lastname: "",
  email: "",
  personal_email_id: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  job_title: "",
  department_name: "",
  work_location: "",
  date_of_joining: "",
  address_line1: "",
  address_line2: "",
  landmark: "",
  post_office: "",
  pincode: "",
  city: "",
  district: "",
  state: "",
  country: "India",
  tenth_percentage: "",
  twelfth_percentage: "",
  degree_name: "",
  degree_percentage: "",
  adhar_number: "",
  pan_number: "",
};

export const fieldToSectionMap = {
  firstname: "identity",
  middlename: "identity",
  lastname: "identity",
  date_of_birth: "identity",
  gender: "identity",
  pan_number: "identity",
  adhar_number: "identity",
  
  email: "contact",
  personal_email_id: "contact",
  phone: "contact",
  
  address_line1: "address",
  address_line2: "address",
  landmark: "address",
  post_office: "address",
  pincode: "address",
  city: "address",
  district: "address",
  state: "address",
  country: "address",
  
  tenth_percentage: "academic",
  twelfth_percentage: "academic",
  degree_name: "academic",
  degree_percentage: "academic",
};

export const formSections = [
  { id: "identity", title: "Personal Details & Identity" },
  { id: "job", title: "Job Information" },
  { id: "contact", title: "Contact Information" },
  { id: "address", title: "Address Information" },
  { id: "academic", title: "Academic Details" },
  { id: "financial", title: "Financial & HR Documents" },
  { id: "signature", title: "Signature" },
];
