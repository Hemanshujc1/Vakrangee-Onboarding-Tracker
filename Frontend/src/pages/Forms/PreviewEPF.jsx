import React, { useRef } from "react";
import axios from "axios";
import { formatDateForAPI } from "../../utils/formUtils";
import usePreviewForm from "../../hooks/usePreviewForm";
import PreviewLayout from "../../Components/Forms/Shared/PreviewLayout";
import EPFHeader from "./EPFPreviewComponents/EPFHeader";
import EPFMemberDetails from "./EPFPreviewComponents/EPFMemberDetails";
import EPFPreviousEmployment from "./EPFPreviewComponents/EPFPreviousEmployment";
import EPFInternationalWorker from "./EPFPreviewComponents/EPFInternationalWorker";
import EPFKYCDetails from "./EPFPreviewComponents/EPFKYCDetails";
import EPFEnrollmentDetails from "./EPFPreviewComponents/EPFEnrollmentDetails";
import EPFUndertaking from "./EPFPreviewComponents/EPFUndertaking";
import EPFEmployerDeclaration from "./EPFPreviewComponents/EPFEmployerDeclaration";

const PreviewEPF = () => {
  const componentRef = useRef();

  const {
    data: epf,
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
    targetId,
  } = usePreviewForm({
    apiEndpoint: "/api/forms/epf",
    dataKey: "epfData",
    statusKey: "epfStatus",
    reasonKey: "epfRejectionReason",
  });

  if (autoFillLoading && !epf)
    return <div className="text-center p-10">Loading Preview...</div>;
  if (!epf)
    return <div className="text-center p-10 text-red-600">No data found.</div>;

  const getValue = (key, fallback) => epf[key] || fallback || "";

  const getSignatureUrl = (path) =>
    path ? `/uploads/signatures/${path}` : null;

  const renderYesNo = (val) => {
    const isYes = val === "Yes" || val === true;
    return (
      <div className="flex justify-center items-center gap-1">
        <span className={isYes ? "font-bold" : ""}>
          Yes{isYes ? " \u2713" : ""}
        </span>
        <span>/</span>
        <span className={!isYes ? "font-bold" : ""}>
          No{!isYes ? " \u2713" : ""}
        </span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleFinalSubmit = async () => {
    if (!epf) return;
    setIsSubmitting(true);
    try {
      const payload = new FormData();

      Object.keys(epf).forEach((key) => {
        if (key === "signature") {
          if (epf.signature instanceof File) {
            payload.append("signature", epf.signature);
          }
        } else if (
          key !== "signature_path" &&
          key !== "sinature_of_employer_path" &&
          key !== "isDraft"
        ) {
          if (epf[key] !== null && epf[key] !== undefined) {
            let value = epf[key];
            if (
              [
                "dob",
                "present_joining_date",
                "date_of_exit_prev",
                "passport_valid_from",
                "passport_valid_to",
                "first_epf_enrolled_date",
              ].includes(key)
            ) {
              value = formatDateForAPI(value);
            }
            payload.append(key, value);
          }
        }
      });

      if (epf.signature_path) {
        payload.append("signature_path", epf.signature_path);
      }

      payload.append("isDraft", "false");

      const token = localStorage.getItem("token");
      await axios.post("/api/forms/epf", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await showAlert("EPF Form Submitted Successfully!", { type: "success" });
      navigate("/employee/post-joining");
    } catch (e) {
      console.error("Error submitting form:", e);
      await showAlert(
        `Submission failed: ${e.response?.data?.message || e.message}`,
        { type: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // The components expect `data` object which is the entire autofill data including applicationData.
  // In `usePreviewForm`, `data` returns `epfData`. To maintain compatibility, we wrap it:
  const wrappedData = { epfData: epf };

  return (
    <PreviewLayout
      ref={componentRef}
      status={derivedStatus}
      isHR={isHR}
      onBack={() => navigate(-1)}
      onPrint={() => window.print()}
      onVerify={handleVerification}
      onEdit={() =>
        navigate(`/forms/employees-provident-fund/${targetId}`, {
          state: {
            formData: epf,
            isEdit: true,
            isResubmitting: derivedStatus === "REJECTED",
          },
        })
      }
      onSubmit={handleFinalSubmit}
      isSubmitting={isSubmitting}
      rejectionReason={rejectionReason}
    >
      <div className="text-xs text-black leading-tight">
        <EPFHeader />

        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full">
          <table className="w-full min-w-150 border-collapse border border-black text-xs print:w-full print:min-w-0">
            <tbody>
              <EPFMemberDetails
                getValue={getValue}
                data={wrappedData}
                formatDate={formatDate}
                renderYesNo={renderYesNo}
              />

              <EPFPreviousEmployment
                getValue={getValue}
                formatDate={formatDate}
              />

              <EPFInternationalWorker
                getValue={getValue}
                formatDate={formatDate}
                renderYesNo={renderYesNo}
              />

              <EPFKYCDetails getValue={getValue} data={wrappedData} />
            </tbody>
          </table>
        </div>

        <EPFEnrollmentDetails
          getValue={getValue}
          formatDate={formatDate}
          renderYesNo={renderYesNo}
        />

        <EPFUndertaking
          getValue={getValue}
          formatDate={formatDate}
          stateSig={stateSig}
          epf={epf}
          data={wrappedData}
        />

        <EPFEmployerDeclaration
          getValue={getValue}
          data={wrappedData}
          formatDate={formatDate}
          getSignatureUrl={getSignatureUrl}
          epf={epf}
        />
      </div>
    </PreviewLayout>
  );
};

export default PreviewEPF;
