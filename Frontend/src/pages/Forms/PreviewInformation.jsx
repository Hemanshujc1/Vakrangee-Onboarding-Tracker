import React, { useRef } from "react";
import axios from "axios";
import usePreviewForm from "../../hooks/usePreviewForm";
import PreviewLayout from "../../Components/Forms/Shared/PreviewLayout";
import InformationHeader from "./InformationPreviewComponents/InformationHeader";
import PersonalDetails from "./InformationPreviewComponents/PersonalDetails";
import ContactDetails from "./InformationPreviewComponents/ContactDetails";
import EducationalDetails from "./InformationPreviewComponents/EducationalDetails";
import SignificantAchievements from "./InformationPreviewComponents/SignificantAchievements";
import EmploymentDetails from "./InformationPreviewComponents/EmploymentDetails";
import ReferenceDetails from "./InformationPreviewComponents/ReferenceDetails";
import Declaration from "./InformationPreviewComponents/Declaration";

const PreviewInformation = () => {
  const componentRef = useRef();

  const {
    data,
    status: derivedStatus,
    rejectionReason,
    isHR,
    autoFillLoading,
    isSubmitting,
    setIsSubmitting,
    handleVerification,
    navigate,
    showAlert,
    targetId,
  } = usePreviewForm({
    apiEndpoint: "/api/forms/save-employee-info", // Actually not used by `handleFinalSubmit` below, but used by verify.
    verifyEndpoint: "/api/forms/verify-employee-info",
    dataKey: "employeeInfoData",
    statusKey: "employeeInfoStatus",
    reasonKey: "employeeInfoRejectionReason",
  });

  if (autoFillLoading && !data)
    return <div className="p-10 text-center">Loading Preview...</div>;

  if (!data)
    return <div className="p-10 text-center">No Data Found.</div>;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
  };

  const handleSubmit = async () => {
    // In this specific form, there is no signature or file upload logic for submission.
    // However, it used showConfirm directly in `handleSubmit`. The standard forms don't prompt for confirmation on submit.
    // To match the original form behavior, we'll keep the confirmation logic.
    if (!window.confirm("Are you sure you want to submit? You won't be able to edit afterwards.")) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { ...data, isDraft: false };

      await axios.post("/api/forms/save-employee-info", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await showAlert("Form Submitted Successfully!", { type: "success" });
      navigate("/employee/pre-joining");
    } catch (err) {
      console.error(err);
      await showAlert("Submission failed", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // We need to pass record to some components as fallback, record was autoFillData. 
  // In `usePreviewForm` we don't return the full `autoFillData`, but `data` works as a fallback since it's the `employeeInfoData`.
  const record = { employeeInfoData: data };

  return (
    <PreviewLayout
      ref={componentRef}
      status={derivedStatus}
      isHR={isHR}
      onBack={() => navigate(-1)}
      onPrint={() => window.print()}
      onVerify={handleVerification}
      onEdit={() => navigate("/forms/employment-info")}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      rejectionReason={rejectionReason}
    >
      <InformationHeader data={data} record={record} />
      <PersonalDetails data={data} />
      <ContactDetails data={data} />
      <EducationalDetails data={data} formatDate={formatDate} />
      <SignificantAchievements data={data} />
      <EmploymentDetails data={data} formatDate={formatDate} />
      <ReferenceDetails data={data} />
      <Declaration data={data} record={record} />
    </PreviewLayout>
  );
};

export default PreviewInformation;
