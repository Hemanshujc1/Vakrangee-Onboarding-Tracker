import React from "react";
import FormLayout from "../../Components/Forms/FormLayout";
import { InstructionBlock } from "../../Components/Forms/Shared";
import { onValidationFail } from "../../utils/formUtils";
import EmployeeDetails from "./MediclaimSections/EmployeeDetails";
import AddressDetails from "./MediclaimSections/AddressDetails";
import FamilyDetails from "./MediclaimSections/FamilyDetails";
import useFormMediclaim from "./useFormMediclaim";

import useOnboardingActions from "../../hooks/useOnboardingActions";

const FormMediclaim = () => {
  const {
    autoFillData,
    loading,
    signaturePreview,
    setSignaturePreview,
    isLocked,
    hasSavedSignature,
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    errors,
    isSubmitting,
    onFormSubmit,
    showAlert,
    fields,
    append,
    remove,
    isPreviewRef,
    setIsPreviewMode,
  } = useFormMediclaim();

  const { actions, signatureProps } = useOnboardingActions({
    isSubmitting,
    setValue,
    getValues,
    isPreviewRef,
    setIsPreviewMode,
    onFormSubmit,
    errors,
    signaturePreview,
    setSignaturePreview,
    hasSavedSignature,
  });

  if (loading) return <div>Loading Form Data...</div>;
  const maritalStatus = watch("marital_status");

  return (
    <FormLayout
      title="Mediclaim Information Form"
      employeeData={{
        ...autoFillData,
        signature:
          autoFillData?.mediclaimData?.signature_path ||
          autoFillData?.signature,
      }}
      showPhoto={false}
      showSignature={true}
      signaturePreview={signaturePreview}
      isLocked={isLocked}
      onSubmit={handleSubmit(onFormSubmit, (e) =>
        onValidationFail(e, showAlert)
      )}
      actions={actions}
      signature={signatureProps}
    >
      {/* Content */}

      <InstructionBlock />
      {/* 1. Employee Details Section */}
      <EmployeeDetails
        register={register}
        errors={errors}
        autoFillData={autoFillData}
      />

      {/* 2. Address Section */}
      <AddressDetails register={register} errors={errors} />

      {/* 3. Family Details Section (Dynamic) - Only if Married */}
      {maritalStatus === "Married" && (
        <FamilyDetails
          register={register}
          errors={errors}
          fields={fields}
          remove={remove}
          append={append}
        />
      )}
    </FormLayout>
  );
};

export default FormMediclaim;
