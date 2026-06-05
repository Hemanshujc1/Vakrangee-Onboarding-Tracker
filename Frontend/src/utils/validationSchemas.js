import * as Yup from "yup";

const MAX_FILE_SIZE = 200 * 1024; // 200KB

export const commonPatterns = {
  mobile: /^[6-9]\d{9}$/,
  pincode: /^[0-9]{6}$/,
  pan: /^[A-Z]{3}P[A-Z]{1}[0-9]{4}[A-Z]{1}$/,
  aadhaar: /^[2-9]\d{11}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  passport: /^[A-Z][0-9]{7}$/,
  uan: /^\d{12}$/,
  license: /^[A-Z]{2}[-\s]?\d{2}[-\s]?\d{4}[-\s]?\d{7}$/,
  bankAccount: /^\d{9,18}$/,
  email:
    /^(?!.*\.\.)[A-Za-z0-9][A-Za-z0-9._]{0,62}[A-Za-z0-9]@(?:gmail|vakrangee|admin|hotmail|yahoo|zohomail|outlook|live|icloud|aol|proton|protonmail|rediff|zoho)\.(?:com|co\.in|io|co|in)$/,
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char, no spaces
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])\S{8,}$/,
  // Address patterns (per spec)
  address1: /^[a-zA-Z0-9\s,.\-\/]{3,100}$/, // letters, digits, space, comma, hyphen, slash
  address2: /^[a-zA-Z0-9\s.]{3,100}$/, // letters, digits, space
  landmark: /^[a-zA-Z\s.]{3,100}$/, // letters and space only
};

