import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PreviewActions from "../../Components/Forms/Shared/PreviewActions";
import { CheckCircle } from "lucide-react";
import { useAlert } from "../../context/AlertContext";
import useAutoFill from "../../hooks/useAutoFill";
import GratuityHeader from "./GratuityPreviewComponents/GratuityHeader";
import GratuityParticulars from "./GratuityPreviewComponents/GratuityParticulars";
import GratuityNominees from "./GratuityPreviewComponents/GratuityNominees";
import GratuityStatement from "./GratuityPreviewComponents/GratuityStatement";
import GratuityWitnesses from "./GratuityPreviewComponents/GratuityWitnesses";
import GratuityEmployerCertificate from "./GratuityPreviewComponents/GratuityEmployerCertificate";
import GratuityAcknowledgement from "./GratuityPreviewComponents/GratuityAcknowledgement";

const PreviewGratuity = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const componentRef = useRef();
  const { employeeId: paramEmployeeId } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { showAlert, showConfirm, showPrompt } = useAlert();

  // Get data passed from the form
  const {
    formData: stateData,
    signaturePreview: stateSig,
    status: stateStatus,
    isHR: stateIsHR,
    employeeId: stateEmployeeId,
    rejectionReason: stateRejectionReason,
  } = location.state || {};

  const targetId = paramEmployeeId || stateEmployeeId || user.employeeId;
  const isHR = stateIsHR || ["HR_ADMIN", "HR_SUPER_ADMIN"].includes(user.role);

  const { data: autoFillData, loading: autoFillLoading } =
    useAutoFill(targetId);

  const status = stateStatus || autoFillData?.gratuityStatus;
  const rejectionReason =
    stateRejectionReason || autoFillData?.gratuityRejectionReason;
  const formData = stateData || autoFillData?.gratuityData;
  const initialSigPreview =
    stateSig ||
    (formData?.signature_path
      ? `/uploads/signatures/${formData.signature_path}`
      : null);

  const [signaturePreview, setSignaturePreview] = useState(initialSigPreview);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formData) {
      if (!initialSigPreview && formData.signature_path) {
        setSignaturePreview(`/uploads/signatures/${formData.signature_path}`);
      } else if (formData.signature instanceof File) {
        setSignaturePreview(URL.createObjectURL(formData.signature));
      } else if (initialSigPreview) {
        setSignaturePreview(initialSigPreview);
      }
    }
  }, [formData, initialSigPreview]);

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

  // Fallback for legacy single fields if array is empty
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

  // Helper to format date to dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Check if valid date
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB");
  };

  const handleVerification = async (verifyStatus) => {
    if (!targetId)
      return await showAlert("Missing Employee ID", { type: "error" });

    let reason = null;
    if (verifyStatus === "REJECTED") {
      reason = await showPrompt(
        "Please provide a detailed reason for rejecting this form:",
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

    const isConfirmed = await showConfirm(
      `Are you sure you want to ${
        verifyStatus === "VERIFIED" ? "Approve" : "Reject"
      } this form?`,
    );
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/forms/gratuity/verify/${targetId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: verifyStatus, remarks: reason }),
      });

      if (response.ok) {
        await showAlert(
          `Form ${
            verifyStatus === "VERIFIED" ? "Approved" : "Rejected"
          } Successfully!`,
          { type: "success" },
        );
        navigate(-1); // Back to Employee Detail
      } else {
        await showAlert("Failed to update status.", { type: "error" });
      }
    } catch (error) {
      console.error("Verification Error", error);
      await showAlert("Server Error", { type: "error" });
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const submitData = new FormData();
      // Re-construct FormData from the values passed in state
      Object.keys(formData).forEach((key) => {
        if (key === "nominees" || key === "witnesses") {
          const val = formData[key];
          submitData.append(
            key,
            typeof val === "string" ? val : JSON.stringify(val),
          );
        } else if (key === "signature") {
          if (formData.signature instanceof File) {
            submitData.append("signature", formData.signature);
          }
        } else {
          submitData.append(key, formData[key] || "");
        }
      });

      // Ensure isDraft is false
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
          { type: "error" },
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 print:p-0 print:bg-white print:min-h-0">
      <div className="max-w-[210mm] mx-auto print:max-w-full">
        {/* Actions Bar */}
        <div className="print:hidden mb-6">
          <PreviewActions
            status={status}
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
          />

          {/* Rejection Alert */}
          {(status === "REJECTED" ||
            (status === "DRAFT" && rejectionReason)) && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <div className="font-bold flex items-center gap-2 mb-1">
                <CheckCircle size={20} className="text-red-500" />
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

        {/* Form Content - Printable Area*/}
        <div className="bg-white shadow-lg p-4 md:p-12 print:shadow-none print:w-full print:max-w-full print:p-0 print:m-0 flex flex-col print:a4-print-container">
          <div className="flex flex-col h-full print:p-8">
            <div
              ref={componentRef}
              className="print:text-black font-serif text-sm leading-relaxed text-justify text-gray-900 bg-white"
            >
              <GratuityHeader />

              <GratuityParticulars
                formData={formData}
                formatDate={formatDate}
              />

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewGratuity;
