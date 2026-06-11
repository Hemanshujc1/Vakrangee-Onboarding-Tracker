import * as Yup from "yup";
import {
  commonSchemas,
} from "../../../utils/validationSchemas";

// ── Address block helper: builds Yup fields for one address block ──────────────
// prefix: "perm_" | "comm_"
// isRequired: true for permanent, conditional for communication
const addressFields = (prefix, isRequired) => {
  const req = (schema) => (isRequired ? schema : schema.optional().nullable());
  return {
    [`${prefix}address_line1`]: isRequired
      ? commonSchemas.addressString.label("Address Line 1")
      : Yup.string()
          .nullable()
          .transform((v) => (v === "" ? null : v))
          .min(3, "Minimum 3 characters required")
          .max(200, "Maximum 200 characters allowed")
          .when("comm_same_as_permanent", {
            is: false,
            then: (s) => s.required("Required"),
            otherwise: (s) => s.nullable().optional(),
          }),
    [`${prefix}address_line2`]: commonSchemas.addressStringOptional.label("Address Line 2"),
    [`${prefix}landmark`]: commonSchemas.landmark.nullable().label("Landmark"),
    [`${prefix}post_office`]: isRequired
      ? commonSchemas.stringRequired.label("Post Office")
      : Yup.string()
          .nullable()
          .transform((v) => (v === "" ? null : v))
          .when("comm_same_as_permanent", {
            is: false,
            then: (s) => s.required("Required").min(2, "Min 2 chars"),
            otherwise: (s) => s.nullable().optional(),
          }),
    [`${prefix}pincode`]: isRequired
      ? commonSchemas.pincode.label("Pincode")
      : Yup.string()
          .nullable()
          .transform((v) => (v === "" ? null : v))
          .when("comm_same_as_permanent", {
            is: false,
            then: (s) =>
              s.matches(/^[0-9]{6}$/, "Pincode must be 6 digits").required("Required"),
            otherwise: (s) => s.nullable().optional(),
          }),
    [`${prefix}city`]: isRequired
      ? commonSchemas.stringRequired.label("City")
      : Yup.string()
          .nullable()
          .transform((v) => (v === "" ? null : v))
          .when("comm_same_as_permanent", {
            is: false,
            then: (s) => s.required("Required").min(2, "Min 2 chars"),
            otherwise: (s) => s.nullable().optional(),
          }),
    [`${prefix}district`]: isRequired
      ? commonSchemas.stringRequired.label("District")
      : Yup.string()
          .nullable()
          .transform((v) => (v === "" ? null : v))
          .when("comm_same_as_permanent", {
            is: false,
            then: (s) => s.required("Required").min(2, "Min 2 chars"),
            otherwise: (s) => s.nullable().optional(),
          }),
    [`${prefix}state`]: isRequired
      ? commonSchemas.stringRequired.label("State")
      : Yup.string()
          .nullable()
          .transform((v) => (v === "" ? null : v))
          .when("comm_same_as_permanent", {
            is: false,
            then: (s) => s.required("Required").min(2, "Min 2 chars"),
            otherwise: (s) => s.nullable().optional(),
          }),
    [`${prefix}country`]: commonSchemas.country.label("Country"),
  };
};

export const basicInfoValidationSchema = Yup.object().shape({
  // ── Personal Info ────────────────────────────────────────────────────────────
  firstname: commonSchemas.nameString.label("First Name"),
  middlename: commonSchemas.nameStringOptional.label("Middle Name"),
  lastname: commonSchemas.nameString.label("Last Name"),
  date_of_birth: commonSchemas.datePast
    .max(
      new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
      "Must be 18 years or older"
    )
    .label("Date of Birth"),
  blood_group: Yup.string().required("Required").label("Blood Group"),
  gender: Yup.string().required("Required"),
  adhar_number: commonSchemas.aadhaar.label("Aadhaar Number"),
  pan_number: commonSchemas.pan.label("PAN Number"),

  // ── Contact Info ─────────────────────────────────────────────────────────────
  email: commonSchemas.emailOptional.nullable(),
  personal_email_id: commonSchemas.email.label("Personal Email"),
  phone: commonSchemas.mobile.label("Phone"),
  emergency_contact_name: commonSchemas.nameString
    .required("Required")
    .label("Emergency Contact Name"),
  emergency_contact_relationship: Yup.string()
    .required("Required")
    .label("Emergency Contact Relationship"),
  emergency_contact_number: Yup.string()
    .required("Required")
    .matches(/^[0-9]{10}$/, { message: "Invalid phone number", excludeEmptyString: true })
    .label("Emergency Contact Number"),

  // ── Permanent Address (always required) ──────────────────────────────────────
  ...addressFields("perm_", true),

  // ── Communication Address (required only when not same as permanent) ──────────
  comm_same_as_permanent: Yup.boolean().default(false),
  ...addressFields("comm_", false),

  // ── Academic Details ─────────────────────────────────────────────────────────
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
  degree_name: commonSchemas.stringRequired.label("Degree Name"),
  degree_percentage: Yup.number()
    .typeError("Must be a number")
    .min(0, "Min 0")
    .max(100, "Max 100")
    .required("Required"),
});

export const defaultBasicInfoValues = {
  // Personal Info
  firstname: "",
  middlename: "",
  lastname: "",
  date_of_birth: "",
  gender: "",
  blood_group: "",
  adhar_number: "",
  pan_number: "",

  // Contact Info
  email: "",
  personal_email_id: "",
  phone: "",
  emergency_contact_name: "",
  emergency_contact_relationship: "",
  emergency_contact_number: "",

  // Job Info (read-only, no validation)
  job_title: "",
  department_name: "",
  date_of_joining: "",

  // Permanent Address
  perm_address_line1: "",
  perm_address_line2: "",
  perm_landmark: "",
  perm_post_office: "",
  perm_pincode: "",
  perm_city: "",
  perm_district: "",
  perm_state: "",
  perm_country: "India",

  // Communication Address
  comm_same_as_permanent: false,
  comm_address_line1: "",
  comm_address_line2: "",
  comm_landmark: "",
  comm_post_office: "",
  comm_pincode: "",
  comm_city: "",
  comm_district: "",
  comm_state: "",
  comm_country: "India",

  // Academic Details
  tenth_percentage: "",
  twelfth_percentage: "",
  degree_name: "",
  degree_percentage: "",
};

export const fieldToSectionMap = {
  // Personal Info → identity section
  firstname: "identity",
  middlename: "identity",
  lastname: "identity",
  date_of_birth: "identity",
  blood_group: "identity",
  gender: "identity",
  pan_number: "identity",
  adhar_number: "identity",

  // Contact Info → contact section
  email: "contact",
  personal_email_id: "contact",
  phone: "contact",
  emergency_contact_name: "contact",
  emergency_contact_relationship: "contact",
  emergency_contact_number: "contact",

  // Permanent Address → address section
  perm_address_line1: "address",
  perm_address_line2: "address",
  perm_landmark: "address",
  perm_post_office: "address",
  perm_pincode: "address",
  perm_city: "address",
  perm_district: "address",
  perm_state: "address",
  perm_country: "address",

  // Communication Address → address section
  comm_same_as_permanent: "address",
  comm_address_line1: "address",
  comm_address_line2: "address",
  comm_landmark: "address",
  comm_post_office: "address",
  comm_pincode: "address",
  comm_city: "address",
  comm_district: "address",
  comm_state: "address",
  comm_country: "address",

  // Academic Details → academic section
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
