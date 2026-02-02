import React, { useState, useEffect } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import useAutoFill from "../../hooks/useAutoFill";
import { useNavigate } from "react-router-dom";
import FormCard from "../../Components/Employee/Shared/FormCard";

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
      time: "5 min",
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

  const handleCardClick = (form) => {
    // Navigation Path Construction
    let previewPath = `${form.path}/preview`;
    if (form.id === 4) {
      previewPath += `/${employeeId}`;
    }

    if (["Approved", "Submitted", "Rejected"].includes(form.status)) {
         navigate(previewPath, {
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
          Post-Joining Forms
        </h1>
        <p className="text-gray-500 mt-2">
          Formalities to be completed on your day of joining.
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

export default PostJoiningForms;
