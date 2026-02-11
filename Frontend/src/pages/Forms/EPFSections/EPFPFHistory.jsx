import React from "react";
import FormInput from "../../../Components/Forms/FormInput";
import FormSelect from "../../../Components/Forms/FormSelect";
import FormSection from "../../../Components/Forms/FormSection";

const EPFPFHistory = ({ register, errors }) => {
  return (
    <FormSection title="5. PF History (If applicable)">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormInput
          label="First EPF Member Enrolled Date"
          type="date"
          register={register}
          name="first_epf_enrolled_date"
          error={errors.first_epf_enrolled_date}
        />
        <FormInput
          label="First Employment EPF Wages"
          type="number"
          register={register}
          name="first_epf_wages"
          error={errors.first_epf_wages}
        />
        <FormSelect
          label="Member before Sep 2014?"
          register={register}
          name="pre_2014_member"
          options={["Yes", "No"]}
          error={errors.pre_2014_member}
        />
        <FormSelect
          label="EPF Withdrawn?"
          register={register}
          name="withdrawn_epf"
          options={["Yes", "No"]}
          error={errors.withdrawn_epf}
        />
        <FormSelect
          label="EPS Withdrawn?"
          register={register}
          name="withdrawn_eps"
          options={["Yes", "No"]}
          error={errors.withdrawn_eps}
        />
        <FormSelect
          label="Post 2014 EPS Withdrawn?"
          register={register}
          name="post_2014_eps_withdrawn"
          options={["Yes", "No"]}
          error={errors.post_2014_eps_withdrawn}
        />
      </div>
    </FormSection>
  );
};

export default EPFPFHistory;
