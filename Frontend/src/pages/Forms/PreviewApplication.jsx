import React, { useRef } from "react";
import axios from "axios";
import usePreviewForm from "../../hooks/usePreviewForm";
import PreviewLayout from "../../Components/Forms/Shared/PreviewLayout";
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
  const componentRef = useRef();

  const {
    data: formData,
    status: derivedStatus,
    rejectionReason,
    isHR,
    autoFillLoading,
    isSubmitting,
    setIsSubmitting,
    stateSig,
    handleVerification,
    navigate,
    showAlert,
  } = usePreviewForm({
    apiEndpoint: "/api/forms/application",
    dataKey: "applicationData",
    statusKey: "applicationStatus",
    reasonKey: "applicationRejectionReason",
  });

  const photoPreview =
    formData?.photoPreview ||
    (formData?.photo instanceof File
      ? URL.createObjectURL(formData.photo)
      : null) ||
    (formData?.photo_path ? `/uploads/photos/${formData.photo_path}` : null);

  const signaturePreview =
    stateSig ||
    (formData?.signature instanceof File
      ? URL.createObjectURL(formData.signature)
      : null) ||
    (formData?.signature_path
      ? `/uploads/signatures/${formData.signature_path}`
      : null);

  if (autoFillLoading && !formData)
    return <div className="p-10 text-center">Loading...</div>;

  if (!formData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">No Data Found</h2>
        <p className="mt-2 text-gray-600">
          Please go back and fill the form again.
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

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "photo" || key === "signature") {
          if (formData[key] instanceof File) {
            payload.append(key, formData[key]);
          }
        } else if (key !== "photoPreview" && key !== "signaturePreview") {
          payload.append(
            key,
            typeof formData[key] === "object"
              ? JSON.stringify(formData[key])
              : formData[key],
          );
        }
      });
      payload.append("isDraft", "false");

      await axios.post("/api/forms/application", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      await showAlert("Form Submitted Successfully!", { type: "success" });
      navigate("/employee/pre-joining");
    } catch (error) {
      console.error("Submission Error", error);
      await showAlert("Failed to submit form.", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <PreviewLayout
      ref={componentRef}
      status={derivedStatus}
      isHR={isHR}
      onBack={() => navigate(-1)}
      onPrint={() => window.print()}
      onVerify={handleVerification}
      onEdit={() =>
        navigate("/forms/employment-application", {
          state: {
            formData,
            isEdit: true,
            isResubmitting: derivedStatus === "REJECTED",
          },
        })
      }
      onSubmit={handleFinalSubmit}
      isSubmitting={isSubmitting}
      rejectionReason={rejectionReason}
      noPadding={true}
    >
      <div className="print:text-black text-xs text-gray-900 leading-tight">
        {/* PAGE 1 */}
        <div
          className={`p-4 md:p-8 min-h-[297mm] ${bgYellow} relative print:p-8`}
        >
          <PersonalHeader formData={formData} photoPreview={photoPreview} />
          <PersonalInfo formData={formData} formatDate={formatDate} />
          <EducationInfo education={education} />
          <TrainingInfo otherTraining={otherTraining} />
        </div>

        <div className="print:break-before-page"></div>

        {/* PAGE 2 */}
        <div className={`p-4 md:p-8 min-h-[297mm] ${bgYellow} print:p-8`}>
          <AchievementsInfo achievements={achievements} />
          <PersonalDocs formData={formData} formatDate={formatDate} />
          <FamilyInfo family={family} />
          <HabitsInfo formData={formData} />
          <LanguagesInfo languages={languages} />
        </div>

        <div className="print:break-before-page"></div>

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

        <div className="print:break-before-page"></div>

        {/* PAGE 4 */}
        <div className={`p-8 min-h-[297mm] ${bgYellow}`}>
          <GeneralQuestions formData={formData} />
        </div>

        <div className="print:break-before-page"></div>

        {/* PAGE 5 */}
        <div className={`p-8 min-h-[297mm] ${bgYellow}`}>
          <Declaration
            signaturePreview={signaturePreview}
            formData={formData}
            formatDate={formatDate}
          />
        </div>
      </div>
    </PreviewLayout>
  );
};

export default PreviewApplication;
