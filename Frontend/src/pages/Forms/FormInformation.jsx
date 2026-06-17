import React from "react";
import FormLayout from "../../Components/Forms/FormLayout";
import FormInput from "../../Components/Forms/FormInput";
import PersonalDetails from "./InformationSections/PersonalDetails";
import ContactDetails from "./InformationSections/ContactDetails";
import EducationDetails from "./InformationSections/EducationDetails";
import EmploymentDetails from "./InformationSections/EmploymentDetails";
import ReferenceDetails from "./InformationSections/ReferenceDetails";
import useFormInformation from "./useFormInformation";

import useOnboardingActions from "../../hooks/useOnboardingActions";

const FormInformation = () => {
  const {
    autoFillData,
    loading,
    signaturePreview,
    setSignaturePreview,
    hasSavedSignature,
    isLocked,
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    errors,
    isSubmitting,
    eduFields,
    empFields,
    refFields,
    onSubmit,
    onValidationFail,
    setIsPreview,
    isPreviewRef,
    showAlert,
  } = useFormInformation();

  const { actions, signatureProps } = useOnboardingActions({
    isSubmitting,
    setValue,
    getValues,
    isPreviewRef,
    setIsPreviewMode: setIsPreview,
    onFormSubmit: onSubmit,
    errors,
    signaturePreview,
    setSignaturePreview,
    hasSavedSignature,
  });

  if (loading) return <div>Loading...</div>;

  return (
    <FormLayout
      title="Employee Information Form"
      showPhoto={true}
      showSignature={true}
      employeeData={autoFillData}
      signaturePreview={signaturePreview}
      isLocked={isLocked}
      onSubmit={handleSubmit(onSubmit, (e) => onValidationFail(e, showAlert))}
      actions={actions}
      signature={signatureProps}
    >
      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded mb-6 text-sm text-blue-900 border border-blue-200">
        <h3 className="font-bold mb-2 uppercase">Personal and Confidential</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            All fields are Mandatory, where Not Applicable please specify (NA).
          </li>
          <li>
            Kindly furnish all details correctly; verification will be conducted
            based on antecedents stated.
          </li>
        </ul>
      </div>

      <FormInput
        label="Designation"
        name="designation"
        register={register}
        error={errors.designation}
        required
        disabled
      />

      <PersonalDetails
        register={register}
        errors={errors}
        autoFillData={autoFillData}
        watch={watch}
        setValue={setValue}
      />

      <ContactDetails 
        register={register} 
        errors={errors} 
        watch={watch}
        setValue={setValue}
      />

      <EducationDetails
        register={register}
        errors={errors}
        eduFields={eduFields}
      />

      <EmploymentDetails
        register={register}
        errors={errors}
        empFields={empFields}
      />

      <ReferenceDetails
        register={register}
        errors={errors}
        refFields={refFields}
      />

      {/* Declaration */}
      <div className="p-4 rounded bg-gray-50 border text-sm text-gray-700 text-justify mt-6">
        <span className="font-bold block mb-2">Declaration</span>I have no
        objection, the Management of Vakrangee Ltd. to verify the information
        such as personal details, contact details, education details, criminal
        verification and previous employment details wherever applicable prior
        to my appointment. If the information given to you is not found correct
        as per my declaration, then the company can take disciplinary action
        against me.
      </div>
    </FormLayout>
  );
};

export default FormInformation;
