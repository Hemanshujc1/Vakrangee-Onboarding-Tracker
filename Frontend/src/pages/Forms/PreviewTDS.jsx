import React, { useRef } from "react";
import axios from "axios";
import usePreviewForm from "../../hooks/usePreviewForm";
import PreviewLayout from "../../Components/Forms/Shared/PreviewLayout";
import TDSHeader from "./TDSPreviewComponents/TDSHeader";
import TDSTaxRegime from "./TDSPreviewComponents/TDSTaxRegime";
import TDSTaxTable from "./TDSPreviewComponents/TDSTaxTable";
import TDSDeclaration from "./TDSPreviewComponents/TDSDeclaration";
import TDSEmployeeDetails from "./TDSPreviewComponents/TDSEmployeeDetails";

const PreviewTDS = () => {
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
    apiEndpoint: "/api/forms/tds",
    dataKey: "tdsData",
    statusKey: "tdsStatus",
    reasonKey: "tdsRejectionReason",
  });

  const signaturePreview =
    stateSig ||
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
          onClick={() => navigate("/forms/tds-form")}
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

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "signature") {
          if (formData.signature instanceof File) {
            data.append("signature", formData.signature);
          }
        } else if (key !== "signature_path" && key !== "signaturePreview") {
          data.append(key, formData[key] == null ? "" : formData[key]);
        }
      });

      if (!formData.signature) {
        const existingPath = formData.signature_path;
        if (existingPath) data.append("signature_path", existingPath);
      }

      data.append("isDraft", "false");

      await axios.post("/api/forms/tds", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await showAlert("Form Submitted Successfully!", { type: "success" });
      navigate("/employee/post-joining");
    } catch (error) {
      console.error("Error submitting form:", error);
      await showAlert(
        `Submission failed: ${error.response?.data?.message || error.message}`,
        { type: "error" },
      );
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
        navigate("/forms/tds-form", {
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
      <TDSHeader />
      <TDSTaxRegime taxRegime={formData.tax_regime} />
      <TDSTaxTable formData={formData} />
      <TDSDeclaration formData={formData} />
      <TDSEmployeeDetails
        formData={formData}
        signaturePreview={signaturePreview}
      />
    </PreviewLayout>
  );
};

export default PreviewTDS;
