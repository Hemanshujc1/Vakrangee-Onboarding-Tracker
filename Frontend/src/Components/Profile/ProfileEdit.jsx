import React from "react";
import SearchableSelect from "../UI/SearchableSelect";
import { formatWorkLocation } from "../../utils/employeeUtils";
import { useRegionDropdowns } from "../../hooks/useRegionDropdowns";
import ProfileInputField from "./ProfileInputField";
import WorkLocationPicker from "../UI/WorkLocationPicker";

const ProfileEdit = ({
  formData,
  errors,
  handleInputChange,
  validateField,
  handleDeptChange,
  handleJobTitleChange,
  departments,
  designations,
  loadingDropdowns,
  onCancel,
  onSubmit,
  saving,
  role,
  initialRecord,
  companyEmail,
}) => {
  const {
    states,
    districts,
    cities,
    loadingRegions,
    selectedStateId,
    selectedDistrictId,
    onStateChange,
    onDistrictChange,
    onCityChange,
  } = useRegionDropdowns(formData, handleInputChange);

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  const maxDate = eighteenYearsAgo.toISOString().split("T")[0];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Edit Profile</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Name Fields */}
        <ProfileInputField
          label="First Name"
          name="firstname"
          value={formData.firstname}
          onChange={handleInputChange}
          onBlur={(e) => validateField("firstname", e.target.value)}
          error={errors.firstname}
          disabled={role === "HR_ADMIN" && !!initialRecord.firstname}
          required
        />

        <ProfileInputField
          label="Last Name"
          name="lastname"
          value={formData.lastname}
          onChange={handleInputChange}
          onBlur={(e) => validateField("lastname", e.target.value)}
          error={errors.lastname}
          disabled={role === "HR_ADMIN" && !!initialRecord.lastname}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
        {/* Professional Fields */}
        <div>
          <SearchableSelect
            label="Department"
            name="department_name"
            options={departments.map((dept) => ({
              id: dept.department_id,
              name: dept.department_name,
            }))}
            value={formData.department_name}
            onChange={handleDeptChange}
            placeholder="Select Department"
            required
            disabled={
              loadingDropdowns ||
              (role === "HR_ADMIN" && !!initialRecord.department_name)
            }
          />
          {errors.department_name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.department_name}
            </p>
          )}
        </div>

        <div>
          <SearchableSelect
            label="Job Title"
            name="job_title"
            options={designations.map((des) => ({
              id: des.designation_id,
              name: des.designation_name,
            }))}
            value={formData.job_title}
            onChange={handleJobTitleChange}
            placeholder="Select Job Title"
            required
            disabled={
              loadingDropdowns ||
              (role === "HR_ADMIN" && !!initialRecord.job_title)
            }
          />
          {errors.job_title && (
            <p className="text-red-500 text-xs mt-1">{errors.job_title}</p>
          )}
        </div>

        {/* Location & Contact */}
        <div className="md:col-span-2">
          <WorkLocationPicker
            layout="horizontal"
            errors={errors}
            location={
              typeof formData.work_location === "object" &&
              formData.work_location !== null
                ? formData.work_location
                : {
                    state: "",
                    district: "",
                    city: formData.work_location || "",
                  }
            }
            setLocation={(newLoc) => {
              const resolvedLoc =
                typeof newLoc === "function"
                  ? newLoc(
                      typeof formData.work_location === "object" &&
                        formData.work_location !== null
                        ? formData.work_location
                        : {
                            state: "",
                            district: "",
                            city: formData.work_location || "",
                          },
                    )
                  : newLoc;
              handleInputChange({
                target: { name: "work_location", value: resolvedLoc },
              });
            }}
          />
        </div>
        <ProfileInputField
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          onBlur={(e) => validateField("phone", e.target.value)}
          error={errors.phone}
          required
          maxLength={10}
          minLength={10}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />

        {/* Personal Details */}
        <ProfileInputField
          label="Date of Birth"
          name="date_of_birth"
          type="date"
          max={maxDate}
          value={formData.date_of_birth}
          onChange={handleInputChange}
          onBlur={(e) => validateField("date_of_birth", e.target.value)}
          error={errors.date_of_birth}
        />

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            onBlur={(e) => validateField("gender", e.target.value)}
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

        <ProfileInputField
          label="Address Line 1"
          name="address_line1"
          value={formData.address_line1}
          onChange={handleInputChange}
          onBlur={(e) => validateField("address_line1", e.target.value)}
          error={errors.address_line1}
          required
        />

        <ProfileInputField
          label="Address Line 2"
          name="address_line2"
          value={formData.address_line2}
          onChange={handleInputChange}
          onBlur={(e) => validateField("address_line2", e.target.value)}
          error={errors.address_line2}
        />

        <ProfileInputField
          label="Landmark"
          name="landmark"
          value={formData.landmark}
          onChange={handleInputChange}
          error={errors.landmark}
        />

        <SearchableSelect
          label="State"
          name="state"
          options={states.map((s) => ({
            id: s.lg_state_id,
            name: s.state_name,
          }))}
          value={formData.state}
          onChange={(e) => {
            onStateChange(e.target.value, e.target.option?.name || "");
          }}
          placeholder="Select State"
          required
          error={errors.state}
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
            onDistrictChange(e.target.value, e.target.option?.name || "");
          }}
          placeholder="Select District"
          disabled={!selectedStateId || loadingRegions}
          required
          error={errors.district}
        />

        <SearchableSelect
          label="City"
          name="city"
          options={cities.map((v) => ({
            id: v.lg_village_id,
            name: v.village_name,
          }))}
          value={formData.city}
          onChange={(e) => onCityChange(e.target.option?.name || "")}
          placeholder="Select City"
          disabled={!selectedDistrictId || loadingRegions}
          required
          error={errors.city}
        />

        <ProfileInputField
          label="Post Office/Taluka"
          name="post_office"
          value={formData.post_office}
          onChange={handleInputChange}
          error={errors.post_office}
        />

        <ProfileInputField
          label="Pincode"
          name="pincode"
          value={formData.pincode}
          onChange={handleInputChange}
          onBlur={(e) => validateField("pincode", e.target.value)}
          error={errors.pincode}
          required
          maxLength={6}
          minLength={6}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />

        <ProfileInputField
          label="Country"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          disabled
          required
        />

        {/* Email Fields */}
        <ProfileInputField
          label="Company Email"
          type="email"
          value={companyEmail}
          disabled
          required
        />

        <ProfileInputField
          label="Personal Email"
          name="personal_email_id"
          type="email"
          value={formData.personal_email_id}
          onChange={handleInputChange}
          onBlur={(e) => validateField("personal_email_id", e.target.value)}
          error={errors.personal_email_id}
        />
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