export const commonSchemas = {
  // --- Basic Types ---
  stringRequired: Yup.string()
    .min(2, "Minimum 2 characters required")
    .max(50, "Maximum 50 characters allowed")
    .required("Required"),

  stringOptional: Yup.string()
    .min(2, "Minimum 2 characters required")
    .max(50, "Maximum 50 characters allowed")
    .optional(),

  nameString: Yup.string()
    .min(2, "Minimum 2 characters required")
    .max(50, "Maximum 50 characters allowed")
    .matches(/^[a-zA-Z\s.-]+$/, "Only letters, dots, hyphen are allowed")
    // No 3+ consecutive repeating letters (e.g. "aaa", "bbb")
    .matches(/^(?!.*(.)\1{2,}).*$/i, "Enter Valid Name")
    // No 4+ alphabetically sequential letters (e.g. "abcd", "bcde")
    .test("no-consecutive-sequence", "Enter Valid Name", (value) => {
      if (!value) return true;
      const letters = value.toLowerCase().replace(/[^a-z]/g, "");
      for (let i = 0; i <= letters.length - 4; i++) {
        const [a, b, c, d] = [
          letters.charCodeAt(i),
          letters.charCodeAt(i + 1),
          letters.charCodeAt(i + 2),
          letters.charCodeAt(i + 3),
        ];
        if (b === a + 1 && c === a + 2 && d === a + 3) return false;
      }
      return true;
    })
    .required("Required"),

  nameStringOptional: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .min(2, "Minimum 2 characters required")
    .max(50, "Maximum 50 characters allowed")
    .matches(/^[a-zA-Z\s.-]+$/, "Only letters, dots, hyphen are allowed")
    // No 3+ consecutive repeating letters (e.g. "aaa", "bbb")
    .matches(/^(?!.*(.)\1{2,}).*$/i, "Enter Valid Name")
    // No 4+ alphabetically sequential letters (e.g. "abcd", "bcde")
    .test("no-consecutive-sequence", "Enter Valid Name", (value) => {
      if (!value) return true;
      const letters = value.toLowerCase().replace(/[^a-z]/g, "");
      for (let i = 0; i <= letters.length - 4; i++) {
        const [a, b, c, d] = [
          letters.charCodeAt(i),
          letters.charCodeAt(i + 1),
          letters.charCodeAt(i + 2),
          letters.charCodeAt(i + 3),
        ];
        if (b === a + 1 && c === a + 2 && d === a + 3) return false;
      }
      return true;
    }),

  email: Yup.string()
    .email("Invalid email address")
    .matches(commonPatterns.email, "Invalid email address")
    .required("Required"),

  emailOptional: Yup.string()
    .nullable()
    .transform((v) => (v === "" ? null : v))
    .email("Invalid email address")
    .matches(commonPatterns.email, "Invalid email address")
    .optional(),

  // --- Password ---
  password: Yup.string()
    .min(8, "Minimum 8 characters required")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/\d/, "Must contain at least one number")
    .matches(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/,
      "Must contain at least one special character",
    )
    .matches(/^\S*$/, "Password must not contain spaces")
    .required("Required"),

  // Use this for confirm-password fields (pair with Yup.ref in your schema)
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords do not match")
    .required("Required"),

  // --- Numbers & Currencies ---
  currency: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .min(0, "Must be positive")
    .max(9999999999, "Value too large"), // Max 10 digits

  numberOptional: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .optional(),

  age: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .min(0, "Invalid age")
    .max(120, "Invalid age"),

  // --- Common String Types ---

  stringOptional: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .min(2, "Min 2 characters")
    .max(50, "Max 50 characters"),

  // --- Address Lines ---
  addressString: Yup.string()
    .min(3, "Minimum 3 characters required")
    .max(100, "Maximum 100 characters allowed")
    .matches(
      commonPatterns.address1,
      "Only letters, dots, digits, spaces, commas, hyphens and slashes allowed",
    )
    .trim()
    .required("Required"),

  addressStringOptional: Yup.string()
    .nullable()
    .transform((v) => (v === "" ? null : v))
    .min(3, "Minimum 3 characters required")
    .max(100, "Maximum 100 characters allowed")
    .matches(
      commonPatterns.address2,
      "Only letters, dots, digits and spaces allowed",
    )
    .trim(),

  landmark: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .min(5, "Minimum 5 characters required")
    .max(100, "Maximum 100 characters allowed")
    .matches(commonPatterns.landmark, "Only letters, dots and spaces allowed")
    .optional(),

  country: Yup.string()
    .min(2, "Min 2 chars")
    .max(50, "Max 50 chars")
    .default("India"),

  // --- Contact IDs ---
  mobile: Yup.string()
    .matches(commonPatterns.mobile, "Enter a valid mobile number")
    .test(
      "no-repeating-digits",
      "Enter a valid mobile number",
      (val) => !val || !/^(.)\1{9}$/.test(val),
    )
    .required("Required"),
  mobileOptional: Yup.string()
    .nullable()
    .transform((v) => (v === "" ? null : v))
    .matches(
      commonPatterns.mobile,
      "Enter a valid 10-digit mobile number starting with 6-9",
    )
    .test(
      "no-repeating-digits",
      "Enter a valid mobile number",
      (val) => !val || !/^(.)\1{9}$/.test(val),
    ),

  pincode: Yup.string()
    .matches(commonPatterns.pincode, "Pincode must be 6 digits")
    .required("Required"),

  // --- Document IDs ---
  pan: Yup.string()
    .transform((value) => (value ? value.toUpperCase() : value))
    .matches(commonPatterns.pan, "Invalid PAN Format (e.g., ABCDE1234F)")
    .required("Required"),
  panOptional: Yup.string()
    .nullable()
    .transform((v) => (v === "" ? null : v ? v.toUpperCase() : v))
    .matches(commonPatterns.pan, "Invalid PAN Format (e.g., ABCDE1234F)")
    .optional(),
  aadhaar: Yup.string()
    .matches(
      commonPatterns.aadhaar,
      "Aadhaar must be 12 digits and cannot start with 0 or 1",
    )
    .test(
      "no-repeating-digits",
      "Enter a valid Aadhaar number",
      (val) => !val || !/^(.)\1{11}$/.test(val),
    )
    .required("Required"),
  aadhaarOptional: Yup.string()
    .nullable()
    .transform((v) => (v === "" ? null : v))
    .matches(
      commonPatterns.aadhaar,
      "Aadhaar must be 12 digits and cannot start with 0 or 1",
    )
    .test(
      "no-repeating-digits",
      "Enter a valid Aadhaar number",
      (val) => !val || !/^(.)\1{11}$/.test(val),
    )
    .optional(),
  uan: Yup.string().matches(commonPatterns.uan, "UAN must be 12 digits"),
  ifsc: Yup.string().matches(commonPatterns.ifsc, "Invalid IFSC Code"),
  passport: Yup.string().matches(
    commonPatterns.passport,
    "Invalid Passport Format",
  ),
  license: Yup.string().matches(
    commonPatterns.license,
    "Invalid License Format",
  ),
  bankAccount: Yup.string()
    .matches(commonPatterns.bankAccount, "Account number must be 9-18 digits")
    .required("Required"),

  // --- Dates ---
  dateRequired: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .min(new Date("1900-01-01"), "Invalid Date")
    .max(new Date(), "Date cannot be in the future")
    .typeError("Invalid Date")
    .required("Required"),

  dateOptional: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .min(new Date("1900-01-01"), "Invalid Date")
    .max(new Date("3000-01-01"), "Invalid Date")
    .typeError("Invalid Date"),

  datePast: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .min(new Date("1900-01-01"), "Invalid Date")
    .max(new Date(), "Date cannot be in the future")
    .typeError("Invalid Date")
    .required("Required"),

  datePastOptional: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .min(new Date("1900-01-01"), "Invalid Date")
    .max(new Date(), "Date cannot be in the future")
    .typeError("Invalid Date"),

  dateFuture: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
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
