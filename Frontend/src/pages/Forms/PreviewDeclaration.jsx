import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { DocumentHeader, PreviewActions } from "../../Components/Forms/Shared";
import useAutoFill from "../../hooks/useAutoFill";
import { useAlert } from "../../context/AlertContext";

const PreviewDeclaration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const printRef = useRef();
  const { showAlert, showConfirm, showPrompt } = useAlert();

  // State for form data and status
  const [formData, setFormData] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const isHR =
    stateIsHR || ["HR_ADMIN", "HR_SUPER_ADMIN", "admin"].includes(user.role);
  const derivedStatus = stateStatus || autoFillData?.declarationStatus;
  const data = stateData || autoFillData?.declarationData;

  useEffect(() => {
    if (data) {
      setFormData(data);

      // Handle Signature Preview
      const sig = data.signature;
      if (sig instanceof File) {
        setSignaturePreview(URL.createObjectURL(sig));
      } else if (stateSig) {
        setSignaturePreview(stateSig);
      } else if (data.signature_path) {
        setSignaturePreview(`/uploads/signatures/${data.signature_path}`);
      }
    }
  }, [data, stateSig]);

  if (autoFillLoading && !data)
    return (
      <div className="p-10 text-center text-gray-500">Loading Preview...</div>
    );

  const handleFinalSubmit = async () => {
    if (!formData) return;
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
        { type: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerification = async (status) => {
    if (!location.state?.employeeId)
      return await showAlert("Missing Employee ID", { type: "error" });

    let reason = null;
    if (status === "REJECTED") {
      reason = await showPrompt(
        "Please provide a detailed reason for rejecting this declaration form:",
        {
          title: "Rejection Reason",
          type: "warning",
          placeholder:
            "Enter the reason for rejection (minimum 10 characters)...",
          confirmText: "Submit Rejection",
          cancelText: "Cancel",
        }
      );
      if (!reason) return;
    }

    const isConfirmed = await showConfirm(
      `Are you sure you want to ${
        status === "VERIFIED" ? "Approve" : "Reject"
      } this form?`
    );
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/forms/declaration/verify/${location.state.employeeId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, remarks: reason }),
        }
      );

      if (response.ok) {
        await showAlert(
          `Form ${
            status === "VERIFIED" ? "Approved" : "Rejected"
          } Successfully!`,
          { type: "success" }
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

  if (!formData) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Loading Preview...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <PreviewActions
          status={derivedStatus}
          isHR={isHR}
          onBack={() => navigate(-1)}
          onPrint={() => window.print()}
          onVerify={handleVerification}
          onEdit={() =>
            navigate("/forms/declaration-form", {
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
              autoFillData?.declarationRejectionReason))) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 print:hidden">
            <div className="font-bold flex items-center gap-2 mb-1">
              Form Rejected
            </div>
            <p className="text-sm px-1">
              <span className="font-semibold">Reason:</span>{" "}
              {stateRejectionReason || autoFillData?.declarationRejectionReason}
            </p>
            <p className="text-xs mt-2 text-red-600">
              Please review the reason and click "Edit & Resubmit" to make
              necessary changes.
            </p>
          </div>
        )}

        {/* Preview Content */}
        <div
          ref={printRef}
          className="bg-white p-8 md:p-16 shadow-md rounded-sm print:shadow-none print:p-0 print:w-[21cm] print:h-[29.7cm] flex flex-col print:block relative w-full max-w-[21cm] mx-auto"
        >
          {/* Document Header */}
          <DocumentHeader title="Declaration Form" />

          <div className="font-serif text-gray-900 space-y-10 leading-loose text-base text-justify mt-8">
            <p>
              I, the undersigned{" "}
              <span className="font-semibold border-b border-gray-800 px-2 uppercase">
                {formData.title} {formData.employee_full_name}
              </span>{" "}
              hereby declare that I have resigned from my previous employment
              i.e. Company Name: {formData.previous_company_name ? (
                <span className="font-semibold border-b border-gray-800 px-2 uppercase">
                  {formData.previous_company_name}
                </span>
              ) : (
                <span>________</span>
              )}Designation: {formData.previous_job_title ? (
                <span className="font-semibold border-b border-gray-800 px-2 uppercase">
                  {formData.previous_job_title}
                </span>
              ) : (
                <span>________</span>
              )} and completed all full and final processes before joining Vakrangee Limited.
            </p>

            <p>
              I say that I do not have any outstanding dues or pending
              assignments of whatsoever nature in my previous employment.
            </p>

            <p>
              I say that I take complete responsibility for any issue /
              liability arising out of my previous employment and Vakrangee
              Limited, shall not have any responsibility whatsoever in such
              matters.
            </p>
          </div>

          <div className="mt-20 space-y-6 text-base font-medium text-gray-800 break-inside-avoid">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <span className="min-w-30 w-32">Name:</span>
              <span className="font-semibold px-0 md:px-4 uppercase flex-1 border-b border-dashed border-gray-400 w-full md:w-auto">
                {formData.employee_full_name}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <span className="min-w-30 w-32">Designation:</span>
              <span className="font-semibold px-0 md:px-4 uppercase flex-1 border-b border-dashed border-gray-400 w-full md:w-auto">
                {formData.current_job_title}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 mt-8">
              <span className="min-w-30 w-32">Signature:</span>
              {signaturePreview ? (
                <div className="px-0 md:px-4 flex-1 pb-2 w-full md:w-auto border-b border-gray-400 md:border-none">
                  <img
                    src={signaturePreview}
                    alt="Signature"
                    className="h-16 object-contain"
                  />
                </div>
              ) : (
                <span className="font-semibold px-4 italic text-gray-500 flex-1">
                  Pending
                </span>
              )}
            </div>
            <div className="items-center gap-4 hidden md:flex">
              <span className="min-w-30 w-32"></span>
              <span className="text-xs uppercase tracking-wide text-gray-500 w-48 border-t border-gray-400 text-center pt-1">
                Employee Signature
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-8">
              <span className="min-w-30 w-32">Date:</span>
              <span className="font-semibold px-0 md:px-4 flex-1 w-full md:w-auto">
                {new Date().toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewDeclaration;
