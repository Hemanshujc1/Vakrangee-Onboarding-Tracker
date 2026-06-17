import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const OtherInvestmentsSection = ({ register, errors }) => {
  return (
    <FormSection title="Other Investments">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Life Insurance Premium"
          register={register}
          name="life_insurance_premium"
          error={errors.life_insurance_premium}
          maxLength={9}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
        <FormInput
          label="Contribution to PPF"
          register={register}
          name="ppf_contribution"
          error={errors.ppf_contribution}
          maxLength={9}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
        <FormInput
          label="Contribution to SSY"
          register={register}
          name="ssy_contribution"
          error={errors.ssy_contribution}
          maxLength={9}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
        <FormInput
          label="Subscription to N.S.C."
          register={register}
          name="nsc_subscription"
          error={errors.nsc_subscription}
          maxLength={9}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
        <FormInput
          label="Subscription to ULIP"
          register={register}
          name="united_link_subsciption"
          error={errors.united_link_subsciption}
          maxLength={9}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
        <FormInput
          label="IDBI / ICICI Bonds"
          register={register}
          name="banks_bonds"
          error={errors.banks_bonds}
          maxLength={9}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
        <FormInput
          label="Fixed Deposit (> 5 Years)"
          register={register}
          name="fd_bank"
          error={errors.fd_bank}
          maxLength={9}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
        <FormInput
          label="Tuition Fees (Children)"
          register={register}
          name="children_tuition_fees"
          error={errors.children_tuition_fees}
          maxLength={9}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
        <FormInput
          label="Mutual Fund ELSS"
          register={register}
          name="mf_investment"
          error={errors.mf_investment}
          maxLength={9}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
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
              maxLength={20}
            />
          </div>
          <div className="w-32">
            <FormInput
              register={register}
              name="other_investment_amt"
              placeholder="Amount"
              error={errors.other_investment_amt}
              maxLength={9}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default OtherInvestmentsSection;
