import * as Yup from "yup";

const MAX_FILE_SIZE = 200 * 1024; // 200KB

export const commonSchemas = {
  // Strings
  stringRequired: Yup.string()
  .min(3, "Minimum 3 characters required")
  .max(25, "Maximum 25 characters are allowed")
  .required("Required"),
  nameString: Yup.string()
    .min(3, "Minimum 3 characters required")
    .max(30, "Maximum 30 characters are allowed")
    .matches(/^[a-zA-Z\s]+$/, "Only letters allowed'")
    .required("Required"),
  
  // Contact & Address
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .required("Required"),
  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .required("Required"),
  uan: Yup.string()
    .matches(/^\d{12}$/, "UAN must be 12 digits"),
  email: Yup.string().email("Invalid email").required("Required"),
  pincode: Yup.string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .required("Required"),
  
  // Documents
  pan: Yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN Card Number"),
  panNo: Yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN Card Number"),
  license: Yup.string().matches(/^[A-Z]{2}[-\s]?\d{2}[-\s]?\d{4}[-\s]?\d{7}$/, "Invalid License Format (e.g. MH-12 20120001234)"),
  passport: Yup.string().matches(/^[A-Z][0-9]{7}$/, "Invalid Passport Number (e.g. A1234567)"),
  passportNo: Yup.string().matches(/^[A-Z][0-9]{7}$/, "Invalid Passport Number (e.g. A1234567)"),
  aadhaar: Yup.string().matches(/^\d{12}$/, "Aadhaar must be 12 digits"),
  aadhaarNo: Yup.string().matches(/^\d{12}$/, "Aadhaar must be 12 digits"),
  ifsc: Yup.string().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC Code"),
  ifscCode: Yup.string().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC Code"),
  
  // Dates
  dateRequired: Yup.date()
    .min(1900, "Enter a valid year")
    .max(new Date(), "Date cannot be in the future")
    .required("Required"),
  datePast: Yup.date()
    .min(1900, "Enter a valid year")
    .max(new Date(), "Date cannot be in the future")
    .required("Required"),
  dateFuture: Yup.date()
    .min(new Date(), "Invalid Date")
    .max(3000, "Enter a valid year")
    .required("Required"),
};

export const createSignatureSchema = (hasSavedSignature) => {
  return Yup.mixed()
    .nullable()
    .optional()
    .test("required", "Signature is required", (value) => {
      if (value instanceof File) return true;
      if (hasSavedSignature) return true;
      if (!value) return false;
      return true;
    })
    .test("fileSize", "File too large (max 200KB)", (value) => {
      if (value instanceof File) return value.size <= MAX_FILE_SIZE;
      return true;
    });
};
