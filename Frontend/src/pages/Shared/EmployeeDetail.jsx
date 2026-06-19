import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import {
  FileText,
  FileCheck,
  Briefcase,
} from "lucide-react";
import EmployeeProfileHeader from "../../Components/EmployeeDetail/EmployeeProfileHeader";
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
import EmployeeActionBar from "../../Components/EmployeeDetail/EmployeeActionBar";
import AccordionSection from "../../Components/EmployeeDetail/AccordionSection";
import StageControl from "../../Components/EmployeeDetail/StageControl";

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

  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#documents") {
      setOpenSections((prev) => ({ ...prev, documents: true }));
      setTimeout(() => {
        const el = document.getElementById("documents");
        if (el) {
          const yOffset = -80;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 300);
    }
  }, [location.hash]);

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
        
        <EmployeeActionBar
          navigate={navigate}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          actionLoading={actionLoading}
          handleCancelEdit={handleCancelEdit}
          handleSave={handleSave}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          onOpenReminderModal={() => setIsReminderModalOpen(true)}
        />

        {/* Profile Header & Personal Info Grid (Combined Card) */}
        <EmployeeProfileHeader
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
        </EmployeeProfileHeader>

        <StageControl
          employee={employee}
          isEverythingVerified={isEverythingVerified}
          actionLoading={actionLoading}
          handleAdvanceStage={handleAdvanceStage}
        />

        <AccordionSection
          title="Official Job Details & Residential Address"
          icon={Briefcase}
          isOpen={openSections.jobAndAddress}
          onToggle={() => toggleSection("jobAndAddress")}
        >
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
        </AccordionSection>

        <BasicInfoVerifyCard
          employee={employee}
          handleVerificationAction={handleVerificationAction}
          isBasicInfoComplete={isBasicInfoComplete}
          actionLoading={actionLoading}
        />

        <AccordionSection
          id="documents"
          title="Onboarding Documents"
          icon={FileText}
          isOpen={openSections.documents}
          onToggle={() => toggleSection("documents")}
          contentPadding="p-2"
        >
          <DocumentList
            documents={documents}
            employeeId={employee.id}
            handleDocumentVerification={handleDocumentVerification}
          />
        </AccordionSection>

        <FinalVerifyCard
          employee={employee}
          documents={documents}
          handleFinalVerify={handleFinalVerify}
          isEverythingReviewed={isEverythingReviewed}
          emailSent={emailSent}
          actionLoading={actionLoading}
        />

        <AccordionSection
          title="Employee Forms & Form Access"
          icon={FileCheck}
          isOpen={openSections.employeeForms}
          onToggle={() => toggleSection("employeeForms")}
          contentPadding="p-2"
        >
          <EmployeeForms
            employee={employee}
            handleToggleFormAccess={handleToggleFormAccess}
          />
        </AccordionSection>

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
