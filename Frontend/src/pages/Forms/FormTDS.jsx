import {
  React,
  FormLayout,
  onValidationFail,
} from "../../utils/formDependencies";
import TaxRegimeSelection from "./TDSSections/TaxRegimeSelection";
import EducationLoanSection from "./TDSSections/EducationLoanSection";
import HousingLoanSection from "./TDSSections/HousingLoanSection";
import NPSSection from "./TDSSections/NPSSection";
import HRASection from "./TDSSections/HRASection";
import MedicalInsuranceSection from "./TDSSections/MedicalInsuranceSection";
import OtherInvestmentsSection from "./TDSSections/OtherInvestmentsSection";
import EmployeeDeclaration from "./TDSSections/EmployeeDeclaration";
import useFormTDS from "./useFormTDS";

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
    watch,
    errors,
    isSubmitting,
    onFormSubmit,
    showAlert,
    watchRelatedLandlord,
    isPreviewRef, // We use the ref here to match the logic in useFormTDS
  } = useFormTDS();

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
      actions={{
        isSubmitting,
        onSaveDraft: () => {
          setValue("isDraft", true);
          isPreviewRef.current = false;
          handleSubmit(onFormSubmit, (e) => onValidationFail(e, showAlert))();
        },
        onSubmit: () => {
          setValue("isDraft", true);
          isPreviewRef.current = true;
          handleSubmit(onFormSubmit, (e) => onValidationFail(e, showAlert))();
        },
      }}
      signature={{
        setValue,
        error: errors.signature,
        preview: signaturePreview,
        setPreview: setSignaturePreview,
        isSaved: hasSavedSignature,
        fieldName: "signature",
      }}
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
