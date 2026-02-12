import * as Yup from "yup";
import { commonSchemas, createSignatureSchema } from "../../../utils/formDependencies";

export const getValidationSchema = (hasSavedSignature) =>
  Yup.object().shape({
    // Personal Info
    firstname: commonSchemas.nameString.label("First Name"),
    lastname: commonSchemas.nameString.label("Last Name"),
    middlename: commonSchemas.nameStringOptional.label("Middle Name"),
    Maidenname: commonSchemas.nameStringOptional.label("Maiden Name"),
    currentAddress: commonSchemas.addressString.label("Current Address"),
    permanentAddress: commonSchemas.addressString.label("Permanent Address"),
    mobileNo: commonSchemas.mobile,
    alternateNo: commonSchemas.mobile,
    email: commonSchemas.email,
    emergencyNo: commonSchemas.mobile,
    gender: commonSchemas.stringRequired,
    dob: commonSchemas.datePast,

    // Conditional Documents
    hasPan: Yup.string().oneOf(["Yes", "No"]),
    panNo: Yup.string().when("hasPan", {
      is: "Yes",
      then: (schema) => commonSchemas.pan.required("Required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    hasLicense: Yup.string().oneOf(["Yes", "No"]),
    licenseNo: Yup.string().when("hasLicense", {
      is: "Yes",
      then: (schema) => commonSchemas.license.required("Required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    licenseIssueDate: Yup.date()
      .nullable()
      .transform((v, ov) => (ov === "" ? null : v))
      .when("hasLicense", {
        is: "Yes",
        then: (schema) => commonSchemas.datePast.required("Required"),
        otherwise: (schema) => schema.notRequired(),
      }),
    licenseExpiryDate: Yup.date()
      .nullable()
      .transform((v, ov) => (ov === "" ? null : v))
      .when("hasLicense", {
        is: "Yes",
        then: (schema) => commonSchemas.dateFuture.required("Required"),
        otherwise: (schema) => schema.notRequired(),
      }),

    hasPassport: Yup.string().oneOf(["Yes", "No"]),
    passportNo: Yup.string().when("hasPassport", {
      is: "Yes",
      then: (schema) => commonSchemas.passport.required("Required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    passportIssueDate: Yup.date()
      .nullable()
      .transform((v, ov) => (ov === "" ? null : v))
      .when("hasPassport", {
        is: "Yes",
        then: (schema) => commonSchemas.datePast.required("Required"),
        otherwise: (schema) => schema.notRequired(),
      }),
    passportExpiryDate: Yup.date()
      .nullable()
      .transform((v, ov) => (ov === "" ? null : v))
      .when("hasPassport", {
        is: "Yes",
        then: (schema) => commonSchemas.dateFuture.required("Required"),
        otherwise: (schema) => schema.notRequired(),
      }),

    // Arrays
    education: Yup.array()
      .min(1, "At least one education entry is required")
      .max(5, "Max 5 entries")
      .of(
        Yup.object().shape({
          qualification: commonSchemas.stringRequired,
          institute: commonSchemas.stringRequired,
          year: commonSchemas.numberOptional
            .min(1900)
            .max(new Date().getFullYear())
            .required("Required"),
          percentage: commonSchemas.numberOptional
            .min(0)
            .max(100)
            .required("Required"),
          location: Yup.string(),
        })
      ),

    otherTraining: Yup.array()
      .max(4)
      .of(
        Yup.object().shape({
          institute: Yup.string(),
          location: Yup.string(),
          duration: Yup.string(),
          details: Yup.string(),
        })
      ),

    achievements: Yup.array()
      .max(4)
      .of(
        Yup.object().shape({
          year: commonSchemas.numberOptional
            .min(1900)
            .max(new Date().getFullYear()),
          details: Yup.string(),
        })
      ),
    employmentHistory: Yup.array()
      .max(5)
      .of(
        Yup.object().shape({
          employer: commonSchemas.stringOptional,
          designation: commonSchemas.stringOptional,
          fromDate: commonSchemas.datePastOptional,
          toDate: commonSchemas.dateOptional,
          ctc: commonSchemas.currency,
          reportingOfficer: Yup.string(),
        })
      ),
    workExperience: Yup.array().of(
      Yup.object().shape({
        employer: commonSchemas.stringOptional,
        designation: commonSchemas.stringOptional,
        turnover: commonSchemas.currency,
        noOfEmployees: commonSchemas.numberOptional,
        joiningCTC: commonSchemas.currency.optional(),
        currentCTC: commonSchemas.currency.optional(),
        expectedSalary: commonSchemas.currency.optional(),
        noticePeriod: commonSchemas.numberOptional,
        joiningDate: commonSchemas.dateOptional,
      })
    ),
    references: Yup.array()
      .max(2)
      .of(
        Yup.object().shape({
          name: commonSchemas.nameStringOptional,
          company: commonSchemas.stringOptional,
          contact: commonSchemas.mobileOptional,
          position: Yup.string(),
          address: commonSchemas.addressStringOptional,
        })
      ),

    family: Yup.array().of(
      Yup.object().shape({
        name: commonSchemas.nameStringOptional,
        relationship: commonSchemas.stringOptional,
        age: commonSchemas.age.optional(),
        occupation: Yup.string(),
      })
    ),

    languages: Yup.array()
      .max(4)
      .of(
        Yup.object().shape({
          language: commonSchemas.stringOptional,
          speak: Yup.boolean(),
          read: Yup.boolean(),
          write: Yup.boolean(),
        })
      ),

    // Signature
    signature: createSignatureSchema(hasSavedSignature),
  });

export const defaultValues = {
  firstname: "",
  middlename: "",
  lastname: "",
  Maidenname: "",
  currentAddress: "",
  permanentAddress: "",
  mobileNo: "",
  alternateNo: "",
  email: "",
  emergencyNo: "",
  gender: "",
  age: "",
  dob: "",
  positionApplied: "",
  currentlyEmployed: "No",
  // Arrays
  education: [
    {
      qualification: "",
      institute: "",
      year: "",
      percentage: "",
      location: "",
    },
  ],
  otherTraining: [],
  achievements: [],
  family: [],
  languages: [{ language: "", speak: false, read: false, write: false }],
  workExperience: [
    {
      employer: "",
      designation: "",
      joiningCTC: "",
      currentCTC: "",
      responsibilities: "",
      reasonLeaving: "",
    },
  ], // Default one entry
  employmentHistory: [],
  references: [
    { name: "", position: "", company: "", address: "", contact: "" },
    { name: "", position: "", company: "", address: "", contact: "" },
  ],

  // Documents
  hasLicense: "No",
  licenseNo: "",
  licenseIssueDate: "",
  licenseExpiryDate: "",
  hasPassport: "No",
  passportNo: "",
  passportIssueDate: "",
  passportExpiryDate: "",
  hasPan: "No",
  panNo: "",

  // Habits
  smoking: "No",
  tobacco: "No",
  liquor: "No",

  // Q&A
  careerObjectives: "",
  majorAchievements: "",
  disability: "",
  interviewedBefore: "",
  hobbies: "",
  conviction: "",

  isDraft: false,
  signature: undefined,
};
