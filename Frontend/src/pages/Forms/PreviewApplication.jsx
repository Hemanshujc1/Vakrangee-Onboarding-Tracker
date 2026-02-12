import React, { useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { PreviewActions } from "../../Components/Forms/Shared";
import useAutoFill from "../../hooks/useAutoFill";
import { useAlert } from "../../context/AlertContext";
import PersonalHeader from "./ApplicationPreviewComponents/PersonalHeader";
import PersonalInfo from "./ApplicationPreviewComponents/PersonalInfo";
import EducationInfo from "./ApplicationPreviewComponents/EducationInfo";
import TrainingInfo from "./ApplicationPreviewComponents/TrainingInfo";
import AchievementsInfo from "./ApplicationPreviewComponents/AchievementsInfo";
import PersonalDocs from "./ApplicationPreviewComponents/PersonalDocs";
import FamilyInfo from "./ApplicationPreviewComponents/FamilyInfo";
import HabitsInfo from "./ApplicationPreviewComponents/HabitsInfo";
import LanguagesInfo from "./ApplicationPreviewComponents/LanguagesInfo";
import WorkExperienceInfo from "./ApplicationPreviewComponents/WorkExperienceInfo";
import EmploymentHistoryInfo from "./ApplicationPreviewComponents/EmploymentHistoryInfo";
import ReferenceInfo from "./ApplicationPreviewComponents/ReferenceInfo";
import GeneralQuestions from "./ApplicationPreviewComponents/GeneralQuestions";
import Declaration from "./ApplicationPreviewComponents/Declaration";

const PreviewApplication = () => {
  const navigate = useNavigate();
  const componentRef = useRef();
  const location = useLocation();
  const { showAlert, showConfirm, showPrompt } = useAlert();
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Get identifiers from state (fallback to user/params)
  const {
    formData: stateData,
    status: stateStatus,
    isHR: stateIsHR,
    employeeId: stateEmployeeId,
    rejectionReason: stateRejectionReason,
    fromPreviewSubmit,
    signaturePreview,
  } = location.state || {};

  const { employeeId } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const targetId = stateEmployeeId || employeeId || user.employeeId;
  const isHR = stateIsHR || ["HR_ADMIN", "HR_SUPER_ADMIN"].includes(user.role);

  // 2. Fetch backend data (fallback/robustness)
  const { data: autoFillData, loading, error } = useAutoFill(targetId);

  // 3. Derive form data
  // Prefer state data if available (e.g. just submitted/edited)
  const formData = stateData || autoFillData?.applicationData;
  const status = stateStatus || autoFillData?.applicationStatus || "PENDING";
  const rejectionReason =
    stateRejectionReason || autoFillData?.applicationRejectionReason;

  if (loading && !formData)
    return <div className="p-10 text-center">Loading...</div>;

  if (error && !formData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">
          Error Loading Application
        </h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-blue-600 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">
          Application Not Found
        </h2>
        <p className="mt-2 text-gray-600">
          No application form data found for this employee.
        </p>
        <button
          onClick={() => navigate("/forms/employment-application")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Form
        </button>
      </div>
    );
  }

  const handleVerification = async (newStatus, reason = null) => {
    const isConfirmed = await showConfirm(
      `Are you sure you want to ${newStatus === "VERIFIED" ? "approve" : "reject"} this form?`,
    );
    if (!isConfirmed) return;

    if (newStatus === "REJECTED" && !reason) {
      reason = await showPrompt(
        "Please provide a detailed reason for rejecting this employment application form:",
        {
          title: "Rejection Reason",
          type: "warning",
          placeholder:
            "Enter the reason for rejection (minimum 10 characters)...",
          confirmText: "Submit Rejection",
          cancelText: "Cancel",
        },
      );
      if (!reason) return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/forms/application/verify/${targetId}`,
        { status: newStatus, remarks: reason },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      await showAlert(
        `Form ${newStatus === "VERIFIED" ? "Approved" : "Rejected"} Successfully!`,
        { type: "success" },
      );
      // Update state/reload or navigate back
      navigate(-1);
    } catch (error) {
      console.error("Verification Error:", error);
      await showAlert("Failed to update status.", { type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to format date consistent with DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const parse = (field) => {
    if (Array.isArray(field)) return field;
    try {
      return JSON.parse(field || "[]");
    } catch (e) {
      return [];
    }
  };

  const education = parse(formData.education);
  const otherTraining = parse(formData.otherTraining);
  const achievements = parse(formData.achievements);
  const languages = parse(formData.languages);
  const workExperience = parse(formData.workExperience);
  const employmentHistory = parse(formData.employmentHistory);
  const references = parse(formData.references);
  const family = parse(formData.family);

  const bgYellow = "bg-[#ffffcc]";

  const handleFinalSubmit = async () => {
    const isConfirmed = await showConfirm(
      "Are you sure you want to submit? This will lock the form.",
    );
    if (!isConfirmed) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const submissionData = formData; // Use current formData
      const dataToSend = new FormData();

      Object.keys(submissionData).forEach((key) => {
        if (key === "isDraft") return;
        if (Array.isArray(submissionData[key])) {
          dataToSend.append(key, JSON.stringify(submissionData[key]));
        } else if (key === "signature" && submissionData[key] instanceof File) {
          dataToSend.append("signature", submissionData[key]);
        } else {
          dataToSend.append(
            key,
            submissionData[key] === null || submissionData[key] === undefined
              ? ""
              : submissionData[key],
          );
        }
      });
      dataToSend.append("isDraft", false);

      const response = await fetch("/api/forms/application", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend,
      });

      if (response.ok) {
        await showAlert("Form Submitted Successfully!", { type: "success" });
        navigate("/employee/pre-joining");
      } else {
        const err = await response.json();
        await showAlert(`Error: ${err.message}`, { type: "error" });
      }
    } catch (e) {
      console.error(e);
      await showAlert("Submission failed", { type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans print:bg-white print:p-0 print:m-0">
      <style>
        {`
        @media print {
          @page { margin: 0; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-before: always; }
        }
        `}
      </style>

      <div className="max-w-[210mm] mx-auto print:max-w-full">
        {/* Actions Bar - Outside Printable Area */}
        <div className="print:hidden mb-6">
          <PreviewActions
            status={status}
            isHR={isHR}
            onBack={() => navigate(-1)} // Or specific path
            onSubmit={handleFinalSubmit}
            onVerify={handleVerification}
            onEdit={() =>
              navigate("/forms/employment-application", {
                state: { formData, isEdit: true, isDraft: true },
              })
            }
            isSubmitHidden={!fromPreviewSubmit && status !== "DRAFT"}
            loading={actionLoading}
          />

          {/* Rejection Alert */}
          {(status === "REJECTED" ||
            (status === "DRAFT" && rejectionReason)) && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <div className="font-bold flex items-center gap-2 mb-1">
                Form Rejected
              </div>
              <p className="text-sm px-1">
                <span className="font-semibold">Reason:</span> {rejectionReason}
              </p>
              <p className="text-xs mt-2 text-red-600">
                Please review the reason and click "Edit & Resubmit" to make
                necessary changes.
              </p>
            </div>
          )}
        </div>

        {/* Printable Content */}
        <div className="bg-white shadow-lg print:shadow-none print:w-full print:max-w-full flex flex-col">
          <div
            ref={componentRef}
            className="print:text-black text-xs text-gray-900 leading-tight"
          >
            {/* PAGE 1 */}
            <div
              className={`p-4 md:p-8 min-h-[297mm] ${bgYellow} relative print:p-8`}
            >
              <PersonalHeader autoFillData={autoFillData} />
              <PersonalInfo formData={formData} formatDate={formatDate} />
              <EducationInfo education={education} />
              <TrainingInfo otherTraining={otherTraining} />
            </div>

            <div className="page-break"></div>

            {/* PAGE 2 */}
            <div className={`p-4 md:p-8 min-h-[297mm] ${bgYellow} print:p-8`}>
              <AchievementsInfo achievements={achievements} />
              <PersonalDocs formData={formData} formatDate={formatDate} />
              <FamilyInfo family={family} />
              <HabitsInfo formData={formData} />
              <LanguagesInfo languages={languages} />
            </div>

            <div className="page-break"></div>

            {/* PAGE 3 */}
            <div className={`p-4 md:p-8 min-h-[297mm] ${bgYellow} print:p-8`}>
              <WorkExperienceInfo
                workExperience={workExperience}
                formatDate={formatDate}
              />
              <EmploymentHistoryInfo
                employmentHistory={employmentHistory}
                formatDate={formatDate}
              />
              <ReferenceInfo references={references} />
            </div>

            <div className="page-break"></div>

            {/* PAGE 4 */}
            <div className={`p-8 min-h-[297mm] ${bgYellow}`}>
              <GeneralQuestions formData={formData} />
            </div>

            <div className="page-break"></div>

            {/* PAGE 5 */}
            <div className={`p-8 min-h-[297mm] ${bgYellow}`}>
              <Declaration
                signaturePreview={signaturePreview}
                formData={formData}
                autoFillData={autoFillData}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewApplication;
