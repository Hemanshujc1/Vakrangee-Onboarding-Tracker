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
    department_id: "",
    job_title: "",
    designation_id: "",
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
    country: "India",
    date_of_birth: "",
    personal_email_id: "",
    gender: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [initialRecord, setInitialRecord] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const DROPDOWN_BASE_URL = import.meta.env.VITE_DROPDOWN_BASE_URL;

  // Validation Schema
  const validationSchema = Yup.object().shape({
    firstname: commonSchemas.nameString.label("First Name"),
    lastname: commonSchemas.nameString.label("Last Name"),
    department_name: commonSchemas.stringRequired.label("Department"),
    job_title: commonSchemas.stringRequired.label("Job Title"),
    work_location: commonSchemas.stringRequired.label("Work Location"),
    phone: commonSchemas.mobile,
    personal_email_id: commonSchemas.emailOptional,
    date_of_birth: commonSchemas.datePastOptional
      .max(
        new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
        "Must be 18 years or older"
      ),
    gender: Yup.string().optional(),
    address_line1: commonSchemas.addressString.label("Address Line 1"),
    address_line2: commonSchemas.addressStringOptional.label("Address Line 2"),
    landmark: commonSchemas.landmark,
    post_office: Yup.string().label("Post Office"),
    pincode: commonSchemas.pincode,
    city: commonSchemas.stringRequired.label("City"),
    district: commonSchemas.stringRequired.label("District"),
    state: commonSchemas.stringRequired.label("State"),
    country: commonSchemas.country,
  });

  useEffect(() => {
    fetchProfile();
    fetchDropdownData();
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
        department_id: record.department_id || "",
        job_title: record.job_title || "",
        designation_id: record.designation_id || "",
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
        country: record.country || "India",
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

  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const responses = await Promise.all([
        fetch(`${DROPDOWN_BASE_URL}/department-list`),
        fetch(`${DROPDOWN_BASE_URL}/designation-list`),
      ]);
      const [deptRes, desRes] = await Promise.all(
        responses.map((r) => r.json())
      );
      if (deptRes?.status) setDepartments(deptRes.data);
      if (desRes?.status) setDesignations(desRes.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const validateField = async (name, value) => {
    try {
      await validationSchema.validateAt(name, { ...formData, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: null }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.message }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Re-validate live only if the field already has an error shown
    if (errors[name]) validateField(name, value);
  };

  // Handles department SearchableSelect — updates both name and ID atomically
  const handleDeptChange = (e) => {
    const id = e.target.value;
    const name = e.target.option?.name || "";
    setFormData((prev) => ({ ...prev, department_id: id, department_name: name }));
    if (errors.department_name) validateField("department_name", name);
  };

  // Handles job title SearchableSelect — updates both name and ID atomically
  const handleJobTitleChange = (e) => {
    const id = e.target.value;
    const name = e.target.option?.name || "";
    setFormData((prev) => ({ ...prev, designation_id: id, job_title: name }));
    if (errors.job_title) validateField("job_title", name);
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
                validateField={validateField}
                handleDeptChange={handleDeptChange}
                handleJobTitleChange={handleJobTitleChange}
                departments={departments}
                designations={designations}
                loadingDropdowns={loadingDropdowns}
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
