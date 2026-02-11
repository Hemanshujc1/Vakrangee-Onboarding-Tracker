import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const NPSSection = ({ register, errors }) => {
  return (
    <FormSection title="3. Contribution to National Pension Scheme (NPS)">
      <FormInput
        label="Amount"
        type="number"
        register={register}
        name="nps_contribution"
        className="max-w-xs"
        error={errors.nps_contribution}
        min={0}
        max={9999999999}
      />
    </FormSection>
  );
};

export default NPSSection;
