import React, { useState } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import {
  ArrowLeft,
  Pencil,
  Save,
  X,
  ChevronDown,
  UserCheck,
  Building,
  ShieldCheck,
  FileText,
  CheckSquare,
  FileCheck,
  Download,
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
  const [openSections, setOpenSections] = useState({
    documents: false,
    employeeForms: false,
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                Employee Profile
              </h1>
              <p className="text-xs text-gray-500">
                View and verify onboarding details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="flex items-center gap-2 border border-blue-600 text-blue-600 bg-white hover:bg-blue-500 hover:text-white px-5 py-2 rounded-lg transition-all font-semibold shadow-sm text-sm whitespace-nowrap cursor-pointer"
                >
                  <Download size={18} />
                  <span>Download Documents</span>
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  <Pencil size={18} />
                  <span>Edit Profile</span>
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all text-sm font-semibold"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold shadow-md disabled:opacity-50"
                >
                  <Save size={18} />
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
        {employee.onboardingStage === "BASIC_INFO" && isEverythingVerified() && (
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
                Verification complete. Start the post-joining onboarding process.
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

        {/* Row 2: Official Job Details & Residential Address (Side by Side) */}
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
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-all font-semibold text-gray-700 focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <FileText size={18} />
              </span>
              <span className="text-base font-bold">Onboarding Documents</span>
            </div>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform duration-200 ${
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
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-all font-semibold text-gray-700 focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <FileCheck size={18} />
              </span>
              <span className="text-base font-bold">Employee Forms & Form Access</span>
            </div>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform duration-200 ${
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
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDetail;
