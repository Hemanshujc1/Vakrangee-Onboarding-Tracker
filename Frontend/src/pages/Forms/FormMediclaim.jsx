import React from "react";
import { FormLayout, onValidationFail } from "../../utils/formDependencies";
import FormInput from "../../Components/Forms/FormInput";
import FormSelect from "../../Components/Forms/FormSelect";
import FormSection from "../../Components/Forms/FormSection";
import {
  InstructionBlock,
  DynamicTable,
  TableInput,
  AddButton,
} from "../../Components/Forms/Shared";
import useFormMediclaim from "./useFormMediclaim";

const FormMediclaim = () => {
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
    fields,
    append,
    remove,
  } = useFormMediclaim();


  if (loading) return <div>Loading Form Data...</div>;
  const maritalStatus = watch("marital_status");

  return (
    <FormLayout
      title="Mediclaim Information Form"
      employeeData={{
        ...autoFillData,
        signature:
          autoFillData?.mediclaimData?.signature_path ||
          autoFillData?.signature,
      }}
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
      {/* Content */}

      <InstructionBlock />
      {/* 1. Employee Details Section */}
      <FormSection title="Employee Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Full Name"
            register={register}
            name="employee_full_name"
            error={errors.employee_full_name}
            disabled={!!autoFillData?.fullName}
            required={true}
          />

          <div className="hidden">
            <input {...register("employee_code")} type="hidden" />
          </div>

          <FormInput
            label="Date of Birth"
            type="date"
            register={register}
            name="date_of_birth"
            error={errors.date_of_birth}
            disabled={!!autoFillData?.dateOfBirth}
            required={true}
          />

          <FormSelect
            label="Gender"
            register={register}
            name="gender"
            options={["Male", "Female", "Other"]}
            error={errors.gender}
            disabled={!!autoFillData?.gender}
            required={true}
          />

          <FormSelect
            label="Marital Status"
            register={register}
            name="marital_status"
            options={["Married", "Unmarried"]}
            error={errors.marital_status}
            required={true}
          />

          <FormInput
            label="Mobile No"
            register={register}
            name="mobile_number"
            error={errors.mobile_number}
            disabled={!!autoFillData?.phone}
            required={true}
          />
        </div>
      </FormSection>

      {/* 2. Address Section */}
      <FormSection title="Address">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormInput
              label="Address Line 1"
              register={register}
              name="address_line1"
              error={errors.address_line1}
              required={true}
            />
          </div>
          <div className="md:col-span-2">
            <FormInput
              label="Address Line 2"
              register={register}
              name="address_line2"
              required={true}
              error={errors.address_line2}
            />
          </div>
          <FormInput
            label="Landmark"
            register={register}
            name="landmark"
            error={errors.landmark}
          />
          <FormInput
            label="Post Office"
            register={register}
            name="post_office"
            error={errors.post_office}
            required={true}
          />
          <FormInput
            label="City"
            register={register}
            name="city"
            error={errors.city}
            required={true}
          />
          <FormInput
            label="District"
            register={register}
            name="district"
            error={errors.district}
          />
          <FormInput
            label="State"
            register={register}
            name="state"
            error={errors.state}
            required={true}
          />
          <FormInput
            label="Pincode"
            register={register}
            name="pincode"
            error={errors.pincode}
            required={true}
          />
        </div>
      </FormSection>

      {/* 3. Family Details Section (Dynamic) - Only if Married */}
      {maritalStatus === "Married" && (
        <FormSection title="Family Details / Dependents" isRequired="true">
          <DynamicTable
            headers={["Relationship", "Name", "Age", "DOB"]}
            fields={fields}
            onRemove={remove}
            renderRow={(item, index) => (
              <>
                <td className="border border-gray-300 p-1 align-top">
                  <select
                    {...register(`dependents.${index}.relationship`)}
                    className="w-full outline-none p-1 bg-transparent"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    {/* <option value="Mother">Mother</option>
                                <option value="Father">Father</option> */}
                  </select>
                  {errors.dependents?.[index]?.relationship && (
                    <span className="text-red-500 text-xs block px-1">
                      {errors.dependents[index].relationship.message}
                    </span>
                  )}
                </td>
                <TableInput
                  register={register(`dependents.${index}.name`)}
                  error={errors.dependents?.[index]?.name}
                  placeholder="Name"
                  required
                />
                <TableInput
                  type="number"
                  register={register(`dependents.${index}.age`)}
                  error={errors.dependents?.[index]?.age}
                  placeholder="Age"
                  required
                />
                <TableInput
                  type="date"
                  register={register(`dependents.${index}.dob`)}
                  error={errors.dependents?.[index]?.dob}
                  required
                />
              </>
            )}
          />

          <div className="mt-2 flex justify-end">
            <AddButton
              onClick={() =>
                append({ relationship: "Spouse", name: "", age: "", dob: "" })
              }
              label="Add Dependent"
            />
          </div>
        </FormSection>
      )}
    </FormLayout>
  );
};

export default FormMediclaim;
