import { MANDATORY_DOC_KEYS, isDocMandatory } from "../config/documentConfig";

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getSectionStatus = (sectionId, { formData, getDocStatus, panVerified }) => {
  switch (sectionId) {
    case "photo":
      return getDocStatus("Passport Size Photo").status !== "PENDING";

    case "identity":
      return !!(
        formData.firstname &&
        formData.lastname &&
        formData.date_of_birth &&
        formData.blood_group &&
        formData.pan_number &&
        formData.adhar_number &&
        panVerified &&
        getDocStatus("PAN Card").status !== "PENDING" &&
        getDocStatus("Aadhar Card").status !== "PENDING"
      );

    case "job":
      return true; // Read-only — always considered complete

    case "contact":
      return !!(
        formData.personal_email_id &&
        formData.phone &&
        formData.emergency_contact_name &&
        formData.emergency_contact_relationship &&
        formData.emergency_contact_number
      );

    case "address":
      // Permanent address is the minimum requirement
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
        getDocStatus("10th Marksheet").status !== "PENDING" &&
        getDocStatus("12th Marksheet").status !== "PENDING" &&
        getDocStatus("Degree Certificate").status !== "PENDING"
      );

    case "financial":
      return getDocStatus("Cancelled Cheque").status !== "PENDING";

    case "signature":
      return getDocStatus("Signature").status !== "PENDING";

    default:
      return false;
  }
};

export const isProfileComplete = ({ formData, documents, previewImage, previewSignature, panVerified }) => {
  // Required personal + contact + address fields
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
    // Permanent address (perm_ prefix)
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

  // Communication address required only when not same as permanent
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

  // Required documents — driven by MANDATORY_DOC_KEYS from documentConfig
  for (const docKey of MANDATORY_DOC_KEYS) {
    const doc = documents.find((d) => d.document_type === docKey);
    if (!doc || doc.status === "REJECTED") return false;
  }

  if (!previewImage) return false;
  if (!previewSignature) return false;
  if (!panVerified) return false;

  return true;
};
