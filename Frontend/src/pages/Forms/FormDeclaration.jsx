import React from "react";
import FormLayout from "../../Components/Forms/FormLayout";
import { onValidationFail } from "../../utils/formUtils";
import useFormDeclaration from "./useFormDeclaration";
import useOnboardingActions from "../../hooks/useOnboardingActions";
import SelfDeclaration from "./DeclarationSections/SelfDeclaration";

const FormDeclaration = () => {
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
    errors,
    isSubmitting,
    onFormSubmit,
    showAlert,
    isPreviewRef,
  } = useFormDeclaration();

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

  if (loading) return <div>Loading Form Data...</div>;

  return (
    <FormLayout
      title="SELF-DECLARATION FORM"
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
      {/* Content */}
      <SelfDeclaration register={register} errors={errors} />
    </FormLayout>
  );
};

export default FormDeclaration;
