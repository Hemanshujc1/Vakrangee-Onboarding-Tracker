import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import useAutoFill from "../../hooks/useAutoFill";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { FileText, Edit, CheckCircle, ChevronRight } from "lucide-react";

const PreJoiningForms = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const employeeId = user.id;
  const { data: autoFillData } = useAutoFill(employeeId);

  useEffect(() => {
    if (autoFillData && autoFillData.onboardingStage === 'BASIC_INFO') {
        navigate('/employee/basic-info');
    }
  }, [autoFillData, navigate]);

  // Default forms configuration
  const initialForms = [
    {
      id: 2,
      name: "Employment Application Form",
      description: "Lorem ipsum dolor sit amet.",
      status: "Pending",
      time: "7 min",
      path: "/forms/employment-application",
    },
    {
      id: 4,
      name: "Mediclaim Form",
      description: "Lorem ipsum dolor sit amet.",
      status: "Pending",
      time: "2 min",
      path: "/forms/mediclaim",
    },
    {
      id: 1,
      name: "Employee Information Form",
      description: "Lorem ipsum dolor sit amet.",
      status: "Pending",
      time: "5 min",
      path: "/forms/employment-info",
    },
    {
      id: 3,
      name: "Form-F-Gratuity Nomination",
      description: "Lorem ipsum dolor sit amet.",
      status: "Completed",
      time: "3 min",
      path: "/forms/gratuity-form",
    },
  ];

  // Merge backend status into forms
  const forms = React.useMemo(() => {
    if (!autoFillData) return initialForms;

    return initialForms.map((form) => {
      let status = "PENDING";
      let formData = null;
      let rejectionReason = null;
      let verifiedByName = null;
      let previewPath = `${form.path}/preview`; // Default
      let isDisabled = false;

      if (form.id === 4) {
        // Mediclaim
        status = autoFillData.mediclaimStatus || "PENDING";
        formData = autoFillData.mediclaimData;
        rejectionReason = autoFillData.rejectionReason;
        verifiedByName = autoFillData.mediclaimVerifiedByName;
        isDisabled = autoFillData.mediclaimDisabled;
      } else if (form.id === 2) {
        // Application
        status = autoFillData.applicationStatus || "PENDING";
        formData = autoFillData.applicationData;
        rejectionReason = autoFillData.applicationRejectionReason;
        verifiedByName = autoFillData.applicationVerifiedByName;
        previewPath = "/forms/application/preview"; // Custom path
        isDisabled = autoFillData.applicationDisabled;
      } else if (form.id === 3) {
        // Gratuity
        status = autoFillData.gratuityStatus || "PENDING";
        formData = autoFillData.gratuityData;
        rejectionReason = autoFillData.gratuityRejectionReason || null;
        verifiedByName = autoFillData.gratuityVerifiedByName;
        isDisabled = autoFillData.gratuityDisabled;
      } else if (form.id === 1) {
        // Employee Info
        status = autoFillData.employeeInfoStatus || "PENDING";
        formData = autoFillData.employeeInfoData;
        rejectionReason = autoFillData.employeeInfoRejectionReason;
        verifiedByName = autoFillData.employeeInfoVerifiedByName;
        previewPath = "/forms/information/preview";
        isDisabled = autoFillData.employeeInfoDisabled;
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

      if (form.id === 4 || form.id === 2 || form.id === 3 || form.id === 1) {
        return {
          ...form,
          status: uiStatus,
          rawStatus: status,
          formData,
          rejectionReason,
          verifiedByName,
          previewPath,
          isDisabled
        };
      }

      return form;
    }).filter(f => !f.isDisabled);
  }, [autoFillData]);

  const renderActionButton = (form) => {
    // Use custom preview path if available, else default
    const navigateToPreview = () => {
      navigate(form.previewPath || `${form.path}/preview`, {
        state: {
          formData: form.formData,
          status: form.rawStatus,
          rejectionReason: form.rejectionReason,
        },
      });
    };

    if (form.status === "Approved") {
      // VERIFIED
      return (
        <button
          onClick={navigateToPreview}
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
          onClick={navigateToPreview}
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
          onClick={navigateToPreview}
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
          Pre-Joining Forms
        </h1>
        <p className="text-gray-500 mt-2">
          Please fill out and submit the following forms.
        </p>
      </header>

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

export default PreJoiningForms;
