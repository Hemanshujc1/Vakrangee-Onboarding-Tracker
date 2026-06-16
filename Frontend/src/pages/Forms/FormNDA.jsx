import {
  React,
  FormLayout,
  onValidationFail,
} from "../../utils/formDependencies";
import useFormNDA from "./useFormNDA";
import useOnboardingActions from "../../hooks/useOnboardingActions";
import EmployeeParty from "./NDASections/EmployeeParty";
import CompanyParty from "./NDASections/CompanyParty";
import TermsAndConditions from "./NDASections/TermsAndConditions";

const FormNDA = () => {
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
  } = useFormNDA();

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
      title="Non-Disclosure Agreement"
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
      <div className="bg-white border-b border-gray-300 p-4 mb-6 text-sm text-gray-800">
        <div className="flex flex-col gap-1">
          <p className="font-serif tracking-wide text-gray-900 mb-1 pb-1">
            The “Agreement” is made effective from:
          </p>
          <p className="font-semibold mt-1">
            Date: {new Date().toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>

      {/* Party 1: Employee */}
      <div className="space-y-6">
        <EmployeeParty register={register} errors={errors} />
        <CompanyParty />
      </div>

      <TermsAndConditions />
    </FormLayout>
  );
};

export default FormNDA;
