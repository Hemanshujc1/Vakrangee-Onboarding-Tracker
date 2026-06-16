import { MANDATORY_DOC_KEYS } from "../../../config/documentConfig";

export const isBasicInfoComplete = (employee) => {
  if (!employee) return false;
  const mandatoryFields = [
    "firstName",
    "lastName",
    "personalEmail",
    "phone",
    "gender",
    "dateOfBirth",
    "adharNumber",
    "panNumber",
    "addressLine1",
    "city",
    "district",
    "state",
    "pincode",
    "postOffice",
  ];
  return mandatoryFields.every((field) => {
    const val = employee[field];
    return val !== null && val !== undefined && String(val).trim() !== "";
  });
};

export const isEverythingReviewed = (employee, documents) => {
  if (!employee) return false;

  const isBasicInfoReviewed =
    employee.basicInfoStatus === "VERIFIED" || employee.basicInfoStatus === "REJECTED";

  const areAllDocumentsReviewed =
    documents.length > 0 &&
    documents.every(
      (doc) =>
        doc.status !== "PENDING" &&
        doc.status !== "UPLOADED" &&
        doc.status !== "SUBMITTED"
    );

  return isBasicInfoReviewed && areAllDocumentsReviewed;
};

export const isEverythingVerified = (employee, documents) => {
  if (!employee) return false;

  const isBasicInfoVerified = employee.basicInfoStatus === "VERIFIED";

  const verifiedDocs = documents.filter((doc) => doc.status === "VERIFIED");
  const areAllMandatoryDocsVerified = MANDATORY_DOC_KEYS.every((docType) =>
    verifiedDocs.some((d) => d.document_type === docType)
  );

  return isBasicInfoVerified && areAllMandatoryDocsVerified;
};
