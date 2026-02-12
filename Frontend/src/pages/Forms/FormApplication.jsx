import { React, FormLayout } from "../../utils/formDependencies";
import { DocumentFields } from "../../Components/Forms/Shared";
import PersonalInformation from "./ApplicationSections/PersonalInformation";
import AddressDetails from "./ApplicationSections/AddressDetails";
import EducationAndTraining from "./ApplicationSections/EducationAndTraining";
import WorkExperience from "./ApplicationSections/WorkExperience";
import OtherDetails from "./ApplicationSections/OtherDetails";
import useFormApplication from "./useFormApplication";

const FormApplication = () => {
  const {
    autoFillData,
    loading,
    signaturePreview,
    setSignaturePreview,
    isLocked,
    hasSavedSignature,
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    errors,
    isSubmitting,
    educationFields,
    appendEdu,
    removeEdu,
    trainingFields,
    appendTraining,
    removeTraining,
    achievementFields,
    appendAchievement,
    removeAchievement,
    familyFields,
    appendFamily,
    removeFamily,
    languageFields,
    appendLang,
    removeLang,
    historyFields,
    appendHistory,
    removeHistory,
    referenceFields,
    appendRef,
    removeRef,
    onFormSubmit,
    onValidationFail,
    showAlert,
    setIsPreviewMode,
  } = useFormApplication();

  if (loading) return <div>Loading...</div>;

  return (
    <FormLayout
      title="Employment Application Form"
      employeeData={autoFillData}
      showPhoto={true}
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
        onSubmit: () => {
          setIsPreviewMode(true);
          setValue("isDraft", true);
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
      {/* Personal Information & Address */}
      <PersonalInformation
        register={register}
        errors={errors}
        autoFillData={autoFillData}
      />
      <AddressDetails
        register={register}
        errors={errors}
        autoFillData={autoFillData}
        setValue={setValue}
        watch={watch}
      />

      {/* Education & Training */}
      <EducationAndTraining
        register={register}
        errors={errors}
        control={control}
        educationFields={educationFields}
        appendEdu={appendEdu}
        removeEdu={removeEdu}
        trainingFields={trainingFields}
        appendTraining={appendTraining}
        removeTraining={removeTraining}
        achievementFields={achievementFields}
        appendAchievement={appendAchievement}
        removeAchievement={removeAchievement}
      />

      {/* Documents */}
      <DocumentFields
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        autoFillData={autoFillData}
      />

      {/* Work Experience & Employment History */}
      <WorkExperience
        register={register}
        errors={errors}
        historyFields={historyFields}
        appendHistory={appendHistory}
        removeHistory={removeHistory}
      />

      {/* Other Details */}
      <OtherDetails
        register={register}
        errors={errors}
        languageFields={languageFields}
        appendLang={appendLang}
        removeLang={removeLang}
        familyFields={familyFields}
        appendFamily={appendFamily}
        removeFamily={removeFamily}
        referenceFields={referenceFields}
        appendRef={appendRef}
        removeRef={removeRef}
      />

      {/* Declaration */}
      <div className="bg-gray-50 p-6 rounded border border-gray-200">
        <h4 className="font-bold mb-4 uppercase">Declaration</h4>
        <p className="text-sm text-justify">
          I declare that the particulars given above are true & complete to the
          best of my knowledge & belief. I agree to produce any documentary
          evidence in proof of the above statements as may be demanded by the
          company. If found otherwise, my appointment shall be liable for
          termination. I confirm that I do not have any criminal record. I will
          also abide by all rules & regulations, Code of Conduct framed by the
          company from time to time.
        </p>
      </div>
    </FormLayout>
  );
};

export default FormApplication;
