import React, { useState, useEffect } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import {
  Save,
  User,
  Camera,
  Edit2,
  X,
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAlert } from "../../context/AlertContext";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

const BasicInformation = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const { showConfirm } = useAlert();

  const [verificationStatus, setVerificationStatus] = useState("PENDING"); // PENDING, SUBMITTED, VERIFIED, REJECTED
  const [rejectionReason, setRejectionReason] = useState(null);
  const [verifiedByName, setVerifiedByName] = useState(null);

  // Validation Schema
  const validationSchema = Yup.object().shape({
    firstname: Yup.string()
      .min(3, "Minimum 3 characters required")
      .max(15, "Maximum 15 characters allowed")
      .required("Required"),
    lastname: Yup.string()
      .min(3, "Minimum 3 characters required")
      .max(15, "Maximum 15 characters allowed")
      .required("Required"),
    email: Yup.string().email("Invalid email").nullable(),
    personal_email_id: Yup.string().email("Invalid email").nullable(),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Mobile Number must be 10 digits")
      .required("Mobile Number is Required"),
    date_of_birth: Yup.date()
      .max(new Date(), "Date cannot be in future")
      .nullable()
      .transform((v, o) => (o === "" ? null : v)),
    gender: Yup.string().required("Gender is required"),

    // Address
    address_line1: Yup.string().min(5, "Min 5 characters").required("Required"),
    address_line2: Yup.string().nullable(),
    landmark: Yup.string().nullable(),
    post_office: Yup.string().nullable(),
    pincode: Yup.string()
      .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
      .nullable()
      .transform((v, o) => (o === "" ? null : v)),
    city: Yup.string().required("City is Required"),
    district: Yup.string().required("District is Required"),
    state: Yup.string().required("State is Required"),
    country: Yup.string().required("Country is Required"),

    // Education & IDs
    tenth_percentage: Yup.number()
      .typeError("Must be a number")
      .min(0)
      .max(100)
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      ),
    twelfth_percentage: Yup.number()
      .typeError("Must be a number")
      .min(0)
      .max(100)
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      ),
    adhar_number: Yup.string()
      .matches(/^[0-9]{12}$/, "Aadhaar must be 12 digits")
      .required("Required"),
    pan_number: Yup.string()
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN Number")
      .required("Required"),
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

  // Watch values to display in read-only mode
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
        // Prepare data for reset
        // Convert date to string YYYY-MM-DD if needed
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
            `http://localhost:3001/uploads/profilepic/${record.profile_photo}`
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
      // Re-fetch to normalize state
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

  const getInputClass = (error, disabled = false) => {
    const baseClass =
      "w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary)";
    const errorClass = error ? "border-red-500" : "border-gray-200";
    const disabledClass = disabled
      ? "cursor-not-allowed bg-gray-50 text-gray-500"
      : "";
    return `${baseClass} ${errorClass} ${disabledClass}`;
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
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-(--color-text-dark)">
              Basic Information
            </h1>
            <p className="text-gray-500 mt-2">
              Personal and professional details.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Status Banner / Action */}
            {verificationStatus === "SUBMITTED" && (
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100 flex items-center gap-2">
                <Clock size={16} /> Submitted for Verification
              </div>
            )}
            {verificationStatus === "VERIFIED" && (
              <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium border border-green-100 flex items-center gap-2">
                <CheckCircle size={16} /> Profile Verified
                {verifiedByName && (
                  <span className="text-sm border-l border-green-200 pl-2 ml-1">
                    by {verifiedByName}
                  </span>
                )}
              </div>
            )}
            {verificationStatus === "REJECTED" && (
              <div className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium border border-red-100 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>
                  Verification Rejected
                  {verifiedByName && (
                    <span className="text-sm"> by {verifiedByName}</span>
                  )}
                  {rejectionReason && <> due to: {rejectionReason}</>}
                </span>
              </div>
            )}

            {/* Edit Button - Hide if Submitted/Verified */}
            {!isEditing &&
            verificationStatus !== "SUBMITTED" &&
            verificationStatus !== "VERIFIED" ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex justify-center items-center gap-2 bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-all font-medium shadow-sm w-full sm:w-auto"
                >
                  <Edit2 size={18} />
                  <span>Edit Profile</span>
                </button>

                {/* Submit for Verification Button */}
                <button
                  type="button"
                  onClick={handleSubmitForVerification}
                  className="flex justify-center items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-all font-medium shadow-sm w-full sm:w-auto"
                >
                  <ShieldCheck size={18} />
                  <span>Submit for Verification</span>
                </button>
              </>
            ) : isEditing ? (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile(); // Reset to saved data
                  }}
                  className="flex justify-center items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-all font-medium w-full sm:w-auto"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex justify-center items-center gap-2 bg-(--color-primary) text-white px-6 py-2.5 rounded-lg transition-all font-medium shadow-sm w-full sm:w-auto ${
                    saving
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:brightness-110"
                  }`}
                >
                  <Save size={18} />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            ) : null}
          </div>
        </header>

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
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-4 pb-8 text-center sm:text-left">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-gray-400" />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 border border-gray-200">
                  <Camera size={16} className="text-gray-600" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">
                Profile Photo
              </h3>
              <p className="text-sm text-gray-500">
                {isEditing
                  ? "Upload a professional photo."
                  : "Your profile picture."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 form-group">
            {/* Personal Details */}
            <div className="md:col-span-2 mt-4">
              <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2">
                Personal Details
              </h4>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Employee ID
              </label>
              {isEditing ? (
                <input
                  disabled
                  value={formData.id || "-"}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              ) : (
                <p className="font-medium text-gray-800 bg-gray-50 px-1 py-2">
                  {formData.id || "Not Assigned"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                First Name
              </label>
              {isEditing ? (
                <>
                  <input
                    {...register("firstname")}
                    disabled
                    className={getInputClass(errors.firstname, true)}
                    placeholder="Rohit"
                  />
                  {errors.firstname && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstname.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-medium text-gray-800 py-2">
                  {formData.firstname || "-"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Last Name
              </label>
              {isEditing ? (
                <>
                  <input
                    {...register("lastname")}
                    disabled
                    className={getInputClass(errors.lastname, true)}
                    placeholder="Sharma"
                  />
                  {errors.lastname && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastname.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-medium text-gray-800 py-2">
                  {formData.lastname || "-"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Company Email Address
              </label>
              {isEditing ? (
                <>
                  <input
                    {...register("email")}
                    type="email"
                    disabled
                    placeholder="Not Assigned Yet"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </>
              ) : (
                <p className="font-medium text-gray-800 py-2">
                  {formData.email || "Not Assigned Yet"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Personal Email Address
              </label>
              {isEditing ? (
                <>
                  <input
                    {...register("personal_email_id")}
                    disabled
                    type="email"
                    className={getInputClass(errors.personal_email_id, true)}
                    placeholder="john.doe@gmail.com"
                  />
                  {errors.personal_email_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.personal_email_id.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-medium text-gray-800 py-2">
                  {formData.personal_email_id || "-"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Phone Number
              </label>
              {isEditing ? (
                <>
                  <input
                    {...register("phone")}
                    type="tel"
                    className={getInputClass(errors.phone)}
                    placeholder="+91"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-medium text-gray-800 py-2">
                  {formData.phone || "-"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Date of Birth
              </label>
              {isEditing ? (
                <>
                  <input
                    {...register("date_of_birth")}
                    type="date"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                      errors.date_of_birth
                        ? "border-red-500"
                        : "border-gray-200"
                    }`}
                  />
                  {errors.date_of_birth && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.date_of_birth.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-medium text-gray-800 py-2">
                  {formatDate(formData.date_of_birth) || "-"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Gender</label>
              {isEditing ? (
                <>
                  <select
                    {...register("gender")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) bg-white ${
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
                      {errors.gender.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-medium text-gray-800 py-2">
                  {formData.gender || "-"}
                </p>
              )}
            </div>

            {/* Job Details */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2">
                Professional Details
              </h4>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Job Title
              </label>
              <input
                {...register("job_title")}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Department
              </label>
              <input
                {...register("department_name")}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Work Location
              </label>
              <input
                {...register("work_location")}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Joining Date
              </label>
              <input
                value={formatDate(formData.date_of_joining) || "-"}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2 mt-4">
              <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2">
                Permanent Address
              </h4>
            </div>

            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Address Line 1
                  </label>
                  <input
                    {...register("address_line1")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                      errors.address_line1
                        ? "border-red-500"
                        : "border-gray-200"
                    }`}
                  />
                  {errors.address_line1 && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address_line1.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Address Line 2
                  </label>
                  <input
                    {...register("address_line2")}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Landmark
                  </label>
                  <input
                    {...register("landmark")}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Post Office/Taluka
                  </label>
                  <input
                    {...register("post_office")}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Pincode
                  </label>
                  <input
                    {...register("pincode")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                      errors.pincode ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.pincode && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.pincode.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    City
                  </label>
                  <input
                    {...register("city")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                      errors.city ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    District
                  </label>
                  <input
                    {...register("district")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                      errors.district ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.district && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.district.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    State
                  </label>
                  <input
                    {...register("state")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                      errors.state ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.state.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Country
                  </label>
                  <input
                    {...register("country")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                      errors.country ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.country && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.country.message}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-500 mb-1">
                  Full Address
                </label>
                <p className="font-medium text-gray-800 py-2">
                  {fullAddress || "-"}
                </p>
              </div>
            )}
            {/* Education and identty Details */}
            <div className="md:col-span-2 mt-4">
              <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2">
                Education & Identity
              </h4>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                10th Percentage
              </label>
              {isEditing ? (
                <>
                  <input
                    {...register("tenth_percentage")}
                    type="number"
                    step="0.01"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                      errors.tenth_percentage
                        ? "border-red-500"
                        : "border-gray-200"
                    }`}
                  />
                  {errors.tenth_percentage && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.tenth_percentage.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-medium text-gray-800 py-2">
                  {formData.tenth_percentage
                    ? `${formData.tenth_percentage}%`
                    : "-"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                12th Percentage
              </label>
              {isEditing ? (
                <>
                  <input
                    {...register("twelfth_percentage")}
                    type="number"
                    step="0.01"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                      errors.twelfth_percentage
                        ? "border-red-500"
                        : "border-gray-200"
                    }`}
                  />
                  {errors.twelfth_percentage && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.twelfth_percentage.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-medium text-gray-800 py-2">
                  {formData.twelfth_percentage
                    ? `${formData.twelfth_percentage}%`
                    : "-"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Aadhar Number
              </label>
              {isEditing ? (
                <>
                  <input
                    {...register("adhar_number")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                      errors.adhar_number ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.adhar_number && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.adhar_number.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-medium text-gray-800 py-2">
                  {formData.adhar_number || "-"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                PAN Number
              </label>
              {isEditing ? (
                <>
                  <input
                    {...register("pan_number")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-(--color-primary) ${
                      errors.pan_number ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.pan_number && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.pan_number.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-medium text-gray-800 py-2">
                  {formData.pan_number || "-"}
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default BasicInformation;
