import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  DocumentHeader,
  InstructionBlock,
  PreviewActions,
} from "../../Components/Forms/Shared";
import useAutoFill from "../../hooks/useAutoFill";
import { useAlert } from "../../context/AlertContext";
import PersonalDetails from "./PreviewMediclaimSections/PersonalDetails";
import FamilyDetails from "./PreviewMediclaimSections/FamilyDetails";
import SignatureSection from "./PreviewMediclaimSections/SignatureSection";

const PreviewMediclaim = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { employeeId: paramEmployeeId } = useParams(); // Get from URL
  const { showAlert, showConfirm, showPrompt } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    formData: stateData,
    signaturePreview: stateSig,
    status: stateStatus,
    isHR: stateIsHR,
    employeeId: stateEmployeeId,
    rejectionReason: stateRejectionReason,
  } = location.state || {};

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const targetId = paramEmployeeId || stateEmployeeId || user.employeeId;
  const { data: autoFillData, loading: autoFillLoading } =
    useAutoFill(targetId);
  const isHR = stateIsHR || ["HR_ADMIN", "HR_SUPER_ADMIN"].includes(user.role);
  const derivedStatus = stateStatus || autoFillData?.mediclaimStatus;
  const data = stateData || autoFillData?.mediclaimData;
  const derivedSignature =
    stateSig ||
    (data?.signature instanceof File
      ? URL.createObjectURL(data.signature)
      : null) ||
    (data?.signature_path
      ? `/uploads/signatures/${data.signature_path}`
      : null) ||
    (autoFillData?.signature
      ? `/uploads/signatures/${autoFillData.signature}`
      : null);

  const handleFinalSubmit = async () => {
    if (!data) return;
    setIsSubmitting(true);

    try {
      const submissionData = new FormData();

      Object.keys(data).forEach((key) => {
        if (key === "dependents") {
          // Dependents logic
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
          // Skip temporary keys
          if (key !== "signaturePreview") {
            submissionData.append(key, data[key] || "");
          }
        }
      });

      // Force status to SUBMITTED (not draft)
      submissionData.append("isDraft", "false");

      const token = localStorage.getItem("token");
      const response = await fetch("/api/forms/mediclaim", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: submissionData,
      });

      if (response.ok) {
        await showAlert("Form Submitted Successfully!", { type: "success" });
        navigate("/employee/pre-joining");
      } else {
        const errorData = await response.json().catch(() => ({}));
        await showAlert(`Error: ${errorData.message || response.statusText}`, {
          type: "error",
        });
      }
    } catch (error) {
      console.error("Submission Error", error);
      await showAlert("Failed to connect to server.", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerification = async (status) => {
    if (!targetId)
      return await showAlert("Missing Employee ID", { type: "error" });

    let reason = null;
    if (status === "REJECTED") {
      reason = await showPrompt(
        "Please provide a detailed reason for rejecting this mediclaim form:",
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
        status === "VERIFIED" ? "Approve" : "Reject"
      } this form?`,
    );
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/forms/mediclaim/verify/${targetId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, remarks: reason }),
      });

      if (response.ok) {
        await showAlert(
          `Form ${
            status === "VERIFIED" ? "Approved" : "Rejected"
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

  const formatDate = (dateVal) => {
    if (!dateVal) return "";
    try {
      if (typeof dateVal === "string") return dateVal; // Already string
      if (dateVal instanceof Date) return dateVal.toLocaleDateString(); // Date object
      return new Date(dateVal).toLocaleDateString(); // Timestamp/other
    } catch (e) {
      return "";
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:p-0 print:m-0 print:w-full print:min-h-0 print:h-auto">
      <div className="max-w-4xl mx-auto print:max-w-none print:mx-0 print:w-full print:p-0">
        {/* Header Actions */}
        <PreviewActions
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
        />

        {/* Rejection Alert */}
        {(derivedStatus === "REJECTED" ||
          (derivedStatus === "DRAFT" &&
            (stateRejectionReason ||
              autoFillData?.mediclaimRejectionReason))) && (
          <div className="mb-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 print:hidden">
            <div className="font-bold flex items-center gap-2 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Form Rejected
            </div>
            <p className="text-sm px-1">
              <span className="font-semibold">Reason:</span>{" "}
              {stateRejectionReason || autoFillData?.mediclaimRejectionReason}
            </p>
            <p className="text-xs mt-2 text-red-600">
              Please review the reason and click "Edit & Resubmit" to make
              necessary changes.
            </p>
          </div>
        )}

        {/* Official Document View */}
        <div className="bg-white p-6 md:p-12 shadow-md rounded-sm print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-full print:min-h-0 mx-auto w-full max-w-[21cm] print:a4-print-container flex flex-col">
          {/* Inner Wrapper for Print Padding */}
          <div className="print:p-8 h-full flex flex-col">
            {/* Document Header */}
            <DocumentHeader title="Mediclaim Information Form" />

            {/* Instructions*/}
            <InstructionBlock />

            <PersonalDetails data={data} formatDate={formatDate} />
            <FamilyDetails data={data} formatDate={formatDate} />
            <SignatureSection
              signature={derivedSignature}
              date={new Date().toLocaleDateString("en-GB")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewMediclaim;
