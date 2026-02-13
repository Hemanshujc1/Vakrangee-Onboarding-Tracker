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
    watch,
    errors,
    isSubmitting,
    onFormSubmit,
    showAlert,
    nomineeFields,
    witnessFields,
    appendNominee,
    removeNominee,
  } = useFormGratuity();

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
        actions={{
          isSubmitting,
          onSaveDraft: () => {
            setValue("isDraft", true);
            handleSubmit(onFormSubmit, (e) => onValidationFail(e, showAlert))();
          },
          onSubmit: () => setValue("isDraft", false),
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
