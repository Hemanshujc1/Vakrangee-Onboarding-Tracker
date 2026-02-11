import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const OtherInvestmentsSection = ({ register, errors }) => {
  return (
    <FormSection title="Other Investments">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Life Insurance Premium"
          type="number"
          register={register}
          name="life_insurance_premium"
          error={errors.life_insurance_premium}
          min={0}
          max={9999999999}
        />
        <FormInput
          label="Contribution to PPF"
          type="number"
          register={register}
          name="ppf_contribution"
          error={errors.ppf_contribution}
          min={0}
          max={9999999999}
        />
        <FormInput
          label="Contribution to SSY"
          type="number"
          register={register}
          name="ssy_contribution"
          error={errors.ssy_contribution}
          min={0}
          max={9999999999}
        />
        <FormInput
          label="Subscription to N.S.C."
          type="number"
          register={register}
          name="nsc_subscription"
          error={errors.nsc_subscription}
          min={0}
          max={9999999999}
        />
        <FormInput
          label="Subscription to ULIP"
          type="number"
          register={register}
          name="united_link_subsciption"
          error={errors.united_link_subsciption}
          min={0}
          max={9999999999}
        />
        <FormInput
          label="IDBI / ICICI Bonds"
          type="number"
          register={register}
          name="banks_bonds"
          error={errors.banks_bonds}
          min={0}
          max={9999999999}
        />
        <FormInput
          label="Fixed Deposit (> 5 Years)"
          type="number"
          register={register}
          name="fd_bank"
          error={errors.fd_bank}
          min={0}
          max={9999999999}
        />
        <FormInput
          label="Tuition Fees (Children)"
          type="number"
          register={register}
          name="children_tuition_fees"
          error={errors.children_tuition_fees}
          min={0}
          max={9999999999}
        />
        <FormInput
          label="Mutual Fund ELSS"
          type="number"
          register={register}
          name="mf_investment"
          error={errors.mf_investment}
          min={0}
          max={9999999999}
        />
      </div>
      <div className="mt-6 border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Any other allowable investment
        </label>
        <div className="flex gap-4">
          <div className="grow">
            <FormInput
              register={register}
              name="other_investment_details"
              placeholder="Mention Details"
              error={errors.other_investment_details}
            />
          </div>
          <div className="w-32">
            <FormInput
              type="number"
              register={register}
              name="other_investment_amt"
              placeholder="Amount"
              error={errors.other_investment_amt}
              min={0}
              max={9999999999}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default OtherInvestmentsSection;
