import {
  React,
  FormLayout,
  onValidationFail,
} from "../../utils/formDependencies";
import FormInput from "../../Components/Forms/FormInput";
import useFormNDA from "./useFormNDA";

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
    errors,
    isSubmitting,
    onFormSubmit,
    showAlert,
    isPreviewRef,
  } = useFormNDA();

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
      actions={{
        isSubmitting,
        onSaveDraft: () => {
          setValue("isDraft", true);
          isPreviewRef.current = false;
          handleSubmit(onFormSubmit, (e) => onValidationFail(e, showAlert))();
        },
        onSubmit: () => {
          setValue("isDraft", true); // Save as Draft first
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
        <div className="space-y-4">
          <div>
            <span className="font-bold">BETWEEN:</span>
            <div className="mt-2 ml-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 items-end">
                <label className="md:col-span-2 font-semibold">
                  Employee Name:
                </label>
                <div className="md:col-span-10">
                  <FormInput
                    register={register}
                    name="employee_full_name"
                    className="font-bold uppercase"
                    disabled
                    error={errors.employee_full_name}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="ml-4 space-y-2 mt-4">
            <p className="font-semibold">Residing at:</p>
            <div className="grid grid-cols-1 gap-2">
              <FormInput
                register={register}
                label="Address Line 1"
                name="address_line1"
                placeholder="Address Line 1"
                disabled
                error={errors.address_line1}
                required
              />
              <FormInput
                register={register}
                label="Address Line 2"
                name="address_line2"
                placeholder="Address Line 2"
                disabled
                error={errors.address_line2}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  register={register}
                  label="landmark"
                  name="landmark"
                  placeholder="Landmark"
                  disabled
                  error={errors.landmark}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  register={register}
                  label="Post Office"
                  name="post_office"
                  placeholder="Post Office"
                  disabled
                  error={errors.post_office}
                  required
                />
                <FormInput
                  register={register}
                  label="District"
                  name="district"
                  placeholder="District"
                  disabled
                  error={errors.district}
                  required
                />
              </div>
              <div className="flex gap-4">
                <FormInput
                  register={register}
                  label="City"
                  name="city"
                  disabled
                  error={errors.city}
                  required
                />
                <FormInput
                  register={register}
                  label="State"
                  name="state"
                  disabled
                  error={errors.state}
                  required
                />
                <FormInput
                  register={register}
                  label="Pincode"
                  name="pincode"
                  disabled
                  className="w-32"
                  error={errors.pincode}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <span className="font-bold">AND:</span>
          <div className="ml-4 mt-2">
            <p className="text-justify">
              <strong className="uppercase">Vakrangee Limited</strong>, a
              corporation organized and existing under ‘Companies Act, 1956’ and
              having its Head office located at:
            </p>
            <p className="mt-1 font-medium pl-4">
              <strong>
                Plot No. 93, Road No-16, M.I.D.C., Marol, Andheri (East),
                Mumbai: - 400093, Maharashtra.
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* Preamble */}
      <div className="text-justify space-y-4">
        <p>
          In consideration of employment by Company and disclosure by Company of
          confidential data and trade secret information, the undersigned
          Employee hereby covenants and agrees as follows:
        </p>
      </div>

      {/* Terms */}
      <div className="space-y-6 text-justify">
        <div>
          <h4 className="font-bold text-sm uppercase mb-2">
            1. Confidentiality:
          </h4>
          <p className="mb-3">
            Employee acknowledges that in the course of employee’s employment by
            company employee will be exposed to company’s confidential data/
            trade secret information or any other data which is crucial to
            company. Employee agrees to treat all such information or data
            confidential and to take all necessary precautions against
            disclosure of such information to unauthorized persons or any third
            party during and after terms of this agreement.
          </p>
          <p className="mb-2">
            Employee acknowledges that trade secret or any crucial information
            of company will consist but may not be limited to:
          </p>
          <ul className="pl-8 space-y-1">
            <li className="before:content-['a)'] before:mr-2">
              <strong>Technical Information:</strong> Methods, processes,
              formulae, composition, techniques, systems, computer programs,
              inventions, machines, research projects etc.
            </li>
            <li className="before:content-['b)'] before:mr-2">
              <strong>Business Information:</strong> Customer lists, pricing
              data, sources of supply, financial data, marketing or production.
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm uppercase mb-2">2. Use</h4>
          <p>
            Employee shall not use company’s confidential and trade secret
            information, except to the extent necessary to provide services or
            goods requested by company.
          </p>
        </div>
      </div>
    </FormLayout>
  );
};

export default FormNDA;
