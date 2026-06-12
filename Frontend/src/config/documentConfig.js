export const DOCUMENT_CONFIG = [
  // ── Photo & Signature ───────────────────────────────────────────────────
  {
    key: "Passport Size Photo",
    label: "Passport Size Photo",
    optional: false,
    section: "photo",
    accept: ".jpg,.jpeg,.png,.webp", // images only
    maxSizeMB: 1,
  },
  {
    key: "Signature",
    label: "Signature",
    optional: false,
    section: "signature",
    accept: ".jpg,.jpeg,.png,.webp", // images only
    maxSizeMB: 1,
  },

  // ── Identity ────────────────────────────────────────────────────────────
  {
    key: "PAN Card",
    label: "PAN Card",
    optional: false,
    section: "identity",
    accept: ".pdf,.jpg,.jpeg,.png",
    maxSizeMB: 2,
  },
  {
    key: "Aadhar Card",
    label: "Aadhar Card",
    optional: false,
    section: "identity",
    accept: ".pdf,.jpg,.jpeg,.png",
    maxSizeMB: 2,
  },

  // ── Academic ────────────────────────────────────────────────────────────
  {
    key: "10th Marksheet",
    label: "10th Marksheet",
    optional: false,
    section: "academic",
    accept: ".pdf,.jpg,.jpeg,.png",
    maxSizeMB: 2,
  },
  {
    key: "12th Marksheet",
    label: "12th Marksheet",
    optional: false,
    section: "academic",
    accept: ".pdf,.jpg,.jpeg,.png",
    maxSizeMB: 2,
  },
  {
    key: "Degree Certificate",
    label: "Degree Certificate",
    optional: false,
    section: "academic",
    accept: ".pdf,.jpg,.jpeg,.png",
    maxSizeMB: 2,
  },

  // ── Financial & HR ──────────────────────────────────────────────────────
  {
    key: "Cancelled Cheque",
    label: "Cancelled Cheque",
    optional: false,
    section: "financial",
    accept: ".pdf,.jpg,.jpeg,.png",
    maxSizeMB: 1,
  },
  {
    key: "6 Months Bank Statement",
    label: "6 Months Bank Statement",
    optional: false,
    section: "financial",
    accept: ".pdf", // PDF only
    maxSizeMB: 5,
  },
  {
    key: "Previous Offer Letter 1",
    label: "Previous Offer Letter 1",
    optional: false,
    section: "financial",
    accept: ".pdf",
    maxSizeMB: 2,
  },
  {
    key: "Previous Offer Letter 2",
    label: "Previous Offer Letter 2",
    optional: true,
    section: "financial",
    accept: ".pdf",
    maxSizeMB: 2,
  },
  {
    key: "Resume",
    label: "Resume",
    optional: false,
    section: "financial",
    accept: ".pdf", // PDF only
    maxSizeMB: 2,
  },
  {
    key: "Relieving Letter",
    label: "Relieving Letter",
    optional: true,
    section: "financial",
    accept: ".pdf,.jpg,.jpeg,.png",
    maxSizeMB: 2,
  },
  {
    key: "Experience Certificate",
    label: "Experience Certificate",
    optional: true,
    section: "financial",
    accept: ".pdf,.jpg,.jpeg,.png",
    maxSizeMB: 2,
  },
  {
    key: "Service Certificates",
    label: "Service Certificates",
    optional: true,
    section: "financial",
    accept: ".pdf,.jpg,.jpeg,.png",
    maxSizeMB: 2,
  },
  {
    key: "Last Drawn Salary Slip",
    label: "Last Drawn Salary Slips (last 3 months)",
    optional: true,
    section: "financial",
    accept: ".pdf",
    maxSizeMB: 2,
  },
];

// ── Derived helpers (computed from DOCUMENT_CONFIG — do not edit below) ───

/** All mandatory document keys (optional: false) */
export const MANDATORY_DOC_KEYS = DOCUMENT_CONFIG.filter(
  (d) => !d.optional,
).map((d) => d.key);

/** All document keys */
export const ALL_DOC_KEYS = DOCUMENT_CONFIG.map((d) => d.key);

/** Quick lookup map: key → config entry */
export const DOC_CONFIG_MAP = Object.fromEntries(
  DOCUMENT_CONFIG.map((d) => [d.key, d]),
);

/** Returns true if the given document key is mandatory */
export const isDocMandatory = (key) => !DOC_CONFIG_MAP[key]?.optional;

/**
 * Validates a File object against the config rules for a given docKey.
 * Returns null if valid, or an error message string if invalid.
 *
 * @param {File}   file
 * @param {string} docKey  — must match a key in DOCUMENT_CONFIG
 * @returns {string|null}
 */
export const validateDocumentFile = (file, docKey) => {
  const config = DOC_CONFIG_MAP[docKey];
  if (!config || !file) return null;

  // ── Size check ──────────────────────────────────────────────────────────
  const maxBytes = config.maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File is too large. Maximum allowed size for "${config.label}" is ${config.maxSizeMB} MB.`;
  }

  // ── Type check ──────────────────────────────────────────────────────────
  const allowedExts = config.accept
    .split(",")
    .map((ext) => ext.trim().toLowerCase());

  const fileName = file.name.toLowerCase();
  const hasValidExt = allowedExts.some((ext) => fileName.endsWith(ext));

  if (!hasValidExt) {
    const friendly = allowedExts.join(", ");
    return `Invalid file type for "${config.label}". Allowed: ${friendly}.`;
  }

  return null;
};
