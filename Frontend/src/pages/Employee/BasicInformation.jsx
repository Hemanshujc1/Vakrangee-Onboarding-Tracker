import React, { useState, useEffect } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { Save, User, Camera, Edit2, X } from "lucide-react";
import axios from "axios";

const BasicInformation = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
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
    pincode: "",
    city: "",
    district: "",
    state: "",
    country: "",

    tenth_percentage: "",
    twelfth_percentage: "",
    adhar_number: "",
    pan_number: "",
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

      const { record } = response.data;
      if (record) {
        setFormData({
          firstname: record.firstname || "",
          lastname: record.lastname || "",
          email: response.data.email || "",
          personal_email_id: record.personal_email_id || "",
          phone: record.phone || "",
          date_of_birth: record.date_of_birth || "",
          gender: record.gender || "",

          job_title: record.job_title || "",
          department_name: record.department_name || "",
          work_location: record.work_location || "",
          date_of_joining: record.date_of_joining || "",

          address_line1: record.address_line1 || "",
          address_line2: record.address_line2 || "",
          landmark: record.landmark || "",
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    try {
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

      setMessage({
        type: "success",
        text: "Information updated successfully!",
      });
      setIsEditing(false);
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

  const fullAddress = [
    formData.address_line1,
    formData.address_line2,
    formData.landmark,
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
      <form onSubmit={handleSubmit}>
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-(--color-text-dark)">
              Basic Information
            </h1>
            <p className="text-gray-500 mt-2">
              Personal and professional details.
            </p>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-all font-medium shadow-sm"
            >
              <Edit2 size={18} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                <X size={18} />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center gap-2 bg-(--color-primary) text-white px-6 py-2.5 rounded-lg transition-all font-medium shadow-sm ${
                  saving
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:brightness-110"
                }`}
              >
                <Save size={18} />
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          )}
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
          <div className="flex items-center gap-6 mb-4 pb-8">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Personal Details */}
            <div className="md:col-span-2 mt-4">
              <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2">
                Personal Details
              </h4>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                First Name
              </label>
              {isEditing ? (
                <input
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                  placeholder="John"
                />
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
                <input
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                  placeholder="Doe"
                />
              ) : (
                <p className="font-medium text-gray-800 py-2">
                  {formData.lastname || "-"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Personal Email Address
              </label>
              {isEditing ? (
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                  type="email"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="john.doe@example.com"
                />
              ) : (
                <p className="font-medium text-gray-800 py-2">
                  {formData.email || "-"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                  placeholder="+91"
                />
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
                <input
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  type="date"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                />
              ) : (
                <p className="font-medium text-gray-800 py-2">
                  {formData.date_of_birth || "-"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Gender</label>
              {isEditing ? (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary) bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
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
                value={formData.job_title}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Department
              </label>
              <input
                value={formData.department_name}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Work Location
              </label>
              <input
                value={formData.work_location}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Joining Date
              </label>
              <input
                value={formData.date_of_joining}
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
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Address Line 2
                  </label>
                  <input
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Landmark
                  </label>
                  <input
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Pincode
                  </label>
                  <input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    City
                  </label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    District
                  </label>
                  <input
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    State
                  </label>
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Country
                  </label>
                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                  />
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
                <input
                  name="tenth_percentage"
                  value={formData.tenth_percentage}
                  onChange={handleInputChange}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                />
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
                <input
                  name="twelfth_percentage"
                  value={formData.twelfth_percentage}
                  onChange={handleInputChange}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                />
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
                <input
                  name="adhar_number"
                  value={formData.adhar_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                />
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
                <input
                  name="pan_number"
                  value={formData.pan_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
                />
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
