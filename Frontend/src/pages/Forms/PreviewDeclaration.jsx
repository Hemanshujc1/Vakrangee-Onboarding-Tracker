import React, { useRef } from "react";
import axios from "axios";
import { DocumentHeader } from "../../Components/Forms/Shared";
import usePreviewForm from "../../hooks/usePreviewForm";
import PreviewLayout from "../../Components/Forms/Shared/PreviewLayout";
import DeclarationContent from "./PreviewDeclarationSections/DeclarationContent";
import SignatureBlock from "./PreviewDeclarationSections/SignatureBlock";

const PreviewDeclaration = () => {
  const printRef = useRef();

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
    apiEndpoint: "/api/forms/declaration",
    dataKey: "declarationData",
    statusKey: "declarationStatus",
    reasonKey: "declarationRejectionReason",
  });

  const signaturePreview =
    stateSig ||
    (formData?.signature instanceof File
      ? URL.createObjectURL(formData.signature)
      : null) ||
    (formData?.signature_path
      ? `/uploads/signatures/${formData.signature_path}`
      : null);

  if (autoFillLoading && !formData)
    return (
      <div className="p-10 text-center text-gray-500">Loading Preview...</div>
    );

  if (!formData) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Loading Preview...
        </h2>
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
        } else if (key !== "signaturePreview") {
          payload.append(key, formData[key] == null ? "" : formData[key]);
        }
      });
      payload.append("isDraft", "false");

      const token = localStorage.getItem("token");
      await axios.post("/api/forms/declaration", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await showAlert("Declaration Submitted Successfully!", {
        type: "success",
      });
      navigate("/employee/post-joining");
    } catch (e) {
      console.error(e);
      await showAlert(
        `Submission failed: ${e.response?.data?.message || e.message}`,
        { type: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PreviewLayout
      ref={printRef}
      status={derivedStatus}
      isHR={isHR}
      onBack={() => navigate(-1)}
      onPrint={() => window.print()}
      onVerify={handleVerification}
      onEdit={() =>
        navigate("/forms/declaration-form", {
          state: {
            formData: formData,
            isEdit: true,
            isResubmitting: derivedStatus === "REJECTED",
          },
        })
      }
      onSubmit={handleFinalSubmit}
      isSubmitting={isSubmitting}
      rejectionReason={rejectionReason}
    >
      <DocumentHeader title="Declaration Form" />
      <DeclarationContent formData={formData} />
      <SignatureBlock
        formData={formData}
        signaturePreview={signaturePreview}
      />
    </PreviewLayout>
  );
};

export default PreviewDeclaration;
