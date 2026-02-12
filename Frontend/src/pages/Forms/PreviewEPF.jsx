import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { PreviewActions } from "../../Components/Forms/Shared";
import { formatDateForAPI } from "../../utils/formUtils";
import useAutoFill from "../../hooks/useAutoFill";
import { useAlert } from "../../context/AlertContext";
import { CheckCircle } from "lucide-react";
import EPFHeader from "./EPFPreviewComponents/EPFHeader";
import EPFMemberDetails from "./EPFPreviewComponents/EPFMemberDetails";
import EPFPreviousEmployment from "./EPFPreviewComponents/EPFPreviousEmployment";
import EPFInternationalWorker from "./EPFPreviewComponents/EPFInternationalWorker";
import EPFKYCDetails from "./EPFPreviewComponents/EPFKYCDetails";
import EPFEnrollmentDetails from "./EPFPreviewComponents/EPFEnrollmentDetails";
import EPFUndertaking from "./EPFPreviewComponents/EPFUndertaking";
import EPFEmployerDeclaration from "./EPFPreviewComponents/EPFEmployerDeclaration";

const PreviewEPF = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [isHR, setIsHR] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { showAlert, showConfirm, showPrompt } = useAlert();
  const location = useLocation();
  const {
    formData: stateData,
    signaturePreview: stateSig,
    employeeId: stateEmployeeId,
    status: stateStatus,
    rejectionReason: stateRejectionReason,
    fromPreviewSubmit,
  } = location.state || {}; 
  const componentRef = useRef();

  useEffect(() => {
    const checkUserRole = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role === "HR_ADMIN" || user.role === "HR_SUPER_ADMIN") {
            setIsHR(true);
          }
        }
      } catch (e) {
        console.error("Error parsing user for role check", e);
      }
    };
    checkUserRole();
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const targetId = stateEmployeeId || employeeId || user.employeeId;

  // 2. Fetch backend data (fallback/robustness)
  const { data: autoFillData, loading: autoFillLoading } =
    useAutoFill(targetId);

  // 3. Derive status: prefer state, fallback to backend
  const derivedStatus = stateStatus || autoFillData?.epfStatus;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/forms/auto-fill/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching preview data:", error);
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchData();
    }
  }, [employeeId]);

  if (loading)
    return <div className="text-center p-10">Loading Preview...</div>;
  if (!data)
    return <div className="text-center p-10 text-red-600">No data found.</div>;

  // Helper to safely access nested data
  const epf = stateData || data.epfData || {};
  const app = data.applicationData || {}; // Not used but kept for reference

  // Combine logic for fields that might be in EPF form data or fallbacks
  const getValue = (key, fallback) => epf[key] || fallback || "";

  // Signature URL helper
  const getSignatureUrl = (path) =>
    path ? `/uploads/signatures/${path}` : null;

  // Helper to render Yes/No with checkmark
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

  // Date formatter
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
    setActionLoading(true);
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
            // Format dates if they are Date objects
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
            // For boolean/radio fields that might be true/false, ensure correct string if needed
            // But payload usually handles them. Just ensure dates are formatted.
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
        "Please provide a detailed reason for rejecting this EPF form:",
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
        `/api/forms/epf/verify/${employeeId}`,
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
      <div className="max-w-[210mm] mx-auto print:max-w-none print:mx-0 print:w-full print:p-0">

        <div className="print:hidden mb-6">
          <PreviewActions
            status={derivedStatus}
            isHR={isHR}
            onBack={() => navigate(-1)}
            onPrint={() => window.print()}
            onSubmit={handleFinalSubmit}
            onVerify={handleVerification}
            onEdit={() =>
              navigate(
                `/forms/employees-provident-fund/${employeeId || targetId}`,
                {
                  state: {
                    formData: data?.epfData || autoFillData?.epfData,
                    isEdit: true,
                    isResubmitting: derivedStatus === "REJECTED",
                    rejectionReason:
                      data?.epfRejectionReason ||
                      autoFillData?.epfRejectionReason,
                  },
                },
              )
            }
            isSubmitting={actionLoading}
            isSubmitHidden={!fromPreviewSubmit && derivedStatus !== "DRAFT"}
          />

          {/* Rejection Alert */}
          {(derivedStatus === "REJECTED" ||
            (derivedStatus === "DRAFT" &&
              (stateRejectionReason || autoFillData?.epfRejectionReason))) && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <div className="font-bold flex items-center gap-2 mb-1">
                <CheckCircle size={20} className="text-red-500" />
                Form Rejected
              </div>
              <p className="text-sm px-1">
                <span className="font-semibold">Reason:</span>{" "}
                {stateRejectionReason || data.epfRejectionReason}
              </p>
              <p className="text-xs mt-2 text-red-600">
                Please review the reason and click "Edit & Resubmit" to make
                necessary changes.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white p-4 md:p-8 shadow-lg rounded-sm min-h-[297mm] flex flex-col print:w-full print:max-w-full print:min-h-0 print:m-0 print:p-0 print:shadow-none print:a4-print-container">
          {/* Inner wrapper for Print Padding */}
          <div className="print:p-4 h-full flex flex-col">
            {/* Form Content */}
            <div
              ref={componentRef}
              className="text-xs text-black leading-tight"
            >
              <EPFHeader />

              {/* Main Table */}
              <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full">
                <table className="w-full min-w-150 border-collapse border border-black text-xs print:w-full print:min-w-0">
                  <tbody>
                    <EPFMemberDetails
                      getValue={getValue}
                      data={data}
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

                    <EPFKYCDetails getValue={getValue} data={data} />
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
                data={data}
              />

              <EPFEmployerDeclaration
                getValue={getValue}
                data={data}
                formatDate={formatDate}
                getSignatureUrl={getSignatureUrl}
                epf={epf}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewEPF;
