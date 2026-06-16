import React from "react";
import FormLayout from "../../Components/Forms/FormLayout";
import { onValidationFail } from "../../utils/formUtils";
import TaxRegimeSelection from "./TDSSections/TaxRegimeSelection";
import EducationLoanSection from "./TDSSections/EducationLoanSection";
import HousingLoanSection from "./TDSSections/HousingLoanSection";
import NPSSection from "./TDSSections/NPSSection";
import HRASection from "./TDSSections/HRASection";
import MedicalInsuranceSection from "./TDSSections/MedicalInsuranceSection";
import OtherInvestmentsSection from "./TDSSections/OtherInvestmentsSection";
import EmployeeDeclaration from "./TDSSections/EmployeeDeclaration";
import useFormTDS from "./useFormTDS";

import useOnboardingActions from "../../hooks/useOnboardingActions";

const FormTDS = () => {
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
    watchRelatedLandlord,
    isPreviewRef, // We use the ref here to match the logic in useFormTDS
  } = useFormTDS();

  const { actions, signatureProps } = useOnboardingActions({
    isSubmitting,
    setValue,
    getValues,
    isPreviewRef,
    onFormSubmit,
    errors,
    signaturePreview,
    setSignaturePreview,
    hasSavedSignature,
  });

  if (loading) return <div>Loading...</div>;

  return (
    <FormLayout
      title="TDS Declaration Form"
      employeeData={autoFillData}
      showPhoto={false}
      showSignature={true}
      signaturePreview={signaturePreview}
      isLocked={isLocked}
      onSubmit={handleSubmit(onFormSubmit, (e) =>
        onValidationFail(e, showAlert),
      )}
      actions={actions}
      signature={signatureProps}
    >
      <TaxRegimeSelection register={register} errors={errors} />

      <EducationLoanSection register={register} errors={errors} />

      <HousingLoanSection register={register} errors={errors} />

      <NPSSection register={register} errors={errors} />

      <HRASection
        register={register}
        errors={errors}
        watchRelatedLandlord={watchRelatedLandlord}
      />

      <MedicalInsuranceSection register={register} errors={errors} />

      <OtherInvestmentsSection register={register} errors={errors} />

      <EmployeeDeclaration register={register} errors={errors} watch={watch} />
    </FormLayout>
  );
};

export default FormTDS;
