import React, { useRef } from "react";
import axios from "axios";
import { DocumentHeader, InstructionBlock } from "../../Components/Forms/Shared";
import usePreviewForm from "../../hooks/usePreviewForm";
import PreviewLayout from "../../Components/Forms/Shared/PreviewLayout";
import PersonalDetails from "./PreviewMediclaimSections/PersonalDetails";
import FamilyDetails from "./PreviewMediclaimSections/FamilyDetails";
import SignatureSection from "./PreviewMediclaimSections/SignatureSection";
import { formatDate } from "../../utils/basicInfoHelpers";

const PreviewMediclaim = () => {
  const componentRef = useRef();

  const {
    data,
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
    apiEndpoint: "/api/forms/mediclaim",
    dataKey: "mediclaimData",
    statusKey: "mediclaimStatus",
    reasonKey: "mediclaimRejectionReason",
  });

  const derivedSignature =
    stateSig ||
    (data?.signature instanceof File
      ? URL.createObjectURL(data.signature)
      : null) ||
    (data?.signature_path
      ? `/uploads/signatures/${data.signature_path}`
      : null);

  if (autoFillLoading && !data) {
    return (
      <div className="p-8 text-center text-gray-500">Loading Preview...</div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">No Data Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleFinalSubmit = async () => {
    if (!data) return;
    setIsSubmitting(true);

    try {
      const submissionData = new FormData();

      Object.keys(data).forEach((key) => {
        if (key === "dependents") {
          const dependents =
            data.marital_status === "Married" ? data.dependents : null;
          let formattedDependents = null;
          if (dependents && Array.isArray(dependents)) {
            formattedDependents = dependents.map((d) => ({
              ...d,
              dob: d.dob ? new Date(d.dob).toISOString().split("T")[0] : "",
            }));
          }
          submissionData.append(
            "dependents",
            JSON.stringify(formattedDependents || []),
          );
        } else if (key === "signature") {
          if (data.signature instanceof File) {
            submissionData.append("signature", data.signature);
          }
        } else if (key === "date_of_birth") {
          const dob = data[key]
            ? new Date(data[key]).toISOString().split("T")[0]
            : "";
          submissionData.append(key, dob);
        } else {
          if (key !== "signaturePreview") {
            submissionData.append(key, data[key] || "");
          }
        }
      });

      submissionData.append("isDraft", "false");

      const token = localStorage.getItem("token");
      await axios.post("/api/forms/mediclaim", submissionData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await showAlert("Form Submitted Successfully!", { type: "success" });
      navigate("/employee/pre-joining");
    } catch (error) {
      console.error("Submission Error", error);
      await showAlert("Failed to connect to server.", { type: "error" });
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
        navigate("/forms/mediclaim", {
          state: {
            formData: data,
            isEdit: true,
            isResubmitting: derivedStatus === "REJECTED",
          },
        })
      }
      onSubmit={handleFinalSubmit}
      isSubmitting={isSubmitting}
      rejectionReason={rejectionReason}
    >
      <DocumentHeader title="Group Mediclaim Policy Details" />
      <InstructionBlock instructions={data?.instructions || []} />
      <PersonalDetails data={data} formatDate={formatDate} />
      <FamilyDetails data={data} formatDate={formatDate} />
      <SignatureSection data={data} derivedSignature={derivedSignature} />
    </PreviewLayout>
  );
};

export default PreviewMediclaim;
