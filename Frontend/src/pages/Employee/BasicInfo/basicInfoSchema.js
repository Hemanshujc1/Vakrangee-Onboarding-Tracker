import * as Yup from "yup";
import {
  commonSchemas,
  commonPatterns,
} from "../../../utils/validationSchemas";

export const basicInfoValidationSchema = Yup.object().shape({
  firstname: commonSchemas.nameString.label("First Name"),
  middlename: commonSchemas.nameString.label("Middle Name"),
  lastname: commonSchemas.nameString.label("Last Name"),
  email: commonSchemas.emailOptional.nullable(),
  personal_email_id: commonSchemas.email.label("Personal Email"),
  phone: commonSchemas.mobile.label("Phone"),
  date_of_birth: commonSchemas.datePast
    .max(
      new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
      "Must be 18 years or older",
    )
    .label("Date of Birth"),
  gender: Yup.string().required("Required"),

  // Address
  address_line1: commonSchemas.addressString.label("Address Line 1"),
  address_line2: commonSchemas.addressStringOptional.label("Address Line 2"),
  landmark: commonSchemas.landmark.nullable(),
  post_office: commonSchemas.stringRequired.label("Post Office"),
  pincode: commonSchemas.pincode.label("Pincode"),
  city: commonSchemas.stringRequired.label("City"),
  district: commonSchemas.stringRequired.label("District"),
  state: commonSchemas.stringRequired.label("State"),
  country: commonSchemas.country.label("Country"),

  // Education & IDs
  tenth_percentage: Yup.number()
    .typeError("Must be a number")
    .min(0, "Min 0")
    .max(100, "Max 100")
    .required("Required"),
  twelfth_percentage: Yup.number()
    .typeError("Must be a number")
    .min(0, "Min 0")
    .max(100, "Max 100")
    .required("Required"),
  adhar_number: commonSchemas.aadhaar.label("Aadhaar Number"),
  pan_number: commonSchemas.pan.label("PAN Number"),
  degree_name: commonSchemas.stringRequired.label("Degree Name"),
  degree_percentage: Yup.number()
    .typeError("Must be a number")
    .min(0, "Min 0")
    .max(100, "Max 100")
    .required("Required"),
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
