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
      return (
        formData.firstname &&
        formData.lastname &&
        formData.date_of_birth &&
        formData.pan_number &&
        formData.adhar_number &&
        panVerified &&
        getDocStatus("PAN Card").status !== "PENDING" &&
        getDocStatus("Aadhar Card").status !== "PENDING"
      );
    case "job":
        return true; // Read-only
    case "contact":
      return formData.personal_email_id && formData.phone;
    case "address":
      return (
        formData.address_line1 &&
        formData.city &&
        formData.district &&
        formData.state &&
        formData.pincode &&
        formData.post_office
      );
    case "academic":
      return (
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
  const requiredFields = [
    "firstname",
    "lastname",
    "personal_email_id",
    "phone",
    "date_of_birth",
    "gender",
    "address_line1",
    "city",
    "district",
    "state",
    "pincode",
    "post_office",
    "adhar_number",
    "pan_number",
    "degree_name",
    "degree_percentage",
  ];
  for (const field of requiredFields) {
    if (!formData[field]) return false;
  }

  const requiredDocs = [
    "PAN Card",
    "Aadhar Card",
    "10th Marksheet",
    "12th Marksheet",
    "Degree Certificate",
    "Cancelled Cheque",
    "Passport Size Photo",
    "Signature"
  ];
  for (const docKey of requiredDocs) {
    const doc = documents.find((d) => d.document_type === docKey);
    if (!doc || doc.status === "REJECTED") return false;
  }

  if (!previewImage) return false;
  if (!previewSignature) return false;
  if (!panVerified) return false;
  return true;
};
