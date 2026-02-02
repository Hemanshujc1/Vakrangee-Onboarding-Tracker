import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import useAutoFill from "../../hooks/useAutoFill";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import FormCard from "../../Components/Employee/Shared/FormCard";

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

  const handleCardClick = (form) => {
    if (["Approved", "Submitted", "Rejected"].includes(form.status)) {
        navigate(form.previewPath || `${form.path}/preview`, {
            state: {
                formData: form.formData,
                status: form.rawStatus,
                rejectionReason: form.rejectionReason,
            },
        });
    } else {
        navigate(form.path);
    }
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
          <FormCard 
            key={form.id} 
            form={form} 
            onClick={() => handleCardClick(form)} 
          />
        ))}
      </div>
    </DashboardLayout>
  );
};

export default PreJoiningForms;
