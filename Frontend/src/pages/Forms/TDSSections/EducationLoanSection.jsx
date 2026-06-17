import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const EducationLoanSection = ({ register, errors }) => {
  return (
    <FormSection title="1. Education Loan">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Education Loan Amount"
          register={register}
          name="education_loan_amt"
          error={errors.education_loan_amt}
          maxLength={8}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
        <FormInput
          label="Start Year (Loan Taken)"
          placeholder="YYYY"
          register={register}
          name="education_loan_start_year"
          error={errors.education_loan_start_year}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
          maxLength={4}
        />
        <FormInput
          label="Interest Payable (Apr-Mar)"
          register={register}
          name="education_interest"
          error={errors.education_interest}
          maxLength={8}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
      </div>
    </FormSection>
  );
};

export default EducationLoanSection;
