import React from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { ArrowLeft, Pencil, Save, X } from "lucide-react";
import ProfileHeader from "../../Components/EmployeeDetail/ProfileHeader";
import PersonalInfoGrid from "../../Components/EmployeeDetail/PersonalInfoGrid";
import AddressCard from "../../Components/EmployeeDetail/AddressCard";
import EducationIdentityCard from "../../Components/EmployeeDetail/EducationIdentityCard";
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
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              <span>Back to List</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              Employee Profile
            </h1>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-all font-medium shadow-sm text-sm sm:text-sm "
            >
              <Pencil size={18} />
              <span>Edit Details</span>
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancelEdit}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                <X size={18} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-all font-medium shadow-sm disabled:opacity-70"
              >
                <Save size={18} />
                <span>{actionLoading ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Header & Personal Info */}
        <ProfileHeader
          employee={employee}
          isEditing={isEditing}
          editForm={editForm}
          setEditForm={setEditForm}
        >
          <PersonalInfoGrid
            employee={employee}
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
            hrAdmins={hrAdmins}
          />
        </ProfileHeader>

        {/* Verification Action */}
        <VerificationActionCard
          employee={employee}
          handleVerificationAction={handleVerificationAction}
          actionLoading={actionLoading}
        />

        {/* Stage Progression Control */}
        {employee.onboardingStage === "PRE_JOINING_VERIFIED" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Ready for Joining
              </h3>
              <p className="text-sm text-gray-500">
                Employee has completed all Pre-Joining requirements.
              </p>
            </div>
            <button
              onClick={() => handleAdvanceStage("POST_JOINING")}
              disabled={actionLoading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
            >
              Start Post-Joining
            </button>
          </div>
        )}

        {/* Additional Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AddressCard employee={employee} />
          <EducationIdentityCard employee={employee} />
        </div>

        {/* Employee Forms Section */}
        <EmployeeForms
          employee={employee}
          handleToggleFormAccess={handleToggleFormAccess}
        />

        {/* Documents Section */}
        <DocumentList
          documents={documents}
          handleDocumentVerification={handleDocumentVerification}
        />
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDetail;
