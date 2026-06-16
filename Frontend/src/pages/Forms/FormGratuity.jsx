import {
  React,
  FormLayout,
  onValidationFail,
} from "../../utils/formDependencies";
import GratuityHeader from "./GratuitySections/GratuityHeader";
import GratuityRecipient from "./GratuitySections/GratuityRecipient";
import GratuityNomineeStatement from "./GratuitySections/GratuityNomineeStatement";
import GratuityEmployeeStatement from "./GratuitySections/GratuityEmployeeStatement";
import GratuityWitnessDeclaration from "./GratuitySections/GratuityWitnessDeclaration";
import GratuityEmployerCertificate from "./GratuitySections/GratuityEmployerCertificate";
import GratuityAcknowledgement from "./GratuitySections/GratuityAcknowledgement";
import useFormGratuity from "./useFormGratuity";

import useOnboardingActions from "../../hooks/useOnboardingActions";

const FormGratuity = () => {
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
    nomineeFields,
    witnessFields,
    appendNominee,
    removeNominee,
    isPreviewRef,
    setIsPreviewMode,
  } = useFormGratuity();

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

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <FormLayout
        title="FORM 'F'"
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
        <GratuityHeader />
        <GratuityRecipient />
        <GratuityNomineeStatement
          register={register}
          watch={watch}
          nomineeFields={nomineeFields}
          removeNominee={removeNominee}
          appendNominee={appendNominee}
          errors={errors}
        />
        <GratuityEmployeeStatement
          register={register}
          errors={errors}
          autoFillData={autoFillData}
          signaturePreview={signaturePreview}
        />
        <GratuityWitnessDeclaration
          witnessFields={witnessFields}
          register={register}
          errors={errors}
        />
        <GratuityEmployerCertificate />
        <GratuityAcknowledgement />

        <p className="mt-4">
          <span className="font-bold"> Note.</span> — Strike out the
          words/paragraphs not applicable.
        </p>
      </FormLayout>
    </>
  );
};

export default FormGratuity;
