import * as Yup from "yup";
import { commonPatterns } from "./patterns";

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
    .max(200, "Maximum 200 characters allowed")
    .matches(
      commonPatterns.address1,
      "Only letters, digits, space, comma, hyphen, slash, brackets allowed",
    )
    .trim()
    .required("Required"),

  addressStringOptional: Yup.string()
    .nullable()
    .transform((v) => (v === "" ? null : v))
    .min(3, "Minimum 3 characters required")
    .max(200, "Maximum 200 characters allowed")
    .matches(
      commonPatterns.address2,
      "Only letters, digits, space, comma, hyphen, slash, brackets allowed",
    )
    .trim(),

  landmark: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .min(5, "Minimum 5 characters required")
    .max(200, "Maximum 200 characters allowed")
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
