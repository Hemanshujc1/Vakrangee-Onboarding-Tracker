import { MANDATORY_DOC_KEYS, DOCUMENT_CONFIG } from "../config/documentConfig";

export const parseWorkLocation = (workLoc, locStr) => {
  let parsed = null;
  if (typeof workLoc === "object" && workLoc !== null) {
    parsed = { ...workLoc };
  } else if (typeof workLoc === "string") {
    try {
      parsed = JSON.parse(workLoc);
    } catch (e) {
      parsed = { city: workLoc, district: "", state: "" };
    }
  }

  if (!parsed || (!parsed.state && !parsed.district)) {
    const rawStr = (parsed && parsed.city) || locStr || "";
    const parts = rawStr.split(",").map((s) => s.trim());
    if (parts.length >= 3) {
      parsed = {
        city: parts[0],
        district: parts[1],
        state: parts[2],
      };
    } else {
      parsed = { state: "", district: "", city: rawStr };
    }
  }
  return parsed;
};

/**
 * Safely parse any date string without timezone offset issues.
 *
 * The native `new Date("YYYY-MM-DD")` interprets the string as UTC midnight,
 * which in IST (UTC+5:30) rolls back to the previous day in local time.
 * This helper splits YYYY-MM-DD strings directly, and falls back to
 * `new Date()` only for non-ISO formats (e.g. ISO timestamps with time).
 */
const parseDate = (dateInput) => {
  if (!dateInput) return null;
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split("-").map(Number);
    return new Date(year, month - 1, day); // local midnight — no offset
  }
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Format any date value for display: returns "DD/MM/YYYY".
 * Pass a YYYY-MM-DD string, ISO timestamp, or Date object.
 * Returns "-" for null/empty/invalid.
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return "-";
  const date = parseDate(dateInput);
  if (!date) return String(dateInput);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format today's date as "DD/MM/YYYY".
 * Use this instead of `new Date().toLocaleDateString("en-GB")` everywhere.
 */
export const formatToday = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format a date for use in <input type="date"> — returns "YYYY-MM-DD".
 * Pass a stored YYYY-MM-DD string, ISO timestamp, or Date object.
 */
export const formatForDateInput = (dateInput) => {
  if (!dateInput) return "";
  const date = parseDate(dateInput);
  if (!date) return "";
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

export const getMissingProfileFields = ({
  formData,
  documents,
  previewImage,
  previewSignature,
  panVerified,
}) => {
  const missing = [];

  const requiredFieldsMap = {
    "Profile Identity": [
      { key: "firstname", label: "First Name" },
      { key: "lastname", label: "Last Name" },
      { key: "date_of_birth", label: "Date of Birth" },
      { key: "gender", label: "Gender" },
      { key: "blood_group", label: "Blood Group" },
      { key: "adhar_number", label: "Aadhaar Number" },
      { key: "pan_number", label: "PAN Number" },
    ],
    "Contact Info": [
      { key: "personal_email_id", label: "Personal Email" },
      { key: "phone", label: "Phone Number" },
      { key: "emergency_contact_name", label: "Emergency Contact Name" },
      { key: "emergency_contact_relationship", label: "Emergency Contact Relationship" },
      { key: "emergency_contact_number", label: "Emergency Contact Number" },
    ],
    "Address": [
      { key: "perm_address_line1", label: "Permanent Address Line 1" },
      { key: "perm_city", label: "Permanent City" },
      { key: "perm_district", label: "Permanent District" },
      { key: "perm_state", label: "Permanent State" },
      { key: "perm_pincode", label: "Permanent Pincode" },
      { key: "perm_post_office", label: "Permanent Post Office" },
    ],
    "Academic Details": [
      { key: "degree_name", label: "Highest Degree Name" },
      { key: "degree_percentage", label: "Highest Degree Percentage" },
    ],
  };

  for (const [section, fields] of Object.entries(requiredFieldsMap)) {
    const missingFields = fields.filter(f => !formData[f.key]);
    if (missingFields.length > 0) {
      missing.push({
        section,
        items: missingFields.map(f => f.label)
      });
    }
  }

  if (!formData.comm_same_as_permanent) {
    const commFields = [
      { key: "comm_address_line1", label: "Comm. Address Line 1" },
      { key: "comm_city", label: "Comm. City" },
      { key: "comm_district", label: "Comm. District" },
      { key: "comm_state", label: "Comm. State" },
      { key: "comm_pincode", label: "Comm. Pincode" },
      { key: "comm_post_office", label: "Comm. Post Office" },
    ];
    const missingComm = commFields.filter(f => !formData[f.key]);
    if (missingComm.length > 0) {
      const existingAddressIdx = missing.findIndex(m => m.section === "Address");
      if (existingAddressIdx >= 0) {
        missing[existingAddressIdx].items.push(...missingComm.map(f => f.label));
      } else {
        missing.push({ section: "Address", items: missingComm.map(f => f.label) });
      }
    }
  }

  const missingDocs = [];
  for (const docKey of MANDATORY_DOC_KEYS) {
    const doc = documents.find((d) => d.document_type === docKey);
    if (!doc || doc.status === "REJECTED") {
      const docLabel = DOCUMENT_CONFIG[docKey]?.label || docKey;
      missingDocs.push(docLabel);
    }
  }
  if (missingDocs.length > 0) {
    missing.push({ section: "Documents", items: missingDocs });
  }

  const missingMisc = [];
  if (!previewImage) missingMisc.push("Profile Photo");
  if (!previewSignature) missingMisc.push("Signature");
  if (!panVerified) missingMisc.push("PAN Verification");
  if (missingMisc.length > 0) {
    missing.push({ section: "Other Requirements", items: missingMisc });
  }

  return missing;
};
