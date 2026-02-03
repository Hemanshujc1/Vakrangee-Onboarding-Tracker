import React, { useState, useEffect } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { useAlert } from "../../context/AlertContext";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { commonSchemas } from "../../utils/validationSchemas";

// Imported Sub-Components
import BasicInfoHeader from "../../Components/Employee/BasicInfo/BasicInfoHeader";
import ProfilePhotoSection from "../../Components/Employee/BasicInfo/ProfilePhotoSection";
import PersonalDetailsSection from "../../Components/Employee/BasicInfo/PersonalDetailsSection";
import ProfessionalDetailsSection from "../../Components/Employee/BasicInfo/ProfessionalDetailsSection";
import AddressSection from "../../Components/Employee/BasicInfo/AddressSection";
import EducationIdentitySection from "../../Components/Employee/BasicInfo/EducationIdentitySection";

const BasicInformation = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const { showConfirm } = useAlert();

  const [verificationStatus, setVerificationStatus] = useState("PENDING");
  const [rejectionReason, setRejectionReason] = useState(null);
  const [verifiedByName, setVerifiedByName] = useState(null);

  // Validation Schema
  const validationSchema = Yup.object().shape({
    firstname: commonSchemas.nameString.label("First Name"),
    lastname: commonSchemas.nameString.label("Last Name"),
    email: commonSchemas.email.nullable(),
    personal_email_id: commonSchemas.email.nullable(),
    phone: commonSchemas.mobile,
    date_of_birth: commonSchemas.datePast.nullable().transform((v, o) => (o === "" ? null : v)),
    gender: Yup.string().required("Gender is required"),

    // Address
    address_line1: commonSchemas.addressString.label("Address Line 1"),
    address_line2: commonSchemas.addressString.label("Address Line 2"),
    landmark: commonSchemas.landmark,
    post_office: commonSchemas.stringOptional.label("Post Office"),
    pincode: commonSchemas.pincode.nullable().transform((v, o) => (o === "" ? null : v)),
    city: commonSchemas.stringRequired,
    district: commonSchemas.stringRequired,
    state: commonSchemas.stringRequired,
    country: commonSchemas.country,

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
    adhar_number: commonSchemas.aadhaar,
    pan_number: commonSchemas.pan,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstname: "",
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
      country: "",
      tenth_percentage: "",
      twelfth_percentage: "",
      adhar_number: "",
      pan_number: "",
    },
  });

  const formData = watch();

  useEffect(() => {
    fetchProfile();
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
        const dob = record.date_of_birth
          ? new Date(record.date_of_birth).toISOString().split("T")[0]
          : "";
        const doj = record.date_of_joining
          ? new Date(record.date_of_joining).toISOString().split("T")[0]
          : "";

        reset({
          firstname: record.firstname || "",
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
          country: record.country || "",
          tenth_percentage: record.tenth_percentage || "",
          twelfth_percentage: record.twelfth_percentage || "",
          adhar_number: record.adhar_number || "",
          pan_number: record.pan_number || "",
        });

        if (record.profile_photo) {
          setPreviewImage(
            `/uploads/profilepic/${record.profile_photo}`
          );
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
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const formPayload = new FormData();

      Object.keys(data).forEach((key) => {
        formPayload.append(key, data[key] || "");
      });

      if (imageFile) {
        formPayload.append("profile_photo", imageFile);
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
    formData.post_office ? `PO: ${formData.post_office}` : "",
    formData.city,
    formData.district,
    formData.state,
    formData.country,
    formData.pincode ? `Pin: ${formData.pincode}` : "",
  ]
    .filter(Boolean)
    .join(", ");

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 form-group">
            <PersonalDetailsSection 
                register={register} 
                errors={errors} 
                isEditing={isEditing} 
                formData={formData} 
                formatDate={formatDate} 
            />

            <ProfessionalDetailsSection 
                register={register} 
                formData={formData} 
                formatDate={formatDate} 
            />

            <AddressSection 
                register={register} 
                errors={errors} 
                isEditing={isEditing} 
                fullAddress={fullAddress} 
            />

            <EducationIdentitySection 
                register={register} 
                errors={errors} 
                isEditing={isEditing} 
                formData={formData} 
            />
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default BasicInformation;
