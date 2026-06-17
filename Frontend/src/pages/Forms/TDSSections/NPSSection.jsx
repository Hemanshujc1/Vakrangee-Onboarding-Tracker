import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const NPSSection = ({ register, errors }) => {
  return (
    <FormSection title="3. Contribution to National Pension Scheme (NPS)">
      <FormInput
        label="Amount"
        register={register}
        name="nps_contribution"
        className="max-w-xs"
        error={errors.nps_contribution}
        maxLength={8}
        onInput={(e) => {
          e.target.value = e.target.value.replace(/[^0-9]/g, "");
        }}
      />
    </FormSection>
  );
};

export default NPSSection;
