import React from "react";
import FormInput from "../../../Components/Forms/FormInput";

const EmployeeParty = ({ register, errors }) => {
  return (
    <div className="space-y-4">
      <div>
        <span className="font-bold">BETWEEN:</span>
        <div className="mt-2 ml-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 items-end">
            <label className="md:col-span-2 font-semibold">
              Employee Name:
            </label>
            <div className="md:col-span-10">
              <FormInput
                register={register}
                name="employee_full_name"
                className="font-bold uppercase"
                disabled
                error={errors.employee_full_name}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="ml-4 space-y-2 mt-4">
        <p className="font-semibold">Residing at:</p>
        <div className="grid grid-cols-1 gap-2">
          <FormInput
            register={register}
            label="Address Line 1"
            name="address_line1"
            placeholder="Address Line 1"
            disabled
            error={errors.address_line1}
            required
          />
          <FormInput
            register={register}
            label="Address Line 2"
            name="address_line2"
            placeholder="Address Line 2"
            disabled
            error={errors.address_line2}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              register={register}
              label="landmark"
              name="landmark"
              placeholder="Landmark"
              disabled
              error={errors.landmark}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              register={register}
              label="Post Office"
              name="post_office"
              placeholder="Post Office"
              disabled
              error={errors.post_office}
              required
            />
            <FormInput
              register={register}
              label="District"
              name="district"
              placeholder="District"
              disabled
              error={errors.district}
              required
            />
          </div>
          <div className="flex gap-4">
            <FormInput
              register={register}
              label="City"
              name="city"
              disabled
              error={errors.city}
              required
            />
            <FormInput
              register={register}
              label="State"
              name="state"
              disabled
              error={errors.state}
              required
            />
            <FormInput
              register={register}
              label="Pincode"
              name="pincode"
              disabled
              className="w-32"
              error={errors.pincode}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeParty;
