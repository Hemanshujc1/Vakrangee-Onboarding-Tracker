import React, { useState, useEffect } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import useAutoFill from "../../hooks/useAutoFill";
import { FileText, Edit, CheckCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PostJoiningForms = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const employeeId = user.employeeId || user.id;
  const { data: autoFillData } = useAutoFill(employeeId);

  useEffect(() => {
    if (
      autoFillData &&
      !["POST_JOINING", "ACTIVE"].includes(autoFillData.onboardingStage)
    ) {
      navigate("/employee");
    }
  }, [autoFillData, navigate]);

  // Default forms configuration
  const initialForms = [
    {
      id: 1,
      name: "Non- Disclosure Agreement (NDA) Form",
      description: "Lorem ipsum dolor sit amet.",
      status: "Pending",
      time: "1 min",
      path: "/forms/non-disclosure-agreement",
    },
    {
      id: 2,
      name: "TDS Declaration Form",
      description: "Lorem ipsum dolor sit amet.",
      status: "Pending",
      time: "5 min",
      path: "/forms/tds-form",
    },
    {
      id: 3,
      name: "Declaration Form",
      description: "Lorem ipsum dolor sit amet.",
      status: "Completed",
      time: "1 min",
      path: "/forms/declaration-form",
    },
    {
      id: 4,
      name: "Employees Provident Fund (EPF) Form",
      description: "Lorem ipsum dolor sit amet.",
      status: "Pending",
      time: "3 min",
      path: "/forms/employees-provident-fund",
    },
  ];

  // Merge backend status into forms
  const forms = React.useMemo(() => {
    if (!autoFillData) return initialForms;

    return initialForms
      .map((form) => {
        let status = "PENDING";
        let data = null;
        let rejectionReason = null;
        let verifiedByName = null;
        let isDisabled = false;

        if (form.id === 3) {
          // Declaration
          status = autoFillData.declarationStatus || "PENDING";
          data = autoFillData.declarationData;
          rejectionReason = autoFillData.declarationRejectionReason;
          verifiedByName = autoFillData.declarationVerifiedByName;
          isDisabled = autoFillData.declarationDisabled;
        } else if (form.id === 1) {
          // NDA
          status = autoFillData.ndaStatus || "PENDING";
          data = autoFillData.ndaData;
          rejectionReason = autoFillData.ndaRejectionReason;
          verifiedByName = autoFillData.ndaVerifiedByName;
          isDisabled = autoFillData.ndaDisabled;
        } else if (form.id === 2) {
          // TDS
          status = autoFillData.tdsStatus || "PENDING";
          data = autoFillData.tdsData;
          rejectionReason = autoFillData.tdsRejectionReason;
          verifiedByName = autoFillData.tdsVerifiedByName;
          isDisabled = autoFillData.tdsDisabled;
        } else if (form.id === 4) {
          // EPF
          status = autoFillData.epfStatus || "PENDING";
          data = autoFillData.epfData;
          rejectionReason = autoFillData.epfRejectionReason;
          verifiedByName = autoFillData.epfVerifiedByName;
          isDisabled = autoFillData.epfDisabled;
        }

        // Map backend status to UI status
        let uiStatus =
          status === "PENDING"
            ? "Pending"
            : status === "VERIFIED"
            ? "Approved"
            : status === "REJECTED"
            ? "Rejected"
            : "Submitted"; // Covers 'SUBMITTED'

        return {
          ...form,
          status: uiStatus,
          rawStatus: status,
          formData: data,
          rejectionReason,
          verifiedByName,
          isDisabled,
        };
      })
      .filter((f) => !f.isDisabled);
  }, [autoFillData]);

  const renderActionButton = (form) => {
    // Navigation Path Construction
    let previewPath = `${form.path}/preview`;
    if (form.id === 4) {
      previewPath += `/${employeeId}`;
    }

    if (form.status === "Approved") {
      // VERIFIED
      return (
        <button
          onClick={() =>
            navigate(previewPath, {
              state: {
                formData: form.formData,
                status: form.rawStatus,
              },
            })
          }
          className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-all"
        >
          <CheckCircle size={16} /> View Approved
        </button>
      );
    }

    if (form.status === "Submitted") {
      // SUBMITTED
      return (
        <button
          onClick={() =>
            navigate(previewPath, {
              state: {
                formData: form.formData,
                status: form.rawStatus,
              },
            })
          }
          className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-all"
        >
          View Submitted
        </button>
      );
    }

    if (form.status === "Rejected") {
      // REJECTED
      return (
        <button
          onClick={() =>
            navigate(previewPath, {
              state: {
                formData: form.formData,
                status: form.rawStatus,
                rejectionReason: form.rejectionReason,
              },
            })
          }
          className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all"
        >
          <Edit size={16} /> View Rejection Details
        </button>
      );
    }

    // Default / Pending
    return (
      <button
        onClick={() => navigate(form.path)}
        className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 bg-(--color-primary) text-white hover:brightness-110 shadow-sm transition-all"
      >
        Start Filling <ChevronRight size={16} />
      </button>
    );
  };

  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-text-dark)">
          Post-Joining Forms
        </h1>
        <p className="text-gray-500 mt-2">
          Formalities to be completed on your day of joining.
        </p>
      </header>

      {/* <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-6">
                <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Access Locked</h2>
            <p className="text-gray-500 max-w-md mx-auto">
                These digital forms (e.g., PF Nomination, Gratuity) will be unlocked by your HR Admin once you have successfully joined.
            </p>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forms.map((form) => (
          <div
            key={form.id}
            className={`p-6 rounded-xl shadow-sm border transition-all group ${
              form.status === "Rejected"
                ? "bg-red-50 border-red-200"
                : "bg-white border-gray-100 hover:border-blue-200"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`p-3 rounded-lg ${
                  form.status === "Approved"
                    ? "bg-green-100 text-green-600"
                    : form.status === "Rejected"
                    ? "bg-red-100 text-red-600"
                    : form.status === "Submitted"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-blue-50 text-(--color-primary)"
                }`}
              >
                <FileText size={24} />
              </div>

              {/* Status Badge */}
              <div className="flex flex-col gap-2 text-center">
                <span
                  className={`text-xs font-semibold px-1 py-1 rounded ${
                    form.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : form.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : form.status === "Submitted"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {form.status === "Submitted"
                    ? "Submitted for Verification"
                    : form.status === "Approved"
                    ? "Verified"
                    : form.status === "Rejected"
                    ? "Returned"
                    : `~ ${form.time}`}
                </span>

                {form.status === "Approved" && form.verifiedByName && (
                  <div className="text-[10px] text-gray-500 font-medium mt-1 text-right">
                    Verified by: {form.verifiedByName}
                  </div>
                )}
              </div>
            </div>

            <h3 className="font-bold text-lg text-gray-800 mb-1">
              {form.name}
            </h3>
            <p className="text-sm text-gray-500 mb-6 min-h-10">
              {form.description}
            </p>

            {renderActionButton(form)}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default PostJoiningForms;
