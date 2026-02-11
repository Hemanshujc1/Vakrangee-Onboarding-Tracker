import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const HRASection = ({ register, errors, watchRelatedLandlord }) => {
  return (
    <FormSection title="4. House Rent Allowance (HRA)">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Rent Per Month (Rs.)"
          type="number"
          register={register}
          name="hra_rent_per_month"
          error={errors.hra_rent_per_month}
          min={0}
          max={9999999999}
        />
        <FormInput
          label="No. of Months"
          type="number"
          register={register}
          name="hra_months"
          error={errors.hra_months}
          min={0}
          max={9999999999}
        />
      </div>
      <div className="mt-4 border-t pt-4">
        <div className="flex gap-6 items-center flex-wrap">
          <span className="text-sm font-medium text-gray-700">
            Related to Landlord?
          </span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="yes"
              {...register("hra_is_related_landlord")}
            />{" "}
            <span>Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="no"
              {...register("hra_is_related_landlord")}
            />{" "}
            <span>No</span>
          </label>
        </div>
        {watchRelatedLandlord === "yes" && (
          <div className="mt-4">
            <FormInput
              label="Relationship with Landlord"
              register={register}
              name="hra_landlord_relationship"
              placeholder="e.g. Father/Mother"
              error={errors.hra_landlord_relationship}
            />
            <p className="text-xs text-red-500 mt-1">
              In case of Parents, Registered Agreement is compulsory.
            </p>
          </div>
        )}
      </div>
    </FormSection>
  );
};

export default HRASection;
