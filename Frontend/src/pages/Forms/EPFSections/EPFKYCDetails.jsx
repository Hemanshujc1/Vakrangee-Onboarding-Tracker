import React from "react";
import FormInput from "../../../Components/Forms/FormInput";
import FormSection from "../../../Components/Forms/FormSection";

const EPFKYCDetails = ({ register, errors }) => {
  return (
    <FormSection title="4. KYC Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Bank Account No."
          register={register}
          name="bank_account_no"
          error={errors.bank_account_no}
        />
        <FormInput
          label="IFSC Code"
          register={register}
          name="ifsc_code"
          className="uppercase"
          error={errors.ifsc_code}
        />
        <FormInput
          label="AADHAR Number"
          register={register}
          name="aadhaar_no"
          error={errors.aadhaar_no}
        />
        <FormInput
          label="PAN Number"
          register={register}
          name="pan_no"
          className="uppercase"
          error={errors.pan_no}
        />
      </div>
    </FormSection>
  );
};

export default EPFKYCDetails;
