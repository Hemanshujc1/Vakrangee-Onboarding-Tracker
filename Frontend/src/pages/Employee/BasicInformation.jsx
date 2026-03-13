import React, { useState, useEffect } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { useAlert } from "../../context/AlertContext";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { commonSchemas, commonPatterns } from "../../utils/validationSchemas";
import BasicInfoHeader from "../../Components/Employee/BasicInfo/BasicInfoHeader";
import ProfilePhotoSection from "../../Components/Employee/BasicInfo/ProfilePhotoSection";
import ProfileIdentitySection from "../../Components/Employee/BasicInfo/ProfileIdentitySection";
import ContactInfoSection from "../../Components/Employee/BasicInfo/ContactInfoSection";
import JobInformationSection from "../../Components/Employee/BasicInfo/JobInformationSection";
import AddressInformationSection from "../../Components/Employee/BasicInfo/AddressInformationSection";
import AcademicDetailsSection from "../../Components/Employee/BasicInfo/AcademicDetailsSection";
import FinancialHRDocumentsSection from "../../Components/Employee/BasicInfo/FinancialHRDocumentsSection";
import SignatureSection from "../../Components/Employee/BasicInfo/SignatureSection";

const BasicInformation = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewSignature, setPreviewSignature] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const { showConfirm, showAlert } = useAlert();

  const [verificationStatus, setVerificationStatus] = useState("PENDING");
  const [rejectionReason, setRejectionReason] = useState(null);
  const [verifiedByName, setVerifiedByName] = useState(null);

  // Document states
  const [documents, setDocuments] = useState([]);
  const [uploadingState, setUploadingState] = useState({});

  // PAN Verification states
  const [panVerifying, setPanVerifying] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [panVerificationFailed, setPanVerificationFailed] = useState(false);
  const [lastVerifiedPanData, setLastVerifiedPanData] = useState(null);

  // Validation Schema
  const validationSchema = Yup.object().shape({
    firstname: commonSchemas.nameStringOptional.label("First Name"),
    middlename: commonSchemas.nameStringOptional.label("Middle Name"),
    lastname: commonSchemas.nameStringOptional.label("Last Name"),
    email: commonSchemas.emailOptional.nullable(),
    personal_email_id: commonSchemas.emailOptional.nullable(),
    phone: commonSchemas.mobileOptional.label("Phone"),
    date_of_birth: commonSchemas.datePastOptional.label("Date of Birth"),
    gender: Yup.string().nullable().optional(),

    // Address
    address_line1: commonSchemas.addressStringOptional.label("Address Line 1"),
    address_line2: commonSchemas.addressStringOptional.label("Address Line 2"),
    landmark: commonSchemas.landmark.nullable(),
    post_office: commonSchemas.stringOptional.label("Post Office").nullable(),
    pincode: Yup.string()
      .nullable()
      .test(
        "valid-pincode",
        "Pincode must be 6 digits",
        (val) => !val || commonPatterns.pincode.test(val)
      ),
    city: commonSchemas.stringOptional.nullable(),
    district: commonSchemas.stringOptional.nullable(),
    state: commonSchemas.stringOptional.nullable(),
    country: commonSchemas.country.nullable().optional(),

    // Education & IDs
    tenth_percentage: Yup.number()
      .typeError("Must be a number")
      .min(0, "Min 0")
      .max(100, "Max 100")
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      ),
    twelfth_percentage: Yup.number()
      .typeError("Must be a number")
      .min(0, "Min 0")
      .max(100, "Max 100")
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      ),
    adhar_number: Yup.string()
      .nullable()
      .test(
        "valid-aadhaar",
        "Aadhaar must be 12 digits",
        (val) => !val || commonPatterns.aadhaar.test(val)
      ),
    pan_number: Yup.string()
      .nullable()
      .test(
        "valid-pan",
        "Invalid PAN Format",
        (val) => !val || commonPatterns.pan.test(val)
      ),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstname: "",
      middlename: "",
      lastname: "",
      email: "",
      personal_email_id: "",
      phone: "",
      date_of_birth: "",
      gender: "",
      job_title: "",
      department_name: "",
      work_location: "",
      date_of_joining: "",
      address_line1: "",
      address_line2: "",
      landmark: "",
      post_office: "",
      pincode: "",
      city: "",
      district: "",
      state: "",
      country: "India",
      tenth_percentage: "",
      twelfth_percentage: "",
      adhar_number: "",
      pan_number: "",
    },
  });

  const formData = watch();

  // Auto-verify PAN when all required fields are filled without errors
  useEffect(() => {
    // Check if PAN is already verified or currently verifying to prevent loops
    if (panVerified || panVerifying || !isEditing) return;

    const { pan_number, firstname, lastname, date_of_birth } = formData;

    // Check if the current data matches the last failed/succeeded attempt to avoid infinite loops
    const currentDataString = `${pan_number}-${firstname}-${lastname}-${date_of_birth}`;
    if (lastVerifiedPanData === currentDataString) return;

    // Trigger verification automatically when we have valid data
    const timeoutId = setTimeout(() => {
      handleVerifyPan(currentDataString);
    }, 1500); // 1.5-second debounce to allow typing to finish

    return () => clearTimeout(timeoutId);
  }, [
    formData.pan_number,
    formData.firstname,
    formData.middlename,
    formData.lastname,
    formData.date_of_birth,
    errors.pan_number,
    errors.firstname,
    errors.lastname,
    errors.date_of_birth,
    panVerified,
    panVerifying,
    isEditing,
    lastVerifiedPanData,
  ]);

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        record,
        basic_info_status,
        basic_info_rejection_reason,
        verifiedByName,
      } = response.data;

      setVerificationStatus(basic_info_status || "PENDING");
      setRejectionReason(basic_info_rejection_reason);
      setVerifiedByName(verifiedByName);

      if (record) {
        const formatForDateInput = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const dob = formatForDateInput(record.date_of_birth);
        const doj = formatForDateInput(record.date_of_joining);

        reset({
          firstname: record.firstname || "",
          middlename: record.middlename || "",
          lastname: record.lastname || "",
          email: response.data.email || "",
          personal_email_id: record.personal_email_id || "",
          phone: record.phone || "",
          date_of_birth: dob,
          gender: record.gender || "",
          job_title: record.job_title || "",
          department_name: record.department_name || "",
          work_location: record.work_location || "",
          date_of_joining: doj,
          address_line1: record.address_line1 || "",
          address_line2: record.address_line2 || "",
          landmark: record.landmark || "",
          post_office: record.post_office || "",
          pincode: record.pincode || "",
          city: record.city || "",
          district: record.district || "",
          state: record.state || "",
          country: record.country || "India",
          tenth_percentage: record.tenth_percentage || "",
          twelfth_percentage: record.twelfth_percentage || "",
          adhar_number: record.adhar_number || "",
          pan_number: record.pan_number || "",
        });

        if (record.profile_photo) {
          setPreviewImage(`/uploads/profilepic/${record.profile_photo}`);
        }
        if (response.data.signature) {
          setPreviewSignature(`/uploads/signatures/${response.data.signature}`);
        }

        if (record.pan_verified) {
          setPanVerified(true);
          const currentDataString = `${record.pan_number}-${record.firstname}-${record.lastname}-${dob}`;
          setLastVerifiedPanData(currentDataString);
        }

        if (!record.firstname) {
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ type: "error", text: "Failed to load profile data." });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/documents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching docs:", error);
    }
  };

  const handleUpload = async (file, docType) => {
    if (!file) return;
    const token = localStorage.getItem("token");
    setUploadingState((prev) => ({ ...prev, [docType]: true }));

    const formData = new FormData();
    formData.append("documentType", docType);
    formData.append("file", file);

    try {
      await axios.post("/api/documents/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      fetchDocuments();
      showAlert("Document uploaded successfully!", { type: "success" });
    } catch (error) {
      console.error("Upload failed:", error);
      showAlert("Upload failed. Please try again.", { type: "error" });
    } finally {
      setUploadingState((prev) => ({ ...prev, [docType]: false }));
    }
  };
  const handleVerifyPan = async (currentDataString) => {
    if (panVerifying) return; // double check

    const { pan_number, firstname, middlename, lastname, date_of_birth } =
      formData;

    if (!pan_number || !firstname || !lastname || !date_of_birth) {
      return; // Handled quietly
    }

    setPanVerifying(true);
    setPanVerificationFailed(false);
    setLastVerifiedPanData(currentDataString); // Mark this exact combination as attempted

    try {
      // Format DOB to DD/MM/YYYY
      const dobParts = date_of_birth.split("-");
      const formattedDob = `${dobParts[2]}/${dobParts[1]}/${dobParts[0]}`;

      const payload = {
        pan: pan_number,
        name: `${firstname} ${
          middlename ? middlename + " " : ""
        }${lastname}`.trim(),
        fathername: "",
        dob: formattedDob,
      };

      const response = await axios.post(
        "/nsdl-api/banking-kar-api-test/nsdl-pan-verification",
        payload,
        {
          headers: {
            "api-key":
              "c4f67d09ff264a1ac9b0bdf61676d255c6b273d5b9634e5c951a3718e90bc86d",
          },
        }
      );

      if (response.data.status === "00") {
        setPanVerified(true);
        if (response.data.firstName)
          setValue("firstname", response.data.firstName);
        if (response.data.middleName)
          setValue("middlename", response.data.middleName);
        if (response.data.lastName)
          setValue("lastname", response.data.lastName);
        trigger(["firstname", "middlename", "lastname"]);
        showAlert("PAN Verified Successfully! Name updated as per PAN.", {
          type: "success",
        });
      } else {
        setPanVerificationFailed(true);
        setPanVerified(false);
        showAlert(
          response.data.statusDesc ||
            "PAN Verification Failed. Please check your details.",
          {
            type: "error",
          }
        );
      }
    } catch (error) {
      console.error("PAN Verification Error:", error);
      setPanVerificationFailed(true);
      setPanVerified(false);
      showAlert(
        "Verification failed. Please check your details and try again.",
        { type: "error" }
      );
    } finally {
      setPanVerifying(false);
    }
  };

  const handleDelete = async (docId) => {
    const isConfirmed = await showConfirm(
      "Are you sure you want to delete this document?",
      { type: "warning" }
    );
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDocuments();
      showAlert("Document deleted successfully.", { type: "success" });
    } catch (error) {
      console.error("Delete error:", error);
      showAlert("Failed to delete.", { type: "error" });
    }
  };

  const getDocStatus = (docKey) => {
    const doc = documents.find((d) => d.document_type === docKey);
    return doc
      ? { status: doc.status || "UPLOADED", data: doc }
      : { status: "PENDING", data: null };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
      // Special handling: Passport size photo is also handled here
      handleUpload(file, "Passport Size Photo");
    }
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignatureFile(file);
      setPreviewSignature(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const formPayload = new FormData();

      Object.keys(data).forEach((key) => {
        let val = data[key];
        if (val instanceof Date && !isNaN(val.getTime())) {
          const year = val.getFullYear();
          const month = String(val.getMonth() + 1).padStart(2, "0");
          const day = String(val.getDate()).padStart(2, "0");
          val = `${year}-${month}-${day}`;
        }
        formPayload.append(key, val || "");
      });

      formPayload.append("pan_verified", panVerified.toString());

      if (imageFile) {
        formPayload.append("profile_photo", imageFile);
      }
      if (signatureFile) {
        formPayload.append("signature", signatureFile);
      }

      await axios.put("/api/profile", formPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({
        type: "success",
        text: "Information updated successfully!",
      });
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "Failed to update information. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const onError = (errors) => {
    console.error("Form Validation Errors:", errors);
    setMessage({
      type: "error",
      text: "Please fix the validation errors highlighting in red before saving.",
    });
  };

  const handleSubmitForVerification = async () => {
    const isConfirmed = await showConfirm(
      "Are you sure you want to submit your profile? You won't be able to edit it afterwards until verified."
    );
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/employees/submit-basic-info",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setVerificationStatus("SUBMITTED");
      setMessage({
        type: "success",
        text: "Profile submitted successfully for HR verification.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error submitting profile:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to submit profile.",
      });
    }
  };

  const fullAddress = [
    formData.address_line1,
    formData.address_line2,
    formData.landmark,
    formData.post_office && formData.district
      ? `${formData.post_office}, ${formData.district}`
      : formData.post_office || formData.district,
    formData.city && formData.pincode
      ? `${formData.city} - ${formData.pincode}`
      : formData.city || formData.pincode,
    formData.state && formData.country
      ? `${formData.state}, ${formData.country}`
      : formData.state || formData.country,
  ]
    .filter(Boolean)
    .join(", ");

  const isProfileComplete = () => {
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
      "tenth_percentage",
      "twelfth_percentage",
      "adhar_number",
      "pan_number",
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

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading information...</div>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <BasicInfoHeader
          verificationStatus={verificationStatus}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onCancel={() => {
            setIsEditing(false);
            fetchProfile();
          }}
          onSubmitVerification={handleSubmitForVerification}
          saving={saving}
          verifiedByName={verifiedByName}
          rejectionReason={rejectionReason}
          isProfileComplete={isProfileComplete()}
          documents={documents}
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <ProfilePhotoSection
            previewImage={previewImage}
            isEditing={isEditing}
            handleImageChange={handleImageChange}
          />

          <div className="flex flex-col gap-8">
            <ProfileIdentitySection
              register={register}
              errors={errors}
              isEditing={isEditing}
              formData={formData}
              formatDate={formatDate}
              getDocStatus={getDocStatus}
              uploadingState={uploadingState}
              handleUpload={handleUpload}
              handleDelete={handleDelete}
              panVerifying={panVerifying}
              panVerified={panVerified}
              panVerificationFailed={panVerificationFailed}
              verificationStatus={verificationStatus}
            />
            <JobInformationSection
              register={register}
              formData={formData}
              formatDate={formatDate}
              verificationStatus={verificationStatus}
            />

            <ContactInfoSection
              register={register}
              errors={errors}
              isEditing={isEditing}
              formData={formData}
              verificationStatus={verificationStatus}
            />

            <AddressInformationSection
              register={register}
              errors={errors}
              isEditing={isEditing}
              fullAddress={fullAddress}
              setValue={setValue}
              watch={watch}
              trigger={trigger}
              verificationStatus={verificationStatus}
            />

            <AcademicDetailsSection
              register={register}
              errors={errors}
              isEditing={isEditing}
              formData={formData}
              getDocStatus={getDocStatus}
              uploadingState={uploadingState}
              handleUpload={handleUpload}
              handleDelete={handleDelete}
              verificationStatus={verificationStatus}
            />

            <FinancialHRDocumentsSection
              isEditing={isEditing}
              getDocStatus={getDocStatus}
              uploadingState={uploadingState}
              handleUpload={handleUpload}
              handleDelete={handleDelete}
              verificationStatus={verificationStatus}
            />

            <SignatureSection
              previewSignature={previewSignature}
              isEditing={isEditing}
              handleSignatureChange={handleSignatureChange}
              verificationStatus={verificationStatus}
            />
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default BasicInformation;
