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
          maxLength={18}
          pattern="^\\d{9,18}$"
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
        <FormInput
          label="IFSC Code"
          register={register}
          name="ifsc_code"
          className="uppercase"
          error={errors.ifsc_code}
          maxLength={11}
          pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
          }}
        />
        <FormInput
          label="AADHAR Number"
          register={register}
          name="aadhaar_no"
          error={errors.aadhaar_no}
          disabled
        />
        <FormInput
          label="PAN Number"
          register={register}
          name="pan_no"
          className="uppercase"
          error={errors.pan_no}
          disabled
        />
      </div>
    </FormSection>
  );
};

export default EPFKYCDetails;
