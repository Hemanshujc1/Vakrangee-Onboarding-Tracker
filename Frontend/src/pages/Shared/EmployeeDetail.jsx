import React, { useState } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import {
  ArrowLeft,
  Pencil,
  Save,
  X,
  ChevronDown,
  FileText,
  FileCheck,
  Download,
  Bell,
  Briefcase,
} from "lucide-react";
import ProfileHeader from "../../Components/EmployeeDetail/ProfileHeader";
import PersonalInfoGrid from "../../Components/EmployeeDetail/PersonalInfoGrid";
import AddressCard from "../../Components/EmployeeDetail/AddressCard";
import JobDetailsCard from "../../Components/EmployeeDetail/JobDetailsCard";
import BasicInfoVerifyCard from "../../Components/EmployeeDetail/BasicInfoVerifyCard";
import FinalVerifyCard from "../../Components/EmployeeDetail/FinalVerifyCard";
import DocumentList from "../../Components/EmployeeDetail/DocumentList";
import EmployeeForms from "../../Components/EmployeeDetail/EmployeeForms";
import DownloadSelectionModal from "../../Components/Admin/DownloadSelectionModal";
import ReminderEmailModal from "../../Components/Admin/ReminderEmailModal";
import useEmployeeDetail from "./useEmployeeDetail";

