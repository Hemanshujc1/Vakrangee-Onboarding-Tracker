import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const AddressDetails = ({
  register,
  errors,
}) => {
  return (
    <FormSection title="Address Details">
      <div className="grid grid-cols-1 gap-4">
        <FormInput
          label="Current Address"
          register={register}
          name="currentAddress"
          error={errors.currentAddress}
          required
          disabled={true}
        />

        <FormInput
          label="Permanent Address"
          register={register}
          name="permanentAddress"
          error={errors.permanentAddress}
          required
          disabled={true}
        />
      </div>
    </FormSection>
  );
};

export default AddressDetails;
