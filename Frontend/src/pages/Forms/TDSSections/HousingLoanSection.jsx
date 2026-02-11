import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const HousingLoanSection = ({ register, errors }) => {
  return (
    <FormSection title="2. Housing Loan">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Principal Amount Payable"
          type="number"
          register={register}
          name="housing_loan_principal"
          error={errors.housing_loan_principal}
          min={0}
          max={9999999999}
        />
        <FormInput
          label="Interest Amount Payable"
          type="number"
          register={register}
          name="housing_loan_interest"
          error={errors.housing_loan_interest}
          min={0}
          max={9999999999}
        />
      </div>
    </FormSection>
  );
};

export default HousingLoanSection;
