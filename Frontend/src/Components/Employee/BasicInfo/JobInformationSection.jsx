import React from "react";
import { formatWorkLocation } from "../../../utils/employeeUtils";
import FormInputField from "../../UI/FormInputField";
import { formatDate } from "../../../utils/basicInfoHelpers";

const JobInformationSection = ({ register, formData }) => {
  return (
    <>
      <div className="mt-6">
        <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
           Job Information
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 md:col-span-2">
        <FormInputField
          label="Job"
          name="job_title"
          register={register}
          isEditing={true}
          value={formData.job_title}
          disabled={true}
          placeholder="Not Assigned"
        />
        <FormInputField
          label="Department"
          name="department_name"
          register={register}
          isEditing={true}
          value={formData.department_name}
          disabled={true}
          placeholder="Not Assigned"
        />
        <FormInputField
          label="Band"
          name="band_name"
          register={register}
          isEditing={true}
          value={formData.band_name}
          disabled={true}
          placeholder="Not Assigned"
        />
        <FormInputField
          label="Level"
          name="level_name"
          register={register}
          isEditing={true}
          value={formData.level_name}
          disabled={true}
          placeholder="Not Assigned"
        />
        <div className="w-full">
          <label className="block text-sm text-gray-500 mb-1">
            Work Location
          </label>
          <input
            value={formatWorkLocation(formData.work_location) || ""}
            readOnly
            disabled
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
            placeholder="Not Assigned"
          />
        </div>
        <div className="w-full">
          <label className="block text-sm text-gray-500 mb-1">
            Joining Date
          </label>
          <input
            value={formatDate(formData.date_of_joining) || ""}
            disabled
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
            placeholder="-"
          />
        </div>
      </div>
    </>
  );
};

export default JobInformationSection;