const EmployeeDetail = () => {
  const {
    navigate,
    employee,
    loading,
    isEditing,
    setIsEditing,
    actionLoading,
    hrAdmins,
    documents,
    editForm,
    setEditForm,
    handleSave,
    handleCancelEdit,
    handleVerificationAction,
    handleDocumentVerification,
    handleAdvanceStage,
    handleToggleFormAccess,
    departmentsList,
    designationsList,
    loadingDropdowns,
    handleDeptChange,
    handleDesigChange,
    handleFinalVerify,
    isEverythingReviewed,
    isEverythingVerified,
    isBasicInfoComplete,
    emailSent,
  } = useEmployeeDetail();

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    documents: false,
    employeeForms: false,
    jobAndAddress: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="p-10 text-center text-gray-500">Loading profile...</div>
      </DashboardLayout>
    );

  if (!employee)
    return (
      <DashboardLayout>
        <div className="p-10 text-center text-gray-500">
          Employee not found.
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Top Navigation & Verification Action Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Back button + Title */}
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

          {/* Right: Action Buttons */}
          <div className="flex items-center flex-wrap gap-2 sm:shrink-0">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsDownloadModalOpen(true)}
                  title="Download Documents"
                  className="flex items-center gap-1.5 border border-blue-600 text-blue-600 bg-white hover:bg-blue-500 hover:text-white px-3 sm:px-4 py-2 rounded-lg transition-all font-semibold shadow-sm text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                >
                  <Download size={16} />
                  <span className="hidden xs:inline sm:inline">Download</span>
                  <span className="hidden sm:inline"> Documents</span>
                </button>
                <button
                  onClick={() => setIsReminderModalOpen(true)}
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

        {/* Profile Header & Personal Info Grid (Combined Card) */}
        <ProfileHeader
          employee={employee}
          isEditing={isEditing}
          editForm={editForm}
          setEditForm={setEditForm}
          designationsList={designationsList}
          handleDesigChange={handleDesigChange}
          loadingDropdowns={loadingDropdowns}
        >
          <PersonalInfoGrid
            employee={employee}
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
          />
        </ProfileHeader>

        {/* Stage Control: BASIC_INFO to PRE_JOINING (Manual) */}
        {employee.onboardingStage === "BASIC_INFO" &&
          isEverythingVerified() && (
            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-sm font-bold text-blue-800 mb-1">
                  Ready for Pre-joining
                </h3>
                <p className="text-xs text-blue-600">
                  All basic information and mandatory documents are verified.
                </p>
              </div>
              <button
                onClick={() => handleAdvanceStage("PRE_JOINING")}
                disabled={actionLoading}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
              >
                Confirm & Start Pre joining
              </button>
            </div>
          )}

        {/* Stage Control: PRE_JOINING_VERIFIED to POST_JOINING */}
        {employee.onboardingStage === "PRE_JOINING_VERIFIED" && (
          <div className="bg-green-50/50 p-6 rounded-xl border border-green-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-sm font-bold text-green-800 mb-1">
                Ready for Joining
              </h3>
              <p className="text-xs text-green-600">
                Verification complete. Start the post-joining onboarding
                process.
              </p>
            </div>
            <button
              onClick={() => handleAdvanceStage("POST_JOINING")}
              disabled={actionLoading}
              className="bg-green-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition-all shadow-md disabled:opacity-50"
            >
              Confirm & Start Joining
            </button>
          </div>
        )}

        {/* Accordion for Job Details & Address Cards */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("jobAndAddress")}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-all font-semibold text-gray-700 focus:outline-none group"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-(--color-primary)/10 text-(--color-primary) rounded-lg group-hover:bg-(--color-primary)/20 transition-all">
                <Briefcase size={18} />
              </span>
              <span className="text-base font-bold text-(--color-text-dark) group-hover:text-(--color-primary) transition-colors">Official Job Details & Residential Address</span>
            </div>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-all duration-200 group-hover:text-(--color-primary) ${
                openSections.jobAndAddress ? "rotate-180" : ""
              }`}
            />
          </button>
          {openSections.jobAndAddress && (
            <div className="border-t border-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <JobDetailsCard
                  employee={employee}
                  isEditing={isEditing}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  hrAdmins={hrAdmins}
                  departmentsList={departmentsList}
                  designationsList={designationsList}
                  loadingDropdowns={loadingDropdowns}
                  handleDeptChange={handleDeptChange}
                  handleDesigChange={handleDesigChange}
                />
                <AddressCard employee={employee} />
              </div>
            </div>
          )}
        </div>

        <BasicInfoVerifyCard
          employee={employee}
          handleVerificationAction={handleVerificationAction}
          isBasicInfoComplete={isBasicInfoComplete}
          actionLoading={actionLoading}
        />

        {/* Accordion for Onboarding Documents */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("documents")}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-all font-semibold text-gray-700 focus:outline-none group"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-(--color-primary)/10 text-(--color-primary) rounded-lg group-hover:bg-(--color-primary)/20 transition-all">
                <FileText size={18} />
              </span>
              <span className="text-base font-bold text-(--color-text-dark) group-hover:text-(--color-primary) transition-colors">Onboarding Documents</span>
            </div>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-all duration-200 group-hover:text-(--color-primary) ${
                openSections.documents ? "rotate-180" : ""
              }`}
            />
          </button>
          {openSections.documents && (
            <div className="border-t border-gray-100 p-2">
              <DocumentList
                documents={documents}
                employeeId={employee.id}
                handleDocumentVerification={handleDocumentVerification}
              />
            </div>
          )}
        </div>

        <FinalVerifyCard
          employee={employee}
          documents={documents}
          handleFinalVerify={handleFinalVerify}
          isEverythingReviewed={isEverythingReviewed}
          emailSent={emailSent}
          actionLoading={actionLoading}
        />

        {/* Accordion for Employee Forms */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("employeeForms")}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-all font-semibold text-gray-700 focus:outline-none group"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-(--color-primary)/10 text-(--color-primary) rounded-lg group-hover:bg-(--color-primary)/20 transition-all">
                <FileCheck size={18} />
              </span>
              <span className="text-base font-bold text-(--color-text-dark) group-hover:text-(--color-primary) transition-colors">
                Employee Forms & Form Access
              </span>
            </div>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-all duration-200 group-hover:text-(--color-primary) ${
                openSections.employeeForms ? "rotate-180" : ""
              }`}
            />
          </button>
          {openSections.employeeForms && (
            <div className="border-t border-gray-100 p-2">
              <EmployeeForms
                employee={employee}
                handleToggleFormAccess={handleToggleFormAccess}
              />
            </div>
          )}
        </div>
        <DownloadSelectionModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          employee={employee}
          documents={documents}
        />
        <ReminderEmailModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          employee={employee}
          documents={documents}
        />
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDetail;
