import React from "react";

const ProfileView = ({ formData, companyEmail, fullAddress, onEdit }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Profile Details</h3>
        <button
          onClick={onEdit}
          className="text-xs sm:text-sm px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <label className="text-sm text-gray-500 block mb-1">First Name</label>
          <p className="font-medium text-gray-800">
            {formData.firstname || "-"}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-500 block mb-1">Last Name</label>
          <p className="font-medium text-gray-800">
            {formData.lastname || "-"}
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-500 block mb-1">Department</label>
          <p className="font-medium text-gray-800">
            {formData.department_name || "-"}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-500 block mb-1">Job Title</label>
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
          <label className="text-sm text-gray-500 block mb-1">Phone</label>
          <p className="font-medium text-gray-800">{formData.phone || "-"}</p>
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
          <p className="font-medium text-gray-800">{companyEmail || "-"}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500 block mb-1">
            Date of Birth
          </label>
          <p className="font-medium text-gray-800">
            {formData.date_of_birth
              ? new Date(formData.date_of_birth).toLocaleDateString("en-GB")
              : "-"}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-500 block mb-1">Gender</label>
          <p className="font-medium text-gray-800">{formData.gender || "-"}</p>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-gray-500 block mb-1">Address</label>
          <p className="font-medium text-gray-800">{fullAddress || "-"}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
