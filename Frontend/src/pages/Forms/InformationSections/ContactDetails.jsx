import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";
import FormSelect from "../../../Components/Forms/FormSelect";

const ContactDetails = ({ register, errors }) => {
  return (
    <FormSection title="Contact Details (Fill In Block Letters)">
      <div className="space-y-8">
        {/* Current Address */}
        <div className="gap-2">
          <h1 className="text-xl font-bold text-center mb-4">Current Address</h1>
          <FormSelect
            label="Residence Type"
            name="current_residence_type"
            options={[
              "Owned",
              "Parental",
              "Rental",
              "Hostel/ PG",
              "With Relative",
            ]}
            register={register}
            error={errors.current_residence_type}
            required
          />


          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Building Name"
              name="current_building_name"
              register={register}
              error={errors.current_building_name}
              required
            />
             <FormInput
            label="Landlord's Name"
            name="current_landlord_name"
            register={register}
            error={errors.current_landlord_name}
          />
            <FormInput
              label="Flat/House No"
              name="current_flat_house_no"
              register={register}
              error={errors.current_flat_house_no}
              required
            />
            
            <FormInput
              label="Block/Street No"
              name="current_block_street_no"
              register={register}
              error={errors.current_block_street_no}
              required
            />
            <FormInput
              label="Street Name"
              name="current_street_name"
              register={register}
              error={errors.current_street_name}
              required
            />
            <FormInput
              label="City"
              name="current_city"
              register={register}
              error={errors.current_city}
              required
            />
            <FormInput
              label="District"
              name="current_district"
              register={register}
              error={errors.current_district}
              required
            />
            <FormInput
              label="Post Office"
              name="current_post_office"
              register={register}
              error={errors.current_post_office}
              required
            />
            <FormInput
              label="State"
              name="current_state"
              register={register}
              error={errors.current_state}
              required
            />
            <FormInput
              label="Pin Code"
              name="current_pin_code"
              register={register}
              error={errors.current_pin_code}
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded border border-gray-200 my-4">
          <input
            type="checkbox"
            id="sameAddress"
            {...register("sameAddress")}
            className="w-5 h-5 accent-blue-600 cursor-pointer"
          />
          <label
            htmlFor="sameAddress"
            className="text-sm font-bold text-gray-700 cursor-pointer select-none"
          >
            Permanent Address is same as Current Address
          </label>
        </div>

        {/* Permanent Address */}
        <div className="gap-2">
          <h1 className="text-xl font-bold text-center mb-4">
            Permanent Address
          </h1>
          <FormSelect
            label="Residence Type"
            name="permanent_residence_type"
            options={[
              "Owned",
              "Parental",
              "Rental",
              "Hostel/ PG",
              "With Relative",
            ]}
            register={register}
            error={errors.permanent_residence_type}
            required
          />

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Building Name"
              name="permanent_building_name"
              register={register}
              error={errors.permanent_building_name}
              required
            />

            <FormInput
              label="Flat/House No"
              name="permanent_flat_house_no"
              register={register}
              error={errors.permanent_flat_house_no}
              required
            />
            <FormInput
              label="Block/Street No"
              name="permanent_block_street_no"
              register={register}
              error={errors.permanent_block_street_no}
              required
            />
            <FormInput
              label="Street Name"
              name="permanent_street_name"
              register={register}
              error={errors.permanent_street_name}
              required
            />
            <FormInput
              label="City"
              name="permanent_city"
              register={register}
              error={errors.permanent_city}
              required
            />
            <FormInput
              label="District"
              name="permanent_district"
              register={register}
              error={errors.permanent_district}
              required
            />
            <FormInput
              label="Post Office"
              name="permanent_post_office"
              register={register}
              error={errors.permanent_post_office}
              required
            />
            <FormInput
              label="State"
              name="permanent_state"
              register={register}
              error={errors.permanent_state}
              required
            />
            <FormInput
              label="Pin Code"
              name="permanent_pin_code"
              register={register}
              error={errors.permanent_pin_code}
              required
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default ContactDetails;
