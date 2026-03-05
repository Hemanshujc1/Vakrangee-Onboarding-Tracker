import React from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { ArrowLeft, Pencil, Save, X } from "lucide-react";
import ProfileHeader from "../../Components/EmployeeDetail/ProfileHeader";
import PersonalInfoGrid from "../../Components/EmployeeDetail/PersonalInfoGrid";
import AddressCard from "../../Components/EmployeeDetail/AddressCard";
import JobDetailsCard from "../../Components/EmployeeDetail/JobDetailsCard";
import VerificationActionCard from "../../Components/EmployeeDetail/VerificationActionCard";
import DocumentList from "../../Components/EmployeeDetail/DocumentList";
import EmployeeForms from "../../Components/EmployeeDetail/EmployeeForms";
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
  } = useEmployeeDetail();

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
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md text-sm whitespace-nowrap"
              >
                <Pencil size={18} />
                <span>Edit Profile</span>
              </button>
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

        {/* Stage Control (Prominent if ready) */}
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

        {/* Documents Section */}
        <DocumentList
          documents={documents}
          handleDocumentVerification={handleDocumentVerification}
        />

        <VerificationActionCard
          employee={employee}
          handleVerificationAction={handleVerificationAction}
          actionLoading={actionLoading}
        />
        {/* Employee Forms Section */}
        <EmployeeForms
          employee={employee}
          handleToggleFormAccess={handleToggleFormAccess}
        />
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDetail;
