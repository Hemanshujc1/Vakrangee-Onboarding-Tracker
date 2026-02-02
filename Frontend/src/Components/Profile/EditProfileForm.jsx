import React, { useState, useEffect } from "react";
import axios from "axios";
import { Camera } from "lucide-react";
import * as Yup from "yup"; // Import Yup
import { commonSchemas } from "../../utils/validationSchemas";

const EditProfileForm = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [role, setRole] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [errors, setErrors] = useState({}); // New Error State

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
    post_office: commonSchemas.stringOptional.label("Post Office"),
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
        setPreviewImage(
          `http://localhost:3001/uploads/profilepic/${record.profile_photo}`
        );
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
    // Clear error on change
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
      // Validate Data
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
      {/* Header */}
      <div className="h-32 bg-(--color-secondary)"></div>

      <div className="px-4 md:px-8 pb-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Left Column: Photo & Basic Info */}
          <div className="md:w-1/3 -mt-16 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                    {formData.firstname ? formData.firstname[0] : "U"}
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200">
                  <Camera size={18} className="text-gray-600" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            <h2 className="mt-4 text-2xl font-bold text-(--color-text-dark)">
              {formData.firstname} {formData.lastname}
            </h2>
            <p className="text-(--color-primary) font-medium">
              {role.replace(/_/g, " ")}
            </p>
            {companyEmail && (
              <p className="text-sm text-gray-500 mt-1">{companyEmail}</p>
            )}
          </div>

          {/* Right Column: View/Edit Content */}
          <div className="md:w-2/3 mt-6">
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
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Profile Details
                  </h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">
                      First Name
                    </label>
                    <p className="font-medium text-gray-800">
                      {formData.firstname || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">
                      Last Name
                    </label>
                    <p className="font-medium text-gray-800">
                      {formData.lastname || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 block mb-1">
                      Department
                    </label>
                    <p className="font-medium text-gray-800">
                      {formData.department_name || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">
                      Job Title
                    </label>
                    <p className="font-medium text-gray-800">
                      {formData.job_title || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">
                      Work Location
                    </label>
                    <p className="font-medium text-gray-800">
                      {formData.work_location || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">
                      Phone
                    </label>
                    <p className="font-medium text-gray-800">
                      {formData.phone || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">
                      Personal Email
                    </label>
                    <p className="font-medium text-gray-800">
                      {formData.personal_email_id || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">
                      Company Email
                    </label>
                    <p className="font-medium text-gray-800">
                      {companyEmail || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">
                      Date of Birth
                    </label>
                    <p className="font-medium text-gray-800">
                      {new Date(formData.date_of_birth).toLocaleDateString(
                        "en-GB"
                      ) || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">
                      Gender
                    </label>
                    <p className="font-medium text-gray-800">
                      {formData.gender || "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500 block mb-1">
                      Address
                    </label>
                    <p className="font-medium text-gray-800">
                      {fullAddress || "-"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Edit Profile
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      disabled={
                        role === "HR_ADMIN" && !!initialRecord.firstname
                      }
                      className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
                        errors.firstname ? "border-red-500" : "border-gray-200"
                      } ${
                        role === "HR_ADMIN" && !!initialRecord.firstname
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                      }`}
                    />
                    {errors.firstname && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.firstname}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      disabled={role === "HR_ADMIN" && !!initialRecord.lastname}
                      className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
                        errors.lastname ? "border-red-500" : "border-gray-200"
                      } ${
                        role === "HR_ADMIN" && !!initialRecord.lastname
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                      }`}
                    />
                    {errors.lastname && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.lastname}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="department_name"
                      value={formData.department_name}
                      onChange={handleInputChange}
                      disabled={
                        role === "HR_ADMIN" && !!initialRecord.department_name
                      }
                      className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
                        errors.department_name
                          ? "border-red-500"
                          : "border-gray-200"
                      } ${
                        role === "HR_ADMIN" && !!initialRecord.department_name
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                      }`}
                    />
                    {errors.department_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.department_name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleInputChange}
                      disabled={
                        role === "HR_ADMIN" && !!initialRecord.job_title
                      }
                      className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
                        errors.job_title ? "border-red-500" : "border-gray-200"
                      } ${
                        role === "HR_ADMIN" && !!initialRecord.job_title
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                      }`}
                    />
                    {errors.job_title && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.job_title}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Work Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="work_location"
                      value={formData.work_location}
                      onChange={handleInputChange}
                      disabled={
                        role === "HR_ADMIN" && !!initialRecord.work_location
                      }
                      className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
                        errors.work_location
                          ? "border-red-500"
                          : "border-gray-200"
                      } ${
                        role === "HR_ADMIN" && !!initialRecord.work_location
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                      }`}
                    />
                    {errors.work_location && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.work_location}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all ${
                        errors.phone ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all ${
                        errors.date_of_birth
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                    />
                    {errors.date_of_birth && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.date_of_birth}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all bg-white ${
                        errors.gender ? "border-red-500" : "border-gray-200"
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 pt-4 pb-2">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">
                      Permanent Address
                    </h4>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Address Line 1
                    </label>
                    <input
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all ${
                        errors.pincode ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                      {errors.address_line1 && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.address_line1}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Address Line 2
                    </label>
                    <input
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all ${
                        errors.pincode ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                     {errors.address_line2 && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.address_line2}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Landmark
                    </label>
                    <input
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Post Office/Taluka
                    </label>
                    <input
                      name="post_office"
                      value={formData.post_office}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Pincode
                    </label>
                    <input
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all ${
                        errors.pincode ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors.pincode && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.pincode}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      City
                    </label>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      District
                    </label>
                    <input
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      State
                    </label>
                    <input
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Country
                    </label>
                    <input
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Company Email
                    </label>
                    <input
                      type="email"
                      value={companyEmail}
                      disabled
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Personal Email
                    </label>
                    <input
                      type="email"
                      name="personal_email_id"
                      value={formData.personal_email_id}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all ${
                        errors.personal_email_id
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                    />
                    {errors.personal_email_id && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.personal_email_id}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                      setErrors({});
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-8 py-3 bg-(--color-primary) text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all ${
                      saving
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:bg-(--color-secondary)"
                    }`}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;
