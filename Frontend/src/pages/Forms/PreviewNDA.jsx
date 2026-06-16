import React, { useRef } from "react";
import axios from "axios";
import { DocumentHeader } from "../../Components/Forms/Shared";
import usePreviewForm from "../../hooks/usePreviewForm";
import PreviewLayout from "../../Components/Forms/Shared/PreviewLayout";
import Parties from "./PreviewNDASections/Parties";
import TermsAndConditions from "./PreviewNDASections/TermsAndConditions";
import Signatures from "./PreviewNDASections/Signatures";

const PreviewNDA = () => {
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
    apiEndpoint: "/api/forms/nda",
    dataKey: "ndaData",
    statusKey: "ndaStatus",
    reasonKey: "ndaRejectionReason",
  });

  const finalSignature =
    stateSig ||
    (formData?.signature instanceof File
      ? URL.createObjectURL(formData.signature)
      : null) ||
    (formData?.signature_path
      ? `/uploads/signatures/${formData.signature_path}`
      : null);

  if (autoFillLoading && !formData) {
    return <div className="p-10 text-center">Loading Preview...</div>;
  }

  if (!formData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800">No Data to Preview</h2>
        <button
          onClick={() => navigate("/forms/non-disclosure-agreement")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "signature") {
          if (formData.signature instanceof File) {
            payload.append("signature", formData.signature);
          }
        } else {
          payload.append(key, formData[key] || "");
        }
      });
      payload.append("isDraft", "false");

      const token = localStorage.getItem("token");
      const response = await fetch("/api/forms/nda", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      if (response.ok) {
        await showAlert("NDA Submitted Successfully!", { type: "success" });
        navigate("/employee/post-joining");
      } else {
        const error = await response.json();
        await showAlert(`Error: ${error.message}`, { type: "error" });
      }
    } catch (e) {
      console.error(e);
      await showAlert("Submission failed.", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PreviewLayout
      ref={componentRef}
      status={derivedStatus}
      isHR={isHR}
      onBack={() => navigate(-1)}
      onPrint={() => window.print()}
      onVerify={handleVerification}
      onEdit={() =>
        navigate("/forms/non-disclosure-agreement", {
          state: {
            formData: formData,
            isEdit: true,
            isResubmitting: derivedStatus === "REJECTED",
            rejectionReason: rejectionReason,
          },
        })
      }
      onSubmit={handleFinalSubmit}
      isSubmitting={isSubmitting}
      rejectionReason={rejectionReason}
    >
      <DocumentHeader
        title="Non-Disclosure Agreement"
        subtitle="Confidentiality Agreement"
      />

      <hr className="border-t-2 border-gray-800 mb-8" />

      {/* 3. Effective Date */}
      <div className="mb-6 text-sm">
        <p className="mb-1">The "Agreement" is made effective from:</p>
        <p>Date: {new Date().toLocaleDateString()}</p>
      </div>

      <Parties formData={formData} />

      <TermsAndConditions />

      <Signatures
        formData={formData}
        finalSignature={finalSignature}
      />
    </PreviewLayout>
  );
};

export default PreviewNDA;
