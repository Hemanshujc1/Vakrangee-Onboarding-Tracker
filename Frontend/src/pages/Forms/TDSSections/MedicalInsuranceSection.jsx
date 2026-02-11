import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const MedicalInsuranceSection = ({ register, errors }) => {
  return (
    <FormSection title="5. Medical Insurance Premium">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Contribution to Medical Insurance Premium"
          type="number"
          register={register}
          name="medical_total_contribution"
          error={errors.medical_total_contribution}
          min={0}
          max={9999999999}
        />
        <FormInput
          label="For Self & Family"
          type="number"
          register={register}
          name="medical_self_family"
          error={errors.medical_self_family}
          min={0}
          max={9999999999}
        />
        <FormInput
          label="For Parents"
          type="number"
          register={register}
          name="medical_parents"
          error={errors.medical_parents}
          min={0}
          max={9999999999}
        />
        <FormInput
          label="For Senior Citizen Parents"
          type="number"
          register={register}
          name="medical_senior_parents"
          error={errors.medical_senior_parents}
          min={0}
          max={9999999999}
        />
      </div>
    </FormSection>
  );
};

export default MedicalInsuranceSection;
