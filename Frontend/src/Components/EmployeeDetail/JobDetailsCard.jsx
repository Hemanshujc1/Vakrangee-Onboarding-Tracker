import React from "react";
import { Building, MapPin, Calendar, UserCheck, Briefcase } from "lucide-react";
import SearchableSelect from "../UI/SearchableSelect";

const JobDetailsCard = ({
  employee,
  isEditing,
  editForm,
  setEditForm,
  hrAdmins,
  departmentsList = [],
  designationsList = [],
  loadingDropdowns = false,
  handleDeptChange,
  handleDesigChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full font-inter">
      <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-50">
        <div className="p-1.5 bg-(--color-primary)/10 text-(--color-primary) rounded-lg">
          <Building size={18} />
        </div>
        <h3 className="text-lg font-bold text-(--color-text-dark)">
          Official Job Details
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
        {/* Department */}
        <div className="flex items-center gap-3 text-gray-600">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
            <Building size={18} />
          </div>
          <div className="w-full min-w-0">
            <p className="text-xs text-gray-400">Department</p>
            {isEditing ? (
              <SearchableSelect
                name="department"
                options={departmentsList.map((dept) => ({
                  id: dept.department_id,
                  name: dept.department_name,
                }))}
                value={editForm.department_id || editForm.department}
                onChange={handleDeptChange}
                placeholder="Select Department"
                disabled={loadingDropdowns}
              />
            ) : (
              <p className="font-medium text-sm truncate">
                {employee.department || "N/A"}
              </p>
            )}
          </div>
        </div>

        {/* Job Title */}
        <div className="flex items-center gap-3 text-gray-600">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
            <Briefcase size={18} />
          </div>
          <div className="w-full min-w-0">
            <p className="text-xs text-gray-400">Job Title</p>
            {isEditing ? (
              <SearchableSelect
                name="jobTitle"
                options={designationsList.map((des) => ({
                  id: des.designation_id,
                  name: des.designation_name,
                }))}
                value={editForm.designation_id || editForm.jobTitle}
                onChange={handleDesigChange}
                placeholder="Select Job Title"
                disabled={loadingDropdowns}
              />
            ) : (
              <p className="font-medium text-sm truncate">
                {employee.jobTitle || "N/A"}
              </p>
            )}
          </div>
        </div>

        {/* Work Location */}
        <div className="flex items-center gap-3 text-gray-600">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
            <MapPin size={18} />
          </div>
          <div className="w-full min-w-0">
            <p className="text-xs text-gray-400">Work Location</p>
            {isEditing ? (
              <input
                type="text"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mt-1 focus:outline-none focus:border-blue-500 transition-all"
                placeholder="Work Location"
              />
            ) : (
              <p className="font-medium text-sm truncate">
                {employee.location || "N/A"}
              </p>
            )}
          </div>
        </div>

        {/* Joining Date */}
        <div className="flex items-center gap-3 text-gray-600">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
            <Calendar size={18} />
          </div>
          <div className="w-full min-w-0">
            <p className="text-xs text-gray-400">Joining Date</p>
            {isEditing ? (
              <input
                type="date"
                value={editForm.dateOfJoining}
                onChange={(e) =>
                  setEditForm({ ...editForm, dateOfJoining: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mt-1 focus:outline-none focus:border-blue-500 transition-all"
              />
            ) : (
              <p className="font-medium text-sm truncate">
                {employee.dateOfJoining
                  ? new Date(employee.dateOfJoining).toLocaleDateString("en-GB")
                  : "N/A"}
              </p>
            )}
          </div>
        </div>

        {/* Assigned HR */}
        <div className="flex items-center gap-3 text-gray-600 col-span-1 sm:col-span-2">
          {/* <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
            <UserCheck size={18} />
          </div> */}
          <div className="w-full min-w-0">
            <p className="text-xs text-gray-400">Assigned Onboarding HR</p>
            {isEditing ? (
              <select
                value={editForm.onboardingHrId}
                onChange={(e) =>
                  setEditForm({ ...editForm, onboardingHrId: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mt-1 focus:outline-none focus:border-blue-500 transition-all bg-white"
              >
                <option value="">-- Select HR --</option>
                {hrAdmins.map((hr) => (
                  <option key={hr.id} value={hr.userId || hr.id}>
                    {hr.firstName} {hr.lastName} ({hr.role})
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-3 mt-1">
                {employee.assignedHR ? (
                  <>
                    <div className="h-8 w-8 rounded-full bg-(--color-primary)/10 flex items-center justify-center text-(--color-primary) font-bold text-xs shrink-0">
                      {employee.assignedHR.name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {employee.assignedHR.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {employee.assignedHR.email}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="font-medium text-sm text-gray-400 italic">
                    Not Assigned
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsCard;
