import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const HousingLoanSection = ({ register, errors }) => {
  return (
    <FormSection title="2. Housing Loan">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Principal Amount Payable"
          register={register}
          name="housing_loan_principal"
          error={errors.housing_loan_principal}
          maxLength={8}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
        <FormInput
          label="Interest Amount Payable"
          register={register}
          name="housing_loan_interest"
          error={errors.housing_loan_interest}
          maxLength={8}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
      </div>
    </FormSection>
  );
};

export default HousingLoanSection;
