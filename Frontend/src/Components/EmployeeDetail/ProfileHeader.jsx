import React from "react";
import {
  Briefcase,
  UserCheck,
  Clock,
  ShieldCheck,
  Building,
  CheckCircle,
  UserX,
} from "lucide-react";

const ProfileHeader = ({
  employee,
  isEditing,
  editForm,
  setEditForm,
  children,
}) => {
  const getOnboardingStatusDisplay = (stage) => {
    if (employee.accountStatus === "Inactive") {
      return (
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm w-fit bg-gray-100 text-gray-500 border border-gray-200">
          <UserX size={16} />
          <span>Not Joined</span>
        </div>
      );
    }

    if (stage === "BASIC_INFO" && !employee.firstLoginAt) {
      return (
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm w-fit bg-orange-100 text-orange-600">
          <Clock size={16} />
          <span>Login Pending</span>
        </div>
      );
    }

    const stages = {
      BASIC_INFO: {
        label: "Profile Pending",
        color: "bg-yellow-100 text-yellow-600",
        icon: UserCheck,
      },
      PRE_JOINING: {
        label: "In Progress",
        color: "bg-blue-100 text-blue-600",
        icon: Clock,
      },
      PRE_JOINING_VERIFIED: {
        label: "Ready to Join",
        color: "bg-green-100 text-green-600",
        icon: ShieldCheck,
      },
      POST_JOINING: {
        label: "Joining Formalities",
        color: "bg-purple-100 text-purple-600",
        icon: Building,
      },
      ONBOARDED: {
        label: "Completed",
        color: "text-green-600 bg-green-100",
        icon: CheckCircle,
      },
    };

    const status = stages[stage] || {
      label: stage || "Unknown",
      color: "text-gray-600 bg-gray-100",
      icon: Clock,
    };
    const Icon = status.icon;

    return (
      <div
        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm w-fit ${status.color}`}
      >
        <Icon size={16} />
        <span>{status.label}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Cover */}
      <div className="h-24 sm:h-28 md:h-32 bg-linear-to-r from-[#2C9DE6] to-[#205081]"></div>

      <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
        <div className="relative flex flex-col md:flex-row justify-between items-center md:items-end -mt-14 sm:-mt-16 mb-6 gap-4">
          {/* Left section */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 sm:gap-6 text-center md:text-left w-full md:w-auto">
            {/* Avatar */}
            <div className="relative">
              {employee.profilePhoto || employee.profilePhotoFile ? (
                <img
                  src={
                    employee.profilePhotoFile
                      ? `/uploads/profilepic/${employee.profilePhotoFile}`
                      : employee.profilePhoto
                  }
                  alt={employee.firstName}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.querySelector(
                      ".fallback-initial",
                    ).style.display = "flex";
                  }}
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center text-3xl sm:text-4xl font-bold text-[#2C9DE6]">
                  {employee.firstName?.[0]}
                </div>
              )}

              {/* Fallback Initial */}
              <div className="fallback-initial hidden absolute inset-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md bg-white items-center justify-center text-3xl sm:text-4xl font-bold text-[#2C9DE6]">
                {employee.firstName?.[0]}
              </div>
            </div>

            {/* Name & Role */}
            <div className="mb-1 sm:mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#4E4E4E]">
                {employee.firstName} {employee.lastName}
              </h2>

              <div className="text-[#2C9DE6] font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
                <Briefcase size={14} />
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.jobTitle}
                    onChange={(e) =>
                      setEditForm({ ...editForm, jobTitle: e.target.value })
                    }
                    className="border border-blue-200 rounded px-2 py-1 text-sm text-[#2C9DE6] font-medium focus:outline-none focus:border-[#2C9DE6] w-full sm:w-auto"
                    placeholder="Job Title"
                  />
                ) : (
                  <span className="text-sm sm:text-base">
                    {employee.jobTitle || "Employee"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-2 md:mb-4">
            {getOnboardingStatusDisplay(employee.onboardingStage)}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

export default ProfileHeader;
