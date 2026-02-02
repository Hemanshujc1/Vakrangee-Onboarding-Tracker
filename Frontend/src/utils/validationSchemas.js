import * as Yup from "yup";

const MAX_FILE_SIZE = 200 * 1024; // 200KB

export const commonPatterns = {
  mobile: /^[0-9]{10}$/,
  pincode: /^[0-9]{6}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  aadhaar: /^\d{12}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  passport: /^[A-Z][0-9]{7}$/,
  uan: /^\d{12}$/,
  license: /^[A-Z]{2}[-\s]?\d{2}[-\s]?\d{4}[-\s]?\d{7}$/,
  bankAccount: /^\d{9,18}$/,
};

export const commonSchemas = {
  // --- Basic Types ---
  stringRequired: Yup.string()
    .min(2, "Minimum 2 characters required")
    .max(50, "Maximum 50 characters allowed")
    .required("Required"),
  
  nameString: Yup.string()
    .min(2, "Minimum 2 characters required")
    .max(50, "Maximum 50 characters allowed") 
    .matches(/^[a-zA-Z\s.]+$/, "Only letters and dots allowed")
    .required("Required"),

    nameStringOptional: Yup.string()
    .min(2, "Minimum 2 characters required")
    .max(50, "Maximum 50 characters allowed") 
    .matches(/^[a-zA-Z\s.]+$/, "Only letters and dots allowed")
    .optional(),


  email: Yup.string().email("Invalid email").required("Required"),

  // --- Numbers & Currencies ---
  currency: Yup.number()
    .transform((value) => (isNaN(value) ? null : value))
    .nullable()
    .min(0, "Must be positive")
    .max(9999999999, "Value too large"), // Max 10 digits

  age: Yup.number()
    .transform((value) => (isNaN(value) ? null : value))
    .nullable()
    .min(0, "Invalid age")
    .max(120, "Invalid age"),

  // --- Common String Types ---
  stringOptional: Yup.string()
    .min(2, "Min 2 characters")
    .max(50, "Max 50 characters")
    .nullable()
    .optional(),
    
  landmark: Yup.string()
    .min(3, "Min 3 chars")
    .max(100, "Max 100 chars")
    .nullable()
    .optional(),
    
  country: Yup.string()
    .min(2, "Min 2 chars")
    .max(50, "Max 50 chars")
    .default("India"),

  // --- Address Lines ---
  addressString: Yup.string()
    .min(5, "Min 5 characters")
    .max(150, "Max 150 characters")
    .trim()
    .required("Required"),

  addressStringOptional: Yup.string()
    .min(5, "Min 5 characters")
    .max(150, "Max 150 characters")
    .trim()
    .nullable()
    .optional(),

  // --- Contact IDs ---
  mobile: Yup.string()
    .matches(commonPatterns.mobile, "Mobile number must be 10 digits")
    .required("Required"),
  
  pincode: Yup.string()
    .matches(commonPatterns.pincode, "Pincode must be 6 digits")
    .required("Required"),

  // --- Document IDs ---
  pan: Yup.string().matches(commonPatterns.pan, "Invalid PAN Format (e.g., ABCDE1234F)"),
  aadhaar: Yup.string().matches(commonPatterns.aadhaar, "Aadhaar must be 12 digits"),
  uan: Yup.string().matches(commonPatterns.uan, "UAN must be 12 digits"),
  ifsc: Yup.string().matches(commonPatterns.ifsc, "Invalid IFSC Code"),
  passport: Yup.string().matches(commonPatterns.passport, "Invalid Passport Format"),
  license: Yup.string().matches(commonPatterns.license, "Invalid License Format"),
  bankAccount: Yup.string()
    .matches(commonPatterns.bankAccount, "Account number must be 9-18 digits")
    .required("Required"),

  // --- Dates ---
  dateRequired: Yup.date()
    .min(new Date("1900-01-01"), "Invalid Date")
    .max(new Date(), "Date cannot be in the future")
    .typeError("Invalid Date")
    .required("Required"),
  
  datePast: Yup.date()
    .min(new Date("1900-01-01"), "Invalid Date")
    .max(new Date(), "Date cannot be in the future")
    .typeError("Invalid Date")
    .required("Required"),

  dateFuture: Yup.date()
    .min(new Date(), "Date must be in the future")
    .max(new Date("2100-01-01"), "Invalid Date")
    .typeError("Invalid Date")
    .required("Required"),
};

// --- Reusable Objects ---

export const addressSchema = Yup.object().shape({
  address_line1: commonSchemas.addressString,
  address_line2: commonSchemas.addressStringOptional,
  city: commonSchemas.stringRequired,
  district: commonSchemas.stringRequired,
  state: commonSchemas.stringRequired,
  pincode: commonSchemas.pincode,
  country: Yup.string().default("India"),
});

export const educationSchema = Yup.object().shape({
  degree: commonSchemas.stringRequired,
  university: commonSchemas.stringRequired,
  passing_year: Yup.string()
    .matches(/^(19|20)\d{2}$/, "Invalid Year")
    .required("Required"),
  percentage: Yup.number()
    .min(0, "Min 0")
    .max(100, "Max 100")
    .required("Required"),
  grade: Yup.string().max(10, "Max 10 chars").required("Required"),
});

export const familyMemberSchema = Yup.object().shape({
  name: commonSchemas.nameString,
  relationship: commonSchemas.stringRequired,
  dob: commonSchemas.datePast,
  age: commonSchemas.age,
  occupation: Yup.string().max(30).nullable(),
});

export const employmentSchema = Yup.object().shape({
  company_name: commonSchemas.stringRequired,
  designation: commonSchemas.stringRequired,
  from_date: commonSchemas.dateRequired,
  to_date: commonSchemas.dateRequired,
  address: Yup.string().max(100).nullable(),
});

export const createSignatureSchema = (hasSavedSignature) => {
  return Yup.mixed()
    .nullable()
    .optional()
    .test("required", "Signature is required", (value) => {
      if (hasSavedSignature) return true; // Already saved on server
      if (value instanceof File) return true; // New file uploaded
      return false; // Neither
    })
    .test("fileSize", "File too large (max 200KB)", (value) => {
      if (value instanceof File) return value.size <= MAX_FILE_SIZE;
      return true;
    });
};
