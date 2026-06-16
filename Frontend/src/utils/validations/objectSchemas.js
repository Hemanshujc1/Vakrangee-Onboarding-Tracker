import * as Yup from "yup";
import { commonSchemas } from "./commonSchemas";
import { MAX_FILE_SIZE } from "./patterns";

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
