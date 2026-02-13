import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useAutoFill from "../../hooks/useAutoFill";
import PreviewActions from "../../Components/Forms/Shared/PreviewActions";
import { useAlert } from "../../context/AlertContext";
import { CheckCircle } from "lucide-react";
import InformationHeader from "./InformationPreviewComponents/InformationHeader";
import PersonalDetails from "./InformationPreviewComponents/PersonalDetails";
import ContactDetails from "./InformationPreviewComponents/ContactDetails";
import EducationalDetails from "./InformationPreviewComponents/EducationalDetails";
import SignificantAchievements from "./InformationPreviewComponents/SignificantAchievements";
import EmploymentDetails from "./InformationPreviewComponents/EmploymentDetails";
import ReferenceDetails from "./InformationPreviewComponents/ReferenceDetails";
import Declaration from "./InformationPreviewComponents/Declaration";

const PreviewInformation = () => {
  const navigate = useNavigate();
  const componentRef = useRef();
  const { showAlert, showConfirm, showPrompt } = useAlert();
  const [actionLoading, setActionLoading] = useState(false);
  const { employeeId: paramId } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId = paramId || user.employeeId;

  const { data: autoFillData, loading } = useAutoFill(employeeId);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Variables for PreviewActions
  const status = autoFillData?.employeeInfoStatus || "PENDING";
  const rejectionReason = autoFillData?.employeeInfoRejectionReason;
  const isHR = ["HR_ADMIN", "HR_SUPER_ADMIN"].includes(user.role);

  if (loading)
    return <div className="p-10 text-center">Loading Preview...</div>;

  const data = autoFillData?.employeeInfoData || {};
  const record = autoFillData || {}; // Fallback for some fields if needed

  const handleSubmit = async () => {
    const isConfirmed = await showConfirm(
      "Are you sure you want to submit? You won't be able to edit afterwards.",
    );
    if (!isConfirmed) return;

    setActionLoading(true);
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
        "Please provide a detailed reason for rejecting this employee information form:",
        {
          title: "Rejection Reason",
          type: "warning",
          placeholder:
            "Enter the reason for rejection (minimum 10 characters)...",
          confirmText: "Submit Rejection",
          cancelText: "Cancel",
        },
      );
      if (!reason) return; // Cancelled if no reason provided
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/forms/verify-employee-info/${employeeId}`,
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 print:p-0 print:m-0 print:w-full print:min-h-0 print:h-auto print:bg-white text-xs">
      <div className="max-w-[210mm] mx-auto print:max-w-full">
        {/* Actions Bar - Outside Printable Area */}
        <div className="print:hidden mb-6">
          <PreviewActions
            status={status}
            isHR={isHR}
            onBack={() => navigate(-1)}
            onPrint={() => window.print()}
            onSubmit={handleSubmit}
            onVerify={handleVerification}
            onEdit={() => navigate("/forms/employment-info")}
            isSubmitting={actionLoading}
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

        {/* Printable Area */}
        <div
          ref={componentRef}
          className="bg-white p-4 md:p-8 shadow-lg rounded-sm min-h-[297mm] flex flex-col print:w-full print:max-w-full print:min-h-0 print:m-0 print:p-8 print:shadow-none print:a4-print-container"
        >
          <InformationHeader data={data} record={record} />

          <PersonalDetails data={data} />

          <ContactDetails data={data} />

          <EducationalDetails data={data} formatDate={formatDate} />

          <SignificantAchievements data={data} />

          <EmploymentDetails data={data} formatDate={formatDate} />

          <ReferenceDetails data={data} />

          <Declaration data={data} record={record} />
        </div>
      </div>
    </div>
  );
};

export default PreviewInformation;
