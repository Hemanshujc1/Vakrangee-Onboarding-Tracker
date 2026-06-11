import React from "react";
import { formatWorkLocation } from "../../../utils/employeeUtils";

const JobInformationSection = ({ register, formData, formatDate }) => {
  return (
    <>
      <div className="mt-6">
        <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
           Job Information
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 md:col-span-2">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Job</label>
          <input
            {...register("job_title")}
            disabled
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            placeholder="Not Assigned"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Department</label>
          <input
            {...register("department_name")}
            disabled
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            placeholder="Not Assigned"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Work Location
          </label>
          <input
            value={formatWorkLocation(formData.work_location) || ""}
            readOnly
            disabled
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            placeholder="Not Assigned"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Joining Date
          </label>
          <input
            value={formatDate(formData.date_of_joining)}
            disabled
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            placeholder="-"
          />
        </div>
      </div>
    </>
  );
};

export default JobInformationSection;
