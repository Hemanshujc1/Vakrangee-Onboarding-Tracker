import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const MedicalInsuranceSection = ({ register, errors }) => {
  return (
    <FormSection title="5. Medical Insurance Premium">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Contribution to Medical Insurance Premium"
          register={register}
          name="medical_total_contribution"
          error={errors.medical_total_contribution}
          maxLength={8}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
        <FormInput
          label="For Self & Family"
          register={register}
          name="medical_self_family"
          error={errors.medical_self_family}
          maxLength={8}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
        <FormInput
          label="For Parents"
          register={register}
          name="medical_parents"
          error={errors.medical_parents}
          maxLength={8}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
        <FormInput
          label="For Senior Citizen Parents"
          register={register}
          name="medical_senior_parents"
          error={errors.medical_senior_parents}
          maxLength={8}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
      </div>
    </FormSection>
  );
};

export default MedicalInsuranceSection;
