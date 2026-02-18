import React from "react";
import { Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FormSection from "../../Components/EmployeeDetail/FormSection";
import FormRow from "../../Components/EmployeeDetail/FormRow";

const EmployeeForms = ({ employee, handleToggleFormAccess }) => {
  const navigate = useNavigate();

  const getCommonState = (dataKey, statusKey, employeeId) => ({
    formData: {
      ...(employee[dataKey] || {}),
      signature_path: employee[dataKey]?.signature_path || employee.signature,
      employee_full_name:
        employee[dataKey]?.employee_full_name || employee.fullName,
      // Add other common fallback fields if needed
      member_name_aadhar:
        employee[dataKey]?.member_name_aadhar || employee.fullName, // For EPF
    },
    status: employee[statusKey],
    isHR: true,
    employeeId: employeeId,
  });

  const preJoiningForms = [
    {
      title: "Employment Application Form",
      statusKey: "applicationStatus",
      disabledKey: "applicationDisabled",
      formKey: "EMPLOYMENT_APP",
      category: "PRE",
      verifiedByNameKey: "applicationVerifiedByName",
      onView: () => navigate(`/forms/application/preview/${employee.id}`),
    },
    {
      title: "Mediclaim Form",
      statusKey: "mediclaimStatus",
      disabledKey: "mediclaimDisabled",
      formKey: "MEDICLAIM",
      category: "PRE",
      verifiedByNameKey: "mediclaimVerifiedByName",
      onView: () =>
        navigate(`/forms/mediclaim/preview/${employee.id}`, {
          state: getCommonState(
            "mediclaimData",
            "mediclaimStatus",
            employee.id
          ),
        }),
    },
    {
      title: "Employment Information Form",
      statusKey: "employeeInfoStatus",
      disabledKey: "employeeInfoDisabled",
      formKey: "EMPLOYEE_INFO",
      category: "PRE",
      verifiedByNameKey: "employeeInfoVerifiedByName",
      onView: () => navigate(`/forms/information/preview/${employee.id}`),
    },
    {
      title: "Gratuity Form (Form F)",
      statusKey: "gratuityStatus",
      disabledKey: "gratuityDisabled",
      formKey: "GRATUITY",
      category: "PRE",
      verifiedByNameKey: "gratuityVerifiedByName",
      onView: () =>
        navigate(`/forms/gratuity-form/preview/${employee.id}`, {
          state: getCommonState("gratuityData", "gratuityStatus", employee.id),
        }),
    },
  ];

  const postJoiningForms = [
    {
      title: "Non-Disclosure Agreement (NDA)",
      statusKey: "ndaStatus",
      disabledKey: "ndaDisabled",
      formKey: "NDA",
      category: "POST",
      verifiedByNameKey: "ndaVerifiedByName",
      onView: () =>
        navigate(`/forms/non-disclosure-agreement/preview/${employee.id}`, {
          state: getCommonState("ndaData", "ndaStatus", employee.id),
        }),
    },
    {
      title: "TDS Declaration Form",
      statusKey: "tdsStatus",
      disabledKey: "tdsDisabled",
      formKey: "TDS",
      category: "POST",
      verifiedByNameKey: "tdsVerifiedByName",
      onView: () =>
        navigate(`/forms/tds-form/preview/${employee.id}`, {
          state: getCommonState("tdsData", "tdsStatus", employee.id),
        }),
    },
    {
      title: "Declaration Form",
      statusKey: "declarationStatus",
      disabledKey: "declarationDisabled",
      formKey: "DECLARATION",
      category: "POST",
      verifiedByNameKey: "declarationVerifiedByName",
      onView: () =>
        navigate(`/forms/declaration-form/preview/${employee.id}`, {
          state: getCommonState(
            "declarationData",
            "declarationStatus",
            employee.id
          ),
        }),
    },

    {
      title: "Employees Provident Fund (EPF) Form",
      statusKey: "epfStatus",
      disabledKey: "epfDisabled",
      formKey: "EPF",
      category: "POST",
      verifiedByNameKey: "epfVerifiedByName",
      onView: () =>
        navigate(`/forms/employees-provident-fund/preview/${employee.id}`, {
          state: getCommonState("epfData", "epfStatus", employee.id),
        }),
    },
  ];

  const renderFormRows = (forms) =>
    forms.map((form) => (
      <FormRow
        key={form.formKey}
        title={form.title}
        status={employee[form.statusKey]}
        isDisabled={employee[form.disabledKey]}
        onToggle={() =>
          handleToggleFormAccess(
            form.formKey,
            form.category,
            employee[form.disabledKey]
          )
        }
        onView={form.onView}
        verifiedByName={employee[form.verifiedByNameKey]}
      />
    ));

  return (
    <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-6">
      <FormSection title="Pre-Joining Forms" icon={Briefcase}>
        {renderFormRows(preJoiningForms)}
      </FormSection>

      <FormSection title="Post-Joining Forms" icon={Briefcase}>
        {renderFormRows(postJoiningForms)}
      </FormSection>
    </div>
  );
};

export default EmployeeForms;
