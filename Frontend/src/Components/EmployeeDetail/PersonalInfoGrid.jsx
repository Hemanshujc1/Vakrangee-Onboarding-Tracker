import React from "react";
import {
  Mail,
  Phone,
  Building,
  MapPin,
  Users,
  CalendarDays,
  Calendar,
  UserCheck,

} from "lucide-react";

const PersonalInfoGrid = ({
  employee,
  isEditing,
  editForm,
  setEditForm,
  hrAdmins,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
      {/* Email */}
      <div className="flex items-center gap-3 text-gray-600">
        <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
          <Mail size={18} />
        </div>
        <div>
          <p className="text-xs text-gray-400">Personal Email</p>
          {isEditing ? (
            <input
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-[#2C9DE6]"
              placeholder="Email"
            />
          ) : (
            <p className="font-medium text-sm">{employee.email}</p>
          )}
        </div>
      </div>
      {/* Phone */}
      <div className="flex items-center gap-3 text-gray-600">
        <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
          <Phone size={18} />
        </div>
        <div>
          <p className="text-xs text-gray-400">Phone</p>
          <p className="font-medium text-sm">{employee.phone || "N/A"}</p>
        </div>
      </div>
      {/* Department */}
      <div className="flex items-center gap-3 text-gray-600">
        <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
          <Building size={18} />
        </div>
        <div className="w-full">
          <p className="text-xs text-gray-400">Department</p>
          {isEditing ? (
            <input
              type="text"
              value={editForm.department}
              onChange={(e) =>
                setEditForm({ ...editForm, department: e.target.value })
              }
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-[#2C9DE6]"
              placeholder="Department"
            />
          ) : (
            <p className="font-medium text-sm">
              {employee.department || "N/A"}
            </p>
          )}
        </div>
      </div>
      {/* Work Location */}
      <div className="flex items-center gap-3 text-gray-600">
        <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
          <MapPin size={18} />
        </div>
        <div className="w-full">
          <p className="text-xs text-gray-400">Work Location</p>
          {isEditing ? (
            <input
              type="text"
              value={editForm.location}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-[#2C9DE6]"
              placeholder="Work Location"
            />
          ) : (
            <p className="font-medium text-sm">{employee.location || "N/A"}</p>
          )}
        </div>
      </div>
      {/* Gender */}
      <div className="flex items-center gap-3 text-gray-600">
        <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
          <Users size={18} />
        </div>
        <div>
          <p className="text-xs text-gray-400">Gender</p>
          <p className="font-medium text-sm">{employee.gender || "N/A"}</p>
        </div>
      </div>
      {/* date of birth */}
      <div className="flex items-center gap-3 text-gray-600">
        <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
          <CalendarDays size={18} />
        </div>
        <div>
          <p className="text-xs text-gray-400">Date of Birth</p>
          <p className="font-medium text-sm">
            {new Date(employee.dateOfBirth).toLocaleDateString("en-GB") ||
              "N/A"}
          </p>
        </div>
      </div>
      {/* Joining Date */}
      <div className="flex items-center gap-3 text-gray-600">
        <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
          <Calendar size={18} />
        </div>
        <div className="w-full">
          <p className="text-xs text-gray-400">Joining Date</p>
          {isEditing ? (
            <input
              type="date"
              value={editForm.dateOfJoining}
              onChange={(e) =>
                setEditForm({ ...editForm, dateOfJoining: e.target.value })
              }
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-[#2C9DE6]"
            />
          ) : (
            <p className="font-medium text-sm">
              {new Date(employee.dateOfJoining).toLocaleDateString("en-GB") ||
                "N/A"}
            </p>
          )}
        </div>
      </div>
      {/* Assigned HR */}
      <div className="flex items-center gap-3 text-gray-600">
        <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
          <UserCheck size={18} />
        </div>
        <div className="w-full">
          <p className="text-xs text-gray-400">Assigned HR</p>
          {isEditing ? (
            <select
              value={editForm.onboardingHrId}
              onChange={(e) =>
                setEditForm({ ...editForm, onboardingHrId: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:border-[#2C9DE6] bg-white"
            >
              <option value="">-- Select --</option>
              {hrAdmins.map((hr) => (
                <option key={hr.id} value={hr.userId || hr.id}>
                  {hr.firstName} {hr.lastName}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex flex-col">
              <span className="font-medium text-sm">
                {employee.assignedHR
                  ? employee.assignedHR.name
                  : "Not Assigned"}
              </span>
              {employee.assignedHR && (
                <span className="text-xs text-gray-500">
                  {employee.assignedHR.email}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default PersonalInfoGrid;
