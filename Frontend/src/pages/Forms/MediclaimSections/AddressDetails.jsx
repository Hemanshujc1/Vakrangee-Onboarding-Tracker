import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const AddressDetails = ({ register, errors }) => {
  return (
    <FormSection title="Address">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <FormInput
            label="Address Line 1"
            register={register}
            name="address_line1"
            error={errors.address_line1}
            required={true}
            disabled={true}
          />
        </div>
        <div className="md:col-span-2">
          <FormInput
            label="Address Line 2"
            register={register}
            name="address_line2"
            required={true}
            error={errors.address_line2}
            disabled={true}
          />
        </div>
        <FormInput
          label="Landmark"
          register={register}
          name="landmark"
          error={errors.landmark}
          disabled={true}
        />
        <FormInput
          label="Post Office"
          register={register}
          name="post_office"
          error={errors.post_office}
          required={true}
          disabled={true}
        />
        <FormInput
          label="City"
          register={register}
          name="city"
          error={errors.city}
          required={true}
          disabled={true}
        />
        <FormInput
          label="District"
          register={register}
          name="district"
          error={errors.district}
          disabled={true}
        />
        <FormInput
          label="State"
          register={register}
          name="state"
          error={errors.state}
          required={true}
          disabled={true}
        />
        <FormInput
          label="Pincode"
          register={register}
          name="pincode"
          error={errors.pincode}
          required={true}
          maxLength={6}
          minLength={6}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
          disabled={true}
        />
      </div>
    </FormSection>
  );
};

export default AddressDetails;
