import React, { useState, useEffect } from "react";
import SearchableSelect from "../UI/SearchableSelect";

const ProfileEdit = ({
  formData,
  errors,
  handleInputChange,
  onCancel,
  onSubmit,
  saving,
  role,
  initialRecord,
  companyEmail,
}) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  const DROPDOWN_BASE_URL = "/vakrangee-connect/OnBoarding";

  // Fetch States on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch(`${DROPDOWN_BASE_URL}/state-list`);
        const data = await response.json();
        if (data?.status) {
          setStates(data.data);

          // If we have an initial state name, try to find its ID for subsequent fetches
          if (formData.state) {
            const foundState = data.data.find(
              (s) => s.state_name === formData.state,
            );
            if (foundState) setSelectedStateId(foundState.lg_state_id);
          }
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

  // Fetch Districts when selectedStateId changes
  useEffect(() => {
    if (!selectedStateId) {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      setLoadingRegions(true);
      try {
        const response = await fetch(
          `${DROPDOWN_BASE_URL}/district-list/${selectedStateId}`,
        );
        const data = await response.json();
        if (data?.status) {
          setDistricts(data.data);

          // If we have an initial district name, try to find its ID for subsequent fetches
          if (formData.district) {
            const foundDist = data.data.find(
              (d) => d.district_name === formData.district,
            );
            if (foundDist) setSelectedDistrictId(foundDist.district_id);
          }
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setLoadingRegions(false);
      }
    };
    fetchDistricts();
  }, [selectedStateId]);

  // Fetch Cities when selectedDistrictId changes
  useEffect(() => {
    if (!selectedStateId || !selectedDistrictId) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      setLoadingRegions(true);
      try {
        const response = await fetch(
          `${DROPDOWN_BASE_URL}/city-list/${selectedStateId}/${selectedDistrictId}`,
        );
        const data = await response.json();
        if (data?.status) {
          setCities(data.data);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoadingRegions(false);
      }
    };
    fetchCities();
  }, [selectedDistrictId, selectedStateId]);

  const onStateChange = (id, name) => {
    setSelectedStateId(id);
    setSelectedDistrictId("");
    setDistricts([]);
    setCities([]);

    // Update parent formData
    handleInputChange({ target: { name: "state", value: name } });
    handleInputChange({ target: { name: "district", value: "" } });
    handleInputChange({ target: { name: "city", value: "" } });
  };

  const onDistrictChange = (id, name) => {
    setSelectedDistrictId(id);
    setCities([]);

    // Update parent formData
    handleInputChange({ target: { name: "district", value: name } });
    handleInputChange({ target: { name: "city", value: "" } });
  };

  const onCityChange = (name) => {
    handleInputChange({ target: { name: "city", value: name } });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Edit Profile</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Name Fields */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            name="firstname"
            value={formData.firstname}
            onChange={handleInputChange}
            disabled={role === "HR_ADMIN" && !!initialRecord.firstname}
            className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
              errors.firstname ? "border-red-500" : "border-gray-200"
            } ${
              role === "HR_ADMIN" && !!initialRecord.firstname
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
            }`}
          />
          {errors.firstname && (
            <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>
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
            <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
        {/* Professional Fields */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Department <span className="text-red-500">*</span>
          </label>
          <input
            name="department_name"
            value={formData.department_name}
            onChange={handleInputChange}
            disabled={role === "HR_ADMIN" && !!initialRecord.department_name}
            className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
              errors.department_name ? "border-red-500" : "border-gray-200"
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
            disabled={role === "HR_ADMIN" && !!initialRecord.job_title}
            className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
              errors.job_title ? "border-red-500" : "border-gray-200"
            } ${
              role === "HR_ADMIN" && !!initialRecord.job_title
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
            }`}
          />
          {errors.job_title && (
            <p className="text-red-500 text-xs mt-1">{errors.job_title}</p>
          )}
        </div>

        {/* Location & Contact */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Work Location <span className="text-red-500">*</span>
          </label>
          <input
            name="work_location"
            value={formData.work_location}
            onChange={handleInputChange}
            disabled={role === "HR_ADMIN" && !!initialRecord.work_location}
            className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
              errors.work_location ? "border-red-500" : "border-gray-200"
            } ${
              role === "HR_ADMIN" && !!initialRecord.work_location
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
            }`}
          />
          {errors.work_location && (
            <p className="text-red-500 text-xs mt-1">{errors.work_location}</p>
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
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Personal Details */}
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
              errors.date_of_birth ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.date_of_birth && (
            <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>
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
            <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
          )}
        </div>

        {/* Address Header */}
        <div className="md:col-span-2 pt-4 pb-2">
          <h4 className="font-semibold text-gray-800 border-b pb-2">
            Permanent Address
          </h4>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <input
            name="address_line1"
            value={formData.address_line1}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all ${
              errors.address_line1 ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.address_line1 && (
            <p className="text-red-500 text-xs mt-1">{errors.address_line1}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Address Line 2 <span className="text-red-500">*</span>
          </label>
          <input
            name="address_line2"
            value={formData.address_line2}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all ${
              errors.address_line2 ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.address_line2 && (
            <p className="text-red-500 text-xs mt-1">{errors.address_line2}</p>
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

        <SearchableSelect
          label="State"
          name="state"
          options={states.map((s) => ({
            id: s.lg_state_id,
            name: s.state_name,
          }))}
          value={formData.state}
          onChange={(e) => {
            onStateChange(e.target.value, e.target.option.name);
          }}
          placeholder="Select State"
          required
        />

        <SearchableSelect
          label="District"
          name="district"
          options={districts.map((d) => ({
            id: d.district_id,
            name: d.district_name,
          }))}
          value={formData.district}
          onChange={(e) => {
            onDistrictChange(e.target.value, e.target.option.name);
          }}
          placeholder="Select District"
          disabled={!selectedStateId || loadingRegions}
          required
        />

        <SearchableSelect
          label="City"
          name="city"
          options={cities.map((v) => ({
            id: v.lg_village_id,
            name: v.village_name,
          }))}
          value={formData.city}
          onChange={(e) => onCityChange(e.target.option.name)}
          placeholder="Select City"
          disabled={!selectedDistrictId || loadingRegions}
          required
        />
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
            Pincode <span className="text-red-500">*</span>
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
            <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
            disabled
          />
        </div>

        {/* Email Fields */}
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
              errors.personal_email_id ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.personal_email_id && (
            <p className="text-red-500 text-xs mt-1">
              {errors.personal_email_id}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
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
  );
};

export default ProfileEdit;
