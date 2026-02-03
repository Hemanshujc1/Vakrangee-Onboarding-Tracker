import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { DocumentHeader, InstructionBlock, PreviewActions } from "../../Components/Forms/Shared";
import useAutoFill from "../../hooks/useAutoFill";
import { useAlert } from "../../context/AlertContext";

const PreviewMediclaim = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { employeeId: paramEmployeeId } = useParams(); // Get from URL
  const { showAlert, showConfirm, showPrompt } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Get identifiers from state or user (fallback)
  const { 
    formData: stateData, 
    signaturePreview: stateSig, 
    status: stateStatus, 
    isHR: stateIsHR, 
    employeeId: stateEmployeeId,
    rejectionReason: stateRejectionReason
  } = location.state || {};

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const targetId = paramEmployeeId || stateEmployeeId || user.employeeId;

  // 2. Fetch backend data (fallback/robustness)
  const { data: autoFillData, loading: autoFillLoading } = useAutoFill(targetId);

  const isHR = stateIsHR || ["HR_ADMIN", "HR_SUPER_ADMIN", "admin"].includes(user.role);
  const derivedStatus = stateStatus || autoFillData?.mediclaimStatus;

  // 3. Derive form data: prefer state (for unsaved changes), fallback to backend
  const data = stateData || autoFillData?.mediclaimData;

  // 4. Derive signature URL robustly
  const derivedSignature = stateSig || 
    (data?.signature instanceof File ? URL.createObjectURL(data.signature) : null) ||
    (data?.signature_path ? `/uploads/signatures/${data.signature_path}` : null) ||
    (autoFillData?.signature ? `/uploads/signatures/${autoFillData.signature}` : null);

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
            JSON.stringify(formattedDependents || [])
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
      const response = await fetch(
        "/api/forms/mediclaim",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: submissionData,
        }
      );

      if (response.ok) {
        await showAlert("Form Submitted Successfully!", { type: 'success' });
        navigate("/employee/pre-joining");
      } else {
        const errorData = await response.json().catch(() => ({}));
        await showAlert(`Error: ${errorData.message || response.statusText}`, { type: 'error' });
      }
    } catch (error) {
      console.error("Submission Error", error);
      await showAlert("Failed to connect to server.", { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerification = async (status) => {
    if (!location.state?.employeeId) return await showAlert("Missing Employee ID", { type: 'error' });

    let reason = null;
    if (status === "REJECTED") {
      reason = await showPrompt("Please provide a detailed reason for rejecting this mediclaim form:", {
        title: "Rejection Reason",
        type: "warning",
        placeholder: "Enter the reason for rejection (minimum 10 characters)...",
        confirmText: "Submit Rejection",
        cancelText: "Cancel"
      });
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
        `/api/forms/mediclaim/verify/${location.state.employeeId}`,
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
          { type: 'success' }
        );
        navigate(-1); // Back to Employee Detail
      } else {
        await showAlert("Failed to update status.", { type: 'error' });
      }
    } catch (error) {
      console.error("Verification Error", error);
      await showAlert("Server Error", { type: 'error' });
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
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 underline">
          Go Back
        </button>
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
          onEdit={() => navigate('/forms/mediclaim', { state: { formData: data, isEdit: true, isResubmitting: derivedStatus === 'REJECTED' } })}
          onSubmit={handleFinalSubmit}
          isSubmitting={isSubmitting}
        />

        {/* Rejection Alert */}
        {/* Rejection Alert */}
        {(derivedStatus === 'REJECTED' || (derivedStatus === 'DRAFT' && (stateRejectionReason || autoFillData?.mediclaimRejectionReason))) && (
            <div className="mb-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 print:hidden">
                <div className="font-bold flex items-center gap-2 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Form Rejected
                </div>
                <p className="text-sm px-1">
                    <span className="font-semibold">Reason:</span> {stateRejectionReason || autoFillData?.mediclaimRejectionReason}
                </p>
                <p className="text-xs mt-2 text-red-600">Please review the reason and click "Edit & Resubmit" to make necessary changes.</p>
            </div>
        )}

        {/* Official Document View */}
        <div className="bg-white p-8 md:p-12 shadow-md rounded-sm print:shadow-none print:p-0">
          {/* Document Header */}
          <DocumentHeader title="Mediclaim Information Form" />

          {/* Instructions*/}
          <InstructionBlock />

          {/* Personal Details Heading */}
          <div className="text-center text-gray-800 font-bold underline mb-4">
            Personal Details
          </div>
          {/* Personal Details  */}
          <div className="grid grid-cols-1 gap-y-2 text-sm mb-6">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3 font-semibold text-gray-800">
                Employee Full Name:
              </div>
              <div className="col-span-9 text-gray-900 font-medium uppercase border-b border-gray-600 border-dashed pb-1">
                {data.employee_full_name}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3 font-semibold text-gray-800">
                Date of Birth:
              </div>
              <div className="col-span-9 text-gray-900 font-medium border-b border-gray-600 border-dashed pb-1">
                {formatDate(data.date_of_birth)}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3 font-semibold text-gray-800">
                Address:
              </div>
              <div className="col-span-9 text-gray-900 leading-relaxed border-b border-gray-600 border-dashed pb-1">
                <div className="border-b border-gray-600 border-dashed">
                  {data.address_line1}
                </div>
                {data.address_line2 && (
                  <div className="border-b border-gray-600 border-dashed">
                    {data.address_line2}
                  </div>
                )}
                <div className="border-b border-gray-600 border-dashed">
                  {data.landmark ? `${data.landmark}, ` : ""}
                  {data.post_office ? `PO: ${data.post_office}, ` : ""}
                  {data.city}, {data.district}
                </div>
                <div>
                  {data.state} - {data.pincode}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3 font-semibold text-gray-800">
                Gender:
              </div>
              <div className="col-span-9 text-gray-900 font-medium border-b border-gray-600 border-dashed pb-1">
                {data.gender}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3 font-semibold text-gray-800">
                Marital Status:
              </div>
              <div className="col-span-9 text-gray-900 font-medium border-b border-gray-600 border-dashed pb-1">
                {data.marital_status}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3 font-semibold text-gray-800">
                Mobile No:
              </div>
              <div className="col-span-9 text-gray-900 font-medium border-b border-gray-600 border-dashed pb-1">
                {data.mobile_number}
              </div>
            </div>
          </div>
          <div className="break-inside-avoid">
            {/* Family Details Heading */}
            <div className="text-center text-gray-800 font-bold underline">
              <span>Family Details</span>
            </div>
            {/* Family Details Note */}
            <div className="text-left text-gray-800 font-bold text-xs">
              <span className="underline">Note:</span>
              <span>
                {" "}
                If Married then specify your Spouse &amp; Children Names.
              </span>
            </div>
            {/* Family Details */}
            <div className="overflow-hidden border border-gray-700 rounded-sm mt-2">
              <table className="min-w-full text-sm text-left">
                <thead className="text-gray-800 font-semibold border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-2 border-r border-gray-700">
                      Relationship
                    </th>
                    <th className="px-4 py-2 border-r border-gray-700">Name</th>
                    <th className="px-4 py-2 border-r border-gray-700">
                      Age (Date of Birth)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.dependents &&
                  Array.isArray(data.dependents) &&
                  data.dependents.length > 0 ? (
                    data.dependents.map((dep, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-700 last:border-0"
                      >
                        <td className="px-4 py-2 border-r border-gray-700">
                          {dep.relationship}
                        </td>
                        <td className="px-4 py-2 border-r border-gray-700">
                          {dep.name}
                        </td>
                        <td className="px-4 py-2 border-r border-gray-700">
                          {dep.age} {"("}
                          {formatDate(dep.dob)}
                          {")"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      {[1, 2].map((_, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-700 last:border-0 h-10"
                        >
                          <td className="px-4 py-2 border-r border-gray-700"></td>
                          <td className="px-4 py-2 border-r border-gray-700"></td>
                          <td className="px-4 py-2 border-r border-gray-700"></td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Declaration & Signature */}
            <div className="mt-6">
              <div className="flex justify-between items-end px-4 mt-8">
                {/* Date (Left) */}
                <div className="text-center">
                  <div className="mb-2 text-sm font-semibold text-gray-900">
                    {new Date().toLocaleDateString("en-GB")}
                  </div>
                  <div className="border-t border-gray-400 w-32 mx-auto pt-1 text-xs uppercase tracking-wide text-gray-800">
                    Date
                  </div>
                </div>

                {/* Signature (Right) */}
                <div className="text-center">
                  {derivedSignature ? (
                    <img
                      src={derivedSignature}
                      alt="Signature"
                      className="h-16 mb-2 mx-auto"
                    />
                  ) : (
                    <div className="h-16 mb-2 w-32 mx-auto bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                      No Signature
                    </div>
                  )}
                  <div className="border-t border-gray-400 w-48 mx-auto pt-1 text-xs uppercase tracking-wide text-gray-500">
                    Employee Signature
                  </div>
                  <div className="text-xs font-semibold mt-1 text-gray-900">
                    ({data.employee_full_name})
                  </div>
                </div>
              </div>
            </div>
          </div>

        
        </div>
      </div>
    </div>

  );
};

export default PreviewMediclaim;
