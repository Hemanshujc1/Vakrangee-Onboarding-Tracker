import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const EducationLoanSection = ({ register, errors }) => {
  return (
    <FormSection title="1. Education Loan">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Education Loan Amount"
          type="number"
          register={register}
          name="education_loan_amt"
          error={errors.education_loan_amt}
          min={0}
          max={9999999999}
        />
        <FormInput
          label="Start Year (Loan Taken)"
          placeholder="YYYY"
          register={register}
          name="education_loan_start_year"
          error={errors.education_loan_start_year}
        />
        <FormInput
          label="Interest Payable (Apr-Mar)"
          type="number"
          register={register}
          name="education_interest"
          error={errors.education_interest}
          min={0}
          max={9999999999}
        />
      </div>
    </FormSection>
  );
};

export default EducationLoanSection;
