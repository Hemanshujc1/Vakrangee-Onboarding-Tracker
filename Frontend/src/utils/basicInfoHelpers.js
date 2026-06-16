import { MANDATORY_DOC_KEYS, DOCUMENT_CONFIG } from "../config/documentConfig";

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatForDateInput = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isDocGroupComplete = (section, getDocStatus) => {
  const mandatoryDocsForSection = DOCUMENT_CONFIG
    .filter((d) => !d.optional && d.section === section)
    .map((d) => d.key);
  return mandatoryDocsForSection.every((key) => getDocStatus(key).status !== "PENDING");
};

export const getSectionStatus = (
  sectionId,
  { formData, getDocStatus, panVerified },
) => {
  switch (sectionId) {
    case "photo":
      return isDocGroupComplete("photo", getDocStatus);

    case "identity":
      return !!(
        formData.firstname &&
        formData.lastname &&
        formData.date_of_birth &&
        formData.blood_group &&
        formData.pan_number &&
        formData.adhar_number &&
        panVerified &&
        isDocGroupComplete("identity", getDocStatus)
      );

    case "job":
      return true;

    case "contact":
      return !!(
        formData.personal_email_id &&
        formData.phone &&
        formData.emergency_contact_name &&
        formData.emergency_contact_relationship &&
        formData.emergency_contact_number
      );

    case "address":
      return !!(
        formData.perm_address_line1 &&
        formData.perm_city &&
        formData.perm_district &&
        formData.perm_state &&
        formData.perm_pincode &&
        formData.perm_post_office
      );

    case "academic":
      return !!(
        formData.tenth_percentage &&
        formData.twelfth_percentage &&
        formData.degree_name &&
        formData.degree_percentage &&
        isDocGroupComplete("academic", getDocStatus)
      );

    case "financial":
      return isDocGroupComplete("financial", getDocStatus);

    case "signature":
      return isDocGroupComplete("signature", getDocStatus);

    default:
      return false;
  }
};

export const isProfileComplete = ({
  formData,
  documents,
  previewImage,
  previewSignature,
  panVerified,
}) => {
  const requiredFields = [
    "firstname",
    "lastname",
    "personal_email_id",
    "phone",
    "date_of_birth",
    "gender",
    "adhar_number",
    "pan_number",
    "degree_name",
    "degree_percentage",
    "blood_group",
    "emergency_contact_name",
    "emergency_contact_relationship",
    "emergency_contact_number",
    "perm_address_line1",
    "perm_city",
    "perm_district",
    "perm_state",
    "perm_pincode",
    "perm_post_office",
  ];

  for (const field of requiredFields) {
    if (!formData[field]) return false;
  }

  if (!formData.comm_same_as_permanent) {
    const commFields = [
      "comm_address_line1",
      "comm_city",
      "comm_district",
      "comm_state",
      "comm_pincode",
      "comm_post_office",
    ];
    for (const field of commFields) {
      if (!formData[field]) return false;
    }
  }

  for (const docKey of MANDATORY_DOC_KEYS) {
    const doc = documents.find((d) => d.document_type === docKey);
    if (!doc || doc.status === "REJECTED") return false;
  }

  if (!previewImage) return false;
  if (!previewSignature) return false;
  if (!panVerified) return false;

  return true;
};
