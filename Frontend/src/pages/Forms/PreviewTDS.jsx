import React, { useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import PreviewActions from "../../Components/Forms/Shared/PreviewActions";
import useAutoFill from "../../hooks/useAutoFill";
import { useAlert } from "../../context/AlertContext";
import TDSHeader from "./TDSPreviewComponents/TDSHeader";
import TDSTaxRegime from "./TDSPreviewComponents/TDSTaxRegime";
import TDSTaxTable from "./TDSPreviewComponents/TDSTaxTable";
import TDSDeclaration from "./TDSPreviewComponents/TDSDeclaration";
import TDSEmployeeDetails from "./TDSPreviewComponents/TDSEmployeeDetails";

const PreviewTDS = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const componentRef = useRef();
  const { showAlert, showConfirm, showPrompt } = useAlert();
  const [actionLoading, setActionLoading] = useState(false);

  // Get data passed from the form
  const { employeeId: paramEmployeeId } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const {
    formData: stateData,
    signaturePreview: stateSig,
    status: stateStatus,
    isHR: stateIsHR,
    employeeId: stateEmployeeId,
    rejectionReason: stateRejectionReason,
  } = location.state || {};

  const targetId = paramEmployeeId || stateEmployeeId || user.employeeId;
  const { data: autoFillData, loading: autoFillLoading } =
    useAutoFill(targetId);

  const isHR = stateIsHR || ["HR_ADMIN", "HR_SUPER_ADMIN"].includes(user.role);
  const derivedStatus = stateStatus || autoFillData?.tdsStatus;
  const data = stateData || autoFillData?.tdsData;

  // Map for compatibility
  const formData = data;
  const status = derivedStatus;
  const employeeId = targetId;
  const rejectionReason =
    stateRejectionReason || autoFillData?.tdsRejectionReason;
  const signaturePreview =
    stateSig ||
    (data?.signature_path
      ? `/uploads/signatures/${data.signature_path}`
      : null);

  if (autoFillLoading && !data)
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
    setActionLoading(true);
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
      setActionLoading(false);
    }
  };

  const handleVerification = async (newStatus, reason = null) => {
    const isConfirmed = await showConfirm(
      `Are you sure you want to ${
        newStatus === "VERIFIED" ? "approve" : "reject"
      } this form?`,
    );
    if (!isConfirmed) return;

    if (newStatus === "REJECTED" && !reason) {
      reason = await showPrompt(
        "Please provide a detailed reason for rejecting this TDS form:",
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

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/forms/tds/verify/${employeeId}`,
        {
          status: newStatus,
          remarks: reason,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      await showAlert(
        `Form ${
          newStatus === "VERIFIED" ? "Approved" : "Rejected"
        } Successfully!`,
        { type: "success" },
      );
      navigate(-1);
    } catch (error) {
      console.error("Verification Error:", error);
      await showAlert("Failed to update status.", { type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 print:p-0 print:m-0 print:w-full print:min-h-0 print:h-auto print:bg-white">
      <div className="max-w-4xl mx-auto print:max-w-none print:mx-0 print:w-full print:p-0">
        <div className="print:hidden">
          <PreviewActions
            status={derivedStatus}
            isHR={isHR}
            onBack={() => navigate(-1)}
            onPrint={() => window.print()}
            onVerify={handleVerification}
            onEdit={() =>
              navigate("/forms/tds-form", {
                state: {
                  formData: data,
                  isEdit: true,
                  isResubmitting: derivedStatus === "REJECTED",
                },
              })
            }
            onSubmit={handleFinalSubmit}
            isSubmitting={actionLoading}
          />
        </div>

        {(derivedStatus === "REJECTED" ||
          (derivedStatus === "DRAFT" &&
            (stateRejectionReason || autoFillData?.tdsRejectionReason))) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 print:hidden">
            <div className="font-bold flex items-center gap-2 mb-1">
              Form Rejected
            </div>
            <p className="text-sm px-1">
              <span className="font-semibold">Reason:</span>{" "}
              {stateRejectionReason || autoFillData?.tdsRejectionReason}
            </p>
            <p className="text-xs mt-2 text-red-600">
              Please review the reason and click "Edit & Resubmit" to make
              necessary changes.
            </p>
          </div>
        )}

        {/* Printable Content */}
        <div
          ref={componentRef}
          className="bg-white p-4 md:p-12 shadow-lg rounded-sm 
                w-full max-w-[210mm] min-h-[297mm] mx-auto 
                flex flex-col relative text-gray-900 font-serif leading-relaxed
                print:a4-print-container print:shadow-none print:p-[20mm] print:block overflow-x-hidden"
        >
          <TDSHeader />

          <TDSTaxRegime taxRegime={formData.tax_regime} />

          <TDSTaxTable formData={formData} />

          <TDSDeclaration formData={formData} />

          <TDSEmployeeDetails
            formData={formData}
            signaturePreview={signaturePreview}
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewTDS;
