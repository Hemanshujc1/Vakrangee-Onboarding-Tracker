import {
  React,
  FormLayout,
  Loader2,
  onValidationFail,
} from "../../utils/formDependencies";
import EPFFormHeader from "./EPFSections/EPFFormHeader";
import EPFMemberDetails from "./EPFSections/EPFMemberDetails";
import EPFPreviousEmployment from "./EPFSections/EPFPreviousEmployment";
import EPFInternationalWorker from "./EPFSections/EPFInternationalWorker";
import EPFKYCDetails from "./EPFSections/EPFKYCDetails";
import EPFPFHistory from "./EPFSections/EPFPFHistory";
import EPFUndertaking from "./EPFSections/EPFUndertaking";
import EPFEmployerDeclaration from "./EPFSections/EPFEmployerDeclaration";
import useFormEPF from "./useFormEPF";

const FormEPF = () => {
  const {
    targetId,
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
    setIsPreviewMode,
    prevEpfMember,
    prevEpsMember,
    internationalWorker,
    relationshipType,
    isEmployee,
    autoFillData,
    isPreviewRef,
  } = useFormEPF();

  if (loading) return <div>Loading Form Data...</div>;

  return (
    <FormLayout
      title="EPF REGISTRATION FORM"
      employeeData={targetId}
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
      <EPFFormHeader />

      <EPFMemberDetails
        register={register}
        errors={errors}
        relationshipType={relationshipType}
        autoFillData={autoFillData}
      />

      <EPFPreviousEmployment
        register={register}
        errors={errors}
        prevEpfMember={prevEpfMember}
        prevEpsMember={prevEpsMember}
      />

      <EPFInternationalWorker
        register={register}
        errors={errors}
        internationalWorker={internationalWorker}
        autoFillData={autoFillData}
      />

      <EPFKYCDetails register={register} errors={errors} />

      <EPFPFHistory register={register} errors={errors} />

      <EPFUndertaking register={register} errors={errors} />

      <EPFEmployerDeclaration
        register={register}
        errors={errors}
        watch={watch}
        isEmployee={isEmployee}
      />
    </FormLayout>
  );
};

export default FormEPF;
