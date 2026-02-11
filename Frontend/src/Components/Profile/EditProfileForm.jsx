import React, { useState, useEffect } from "react";
import axios from "axios";
import * as Yup from "yup";
import { commonSchemas } from "../../utils/validationSchemas";
import ProfileHeader from "./ProfileHeader";
import ProfileView from "./ProfileView";
import ProfileEdit from "./ProfileEdit";

const EditProfileForm = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [role, setRole] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    department_name: "",
    job_title: "",
    work_location: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    landmark: "",
    post_office: "",
    pincode: "",
    city: "",
    district: "",
    state: "",
    country: "",
    date_of_birth: "",
    personal_email_id: "",
    gender: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [initialRecord, setInitialRecord] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Validation Schema
  const validationSchema = Yup.object().shape({
    firstname: commonSchemas.nameString.label("First Name"),
    lastname: commonSchemas.nameString.label("Last Name"),
    department_name: commonSchemas.stringRequired.label("Department"),
    job_title: commonSchemas.stringRequired.label("Job Title"),
    work_location: commonSchemas.stringRequired.label("Work Location"),
    phone: commonSchemas.mobile,
    personal_email_id: commonSchemas.email,
    date_of_birth: commonSchemas.datePast,
    gender: Yup.string().required("Gender is required"),
    address_line1: commonSchemas.addressString.label("Address Line 1"),
    address_line2: commonSchemas.addressString.label("Address Line 2"),
    landmark: commonSchemas.landmark,
    post_office: commonSchemas.stringRequired.label("Post Office"),
    pincode: commonSchemas.pincode,
    city: commonSchemas.stringRequired.label("City"),
    district: commonSchemas.stringRequired.label("District"),
    state: commonSchemas.stringRequired.label("State"),
    country: commonSchemas.country,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { role, email, record } = response.data;
      setRole(role);
      setCompanyEmail(email);
      setInitialRecord(record);

      setFormData({
        firstname: record.firstname || "",
        lastname: record.lastname || "",
        department_name: record.department_name || "",
        job_title: record.job_title || "",
        work_location: record.work_location || "",
        phone: record.phone || "",
        address_line1: record.address_line1 || "",
        address_line2: record.address_line2 || "",
        landmark: record.landmark || "",
        post_office: record.post_office || "",
        pincode: record.pincode || "",
        city: record.city || "",
        district: record.district || "",
        state: record.state || "",
        country: record.country || "",
        date_of_birth: record.date_of_birth || "",
        personal_email_id: record.personal_email_id || "",
        gender: record.gender || "",
      });

      if (!record.firstname || !record.lastname) {
        setIsEditing(true);
      }

      if (record.profile_photo) {
        setPreviewImage(`/uploads/profilepic/${record.profile_photo}`);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ type: "error", text: "Failed to load profile data." });
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    setErrors({});

    try {
      await validationSchema.validate(formData, { abortEarly: false });

      const token = localStorage.getItem("token");
      const formPayload = new FormData();

      Object.keys(formData).forEach((key) => {
        formPayload.append(key, formData[key]);
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

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
        setMessage({ type: "error", text: "Please fix the errors." });
      } else {
        console.error("Error updating profile:", error);
        setMessage({
          type: "error",
          text: "Failed to update profile. Please try again.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading profile...</div>
    );

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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Banner */}
      <div className="h-32 bg-(--color-secondary)"></div>

      <div className="px-4 md:px-8 pb-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <ProfileHeader
            formData={formData}
            role={role}
            companyEmail={companyEmail}
            previewImage={previewImage}
            isEditing={isEditing}
            onImageChange={handleImageChange}
          />

          {/* Right Content Area */}
          <div className="w-full lg:w-2/3 lg:mt-6">
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

            {!isEditing ? (
              <ProfileView
                formData={formData}
                companyEmail={companyEmail}
                fullAddress={fullAddress}
                onEdit={() => setIsEditing(true)}
              />
            ) : (
              <ProfileEdit
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                onCancel={() => {
                  setIsEditing(false);
                  fetchProfile();
                  setErrors({});
                }}
                onSubmit={handleSubmit}
                saving={saving}
                role={role}
                initialRecord={initialRecord}
                companyEmail={companyEmail}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;
