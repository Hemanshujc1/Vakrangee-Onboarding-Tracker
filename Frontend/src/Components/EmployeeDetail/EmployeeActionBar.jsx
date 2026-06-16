import React from "react";
import { ArrowLeft, Pencil, Save, X, Download, Bell } from "lucide-react";

const EmployeeActionBar = ({
  navigate,
  isEditing,
  setIsEditing,
  actionLoading,
  handleCancelEdit,
  handleSave,
  onOpenDownloadModal,
  onOpenReminderModal,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate(-1)}
          className="shrink-0 p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight truncate">
            Employee Profile
          </h1>
          <p className="text-xs text-gray-500">
            View and verify onboarding details
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2 sm:shrink-0">
        {!isEditing ? (
          <>
            <button
              onClick={onOpenDownloadModal}
              title="Download Documents"
              className="flex items-center gap-1.5 border border-blue-600 text-blue-600 bg-white hover:bg-blue-500 hover:text-white px-3 sm:px-4 py-2 rounded-lg transition-all font-semibold shadow-sm text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            >
              <Download size={16} />
              <span className="hidden xs:inline sm:inline">Download</span>
              <span className="hidden sm:inline"> Documents</span>
            </button>
            <button
              onClick={onOpenReminderModal}
              title="Send Reminder"
              className="flex items-center gap-1.5 border border-orange-400 text-orange-500 bg-white hover:bg-orange-500 hover:text-white px-3 sm:px-4 py-2 rounded-lg transition-all font-semibold shadow-sm text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            >
              <Bell size={16} />
              <span className="hidden xs:inline">Send Reminder</span>
            </button>
            <button
              onClick={() => setIsEditing(true)}
              title="Edit Profile"
              className="flex items-center gap-1.5 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            >
              <Pencil size={16} />
              <span className="hidden xs:inline">Edit Profile</span>
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancelEdit}
              disabled={actionLoading}
              className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition-all text-xs sm:text-sm font-semibold"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={actionLoading}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-3 sm:px-5 py-2 rounded-lg hover:bg-blue-700 transition-all text-xs sm:text-sm font-semibold shadow-md disabled:opacity-50"
            >
              <Save size={16} />
              <span>{actionLoading ? "Saving..." : "Save"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeActionBar;
