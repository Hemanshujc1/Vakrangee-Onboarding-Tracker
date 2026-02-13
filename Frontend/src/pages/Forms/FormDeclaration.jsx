import {
  React,
  FormLayout,
  onValidationFail,
} from "../../utils/formDependencies";
import FormInput from "../../Components/Forms/FormInput";
import useFormDeclaration from "./useFormDeclaration";

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
    errors,
    isSubmitting,
    onFormSubmit,
    showAlert,
    isPreviewRef,
  } = useFormDeclaration();

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
      actions={{
        isSubmitting,
        onSaveDraft: () => {
          setValue("isDraft", true);
          isPreviewRef.current = false;
          handleSubmit(onFormSubmit, (e) => onValidationFail(e, showAlert))();
        },
        onSubmit: () => {
          setValue("isDraft", true); // Save as draft first
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
      {/* Content */}
      <div className="bg-white border-b border-gray-300 p-4 mb-6 text-sm text-gray-800">
        <div className="flex flex-col gap-2">
          <div className="font-serif tracking-wide text-gray-900 mb-2 pb-1 border-b border-gray-200 leading-loose">
            I, the undersigned
            <select
              {...register("title")}
              className={`mx-2 border-b border-gray-400 focus:border-gray-600 outline-none p-1 bg-transparent ${
                errors.title ? "border-red-500" : ""
              }`}
            >
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
            </select>
            (Full Name):
            <input
              {...register("employee_full_name")}
              className={`w-full sm:w-1/2 ml-2 border-b border-gray-400 focus:border-gray-600 outline-none p-1 transition-colors bg-transparent disabled:bg-gray-50 ${
                errors.employee_full_name ? "border-red-500" : ""
              }`}
              placeholder="Enter Full Name"
              disabled
            />
            {errors.employee_full_name && (
              <p className="text-red-500 text-xs mt-1 ml-4 inline-block">
                {errors.employee_full_name.message}
              </p>
            )}{" "}
            hereby declare that I have resigned from my previous employment i.e.
            Company Name:
            <input
              {...register("previous_company_name")}
              placeholder="Previous Company Name"
              className={`w-full sm:w-1/3 ml-2 border-b border-gray-400 focus:border-gray-600 outline-none p-1 inline-block my-1 bg-transparent ${
                errors.previous_company_name ? "border-red-500" : ""
              }`}
            />
            {errors.previous_company_name && (
              <span className="text-red-500 text-xs ml-2 inline-block">
                {errors.previous_company_name.message}
              </span>
            )}
            Designation:
            <input
              {...register("previous_job_title")}
              placeholder="Previous Designation"
              className={`w-full sm:w-1/4 ml-2 border-b border-gray-400 focus:border-gray-600 outline-none p-1 inline-block my-1 bg-transparent ${
                errors.previous_job_title ? "border-red-500" : ""
              }`}
            />
            {errors.previous_job_title && (
              <span className="text-red-500 text-xs ml-2 inline-block">
                {errors.previous_job_title.message}
              </span>
            )}
            and completed all full and final processes before joining Vakrangee
            Limited.
          </div>
          <p className="mt-2 text-justify leading-relaxed">
            I say that I do not have any outstanding dues or pending assignments
            of whatsoever nature in my previous employment.
          </p>
          <p className="mt-2 text-justify leading-relaxed">
            I say that I take complete responsibility for any issue / liability
            arising out of my previous employment and Vakrangee Limited, shall
            not have any responsibility whatsoever in such matters.
          </p>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <FormInput
            label="Current Designation"
            register={register}
            name="current_job_title"
            placeholder="Enter Current Designation"
            disabled
            error={errors.current_job_title}
            required
          />
        </div>
      </div>
    </FormLayout>
  );
};

export default FormDeclaration;
