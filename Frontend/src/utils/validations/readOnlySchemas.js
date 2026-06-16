import * as Yup from "yup";

export const readOnlySchemas = {
  stringRequired: Yup.string().required("Required"),
  stringOptional: Yup.string().optional(),
  nameString: Yup.string().required("Required"),
  nameStringOptional: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  email: Yup.string().required("Required"),
  emailOptional: Yup.string()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  addressString: Yup.string().required("Required"),
  addressStringOptional: Yup.string()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  landmark: Yup.string()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  country: Yup.string().default("India"),
  mobile: Yup.string().required("Required"),
  mobileOptional: Yup.string()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  pincode: Yup.string().required("Required"),
  pan: Yup.string().required("Required"),
  panOptional: Yup.string()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  aadhaar: Yup.string().required("Required"),
  aadhaarOptional: Yup.string()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  uan: Yup.string().optional(),
  ifsc: Yup.string().optional(),
  passport: Yup.string().optional(),
  license: Yup.string().optional(),
  bankAccount: Yup.string().required("Required"),
  dateRequired: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .required("Required"),
  dateOptional: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  datePast: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .required("Required"),
  datePastOptional: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  dateFuture: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .required("Required"),
  currency: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable(),
  numberOptional: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .optional(),
  age: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable(),
};
