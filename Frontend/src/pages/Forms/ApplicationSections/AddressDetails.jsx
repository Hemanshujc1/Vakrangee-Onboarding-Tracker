import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const AddressDetails = ({ register, errors, autoFillData, setValue, watch }) => {
  const currentAddressValue = watch("currentAddress");

  const copyAddress = (e) => {
    if (e.target.checked) {
      setValue("permanentAddress", currentAddressValue);
    } else {
      setValue("permanentAddress", "");
    }
  };

  return (
    <FormSection title="Address Details">
       <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <FormInput
            label="Current Address"
            register={register}
            name="currentAddress"
            error={errors.currentAddress}
            required
            disabled={!!autoFillData?.currentAddress}
        />

        <div>
            <div className="flex items-center gap-2 mt-2 mb-2">
                <input
                type="checkbox"
                id="sameAddress"
                onChange={copyAddress}
                className="w-4 h-4"
                />
                <label
                htmlFor="sameAddress"
                className="text-xs font-bold uppercase text-gray-600"
                >
                Same as current address
                </label>
            </div>

            <FormInput
                label="Permanent Address"
                register={register}
                name="permanentAddress"
                error={errors.permanentAddress}
                required
            />
        </div>
      </div>
    </FormSection>
  );
};

export default AddressDetails;
