import React, { useRef } from "react";
import usePreviewForm from "../../hooks/usePreviewForm";
import PreviewLayout from "../../Components/Forms/Shared/PreviewLayout";
import GratuityHeader from "./GratuityPreviewComponents/GratuityHeader";
import GratuityParticulars from "./GratuityPreviewComponents/GratuityParticulars";
import GratuityNominees from "./GratuityPreviewComponents/GratuityNominees";
import GratuityStatement from "./GratuityPreviewComponents/GratuityStatement";
import GratuityWitnesses from "./GratuityPreviewComponents/GratuityWitnesses";
import GratuityEmployerCertificate from "./GratuityPreviewComponents/GratuityEmployerCertificate";
import GratuityAcknowledgement from "./GratuityPreviewComponents/GratuityAcknowledgement";
import { formatDate } from "../../utils/basicInfoHelpers";

const PreviewGratuity = () => {
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
    apiEndpoint: "/api/forms/gratuity",
    dataKey: "gratuityData",
    statusKey: "gratuityStatus",
    reasonKey: "gratuityRejectionReason",
  });

  const signaturePreview =
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
        <h2 className="text-xl font-bold text-red-600">No Data Found</h2>
        <p className="mt-2 text-gray-600">
          Please go back and fill the form again.
        </p>
        <button
          onClick={() => navigate("/forms/gratuity-form")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Form
        </button>
      </div>
    );
  }

  let nominees = [];
  try {
    nominees =
      typeof formData.nominees === "string"
        ? JSON.parse(formData.nominees)
        : formData.nominees;
  } catch (e) {
    nominees = [];
  }
  if ((!nominees || nominees.length === 0) && formData.nominee_name) {
    nominees = [
      {
        name: formData.nominee_name,
        address: formData.nominee_address,
        relationship: formData.nominee_relationship,
        age: formData.nominee_age,
        share: formData.nominee_share,
      },
    ];
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "nominees" || key === "witnesses") {
          const val = formData[key];
          submitData.append(
            key,
            typeof val === "string" ? val : JSON.stringify(val)
          );
        } else if (key === "signature") {
          if (formData.signature instanceof File) {
            submitData.append("signature", formData.signature);
          }
        } else {
          submitData.append(key, formData[key] || "");
        }
      });

      submitData.append("isDraft", "false");

      const response = await fetch("/api/forms/gratuity", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      if (response.ok) {
        await showAlert("Form Submitted Successfully!", { type: "success" });
        navigate("/employee/pre-joining");
      } else {
        const err = await response.json();
        await showAlert(
          "Failed to submit form: " + (err.message || "Unknown error"),
          { type: "error" }
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      await showAlert("Failed to submit form.", { type: "error" });
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
        navigate("/forms/gratuity-form", {
          state: { formData: formData, isEdit: true },
        })
      }
      onSubmit={handleFinalSubmit}
      isSubmitting={isSubmitting}
      rejectionReason={rejectionReason}
    >
      <div className="font-serif text-sm leading-relaxed text-justify text-gray-900 bg-white">
        <GratuityHeader />

        <GratuityParticulars formData={formData} formatDate={formatDate} />

        <GratuityNominees nominees={nominees} />

        <div className="print:break-before-page mt-8"></div>

        <GratuityStatement
          formData={formData}
          formatDate={formatDate}
          signaturePreview={signaturePreview}
        />

        <div className="border-t-2 border-black my-8 page-break"></div>

        <GratuityWitnesses formData={formData} formatDate={formatDate} />

        <div className="print:break-before-page mt-8"></div>

        <GratuityEmployerCertificate />

        <GratuityAcknowledgement
          formData={formData}
          formatDate={formatDate}
          signaturePreview={signaturePreview}
        />
      </div>
    </PreviewLayout>
  );
};

export default PreviewGratuity;
