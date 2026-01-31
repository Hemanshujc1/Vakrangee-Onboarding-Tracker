import React, { useEffect } from "react";
import FormSection from "../FormSection";
import FormInput from "../FormInput";
import FormSelect from "../FormSelect";

const DocumentFields = ({ register, errors, watch, setValue, autoFillData }) => {
  const hasPan = watch("hasPan");
  const hasLicense = watch("hasLicense");
  const hasPassport = watch("hasPassport");

  return (
    <FormSection title="Documents">
      
      {/* PAN Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FormSelect
          label="Do you have a PAN Card?"
          register={register}
          name="hasPan"
          options={["Yes", "No"]}
          error={errors.hasPan}
          required
        />
        {hasPan === "Yes" && (
            <FormInput
                label="PAN Card No"
                register={register}
                name="panNo"
                error={errors.panNo}
                required
                disabled={!!autoFillData?.panNo}
            />
        )}
      </div>

      {/* Driving License */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 border-t pt-4">
        <FormSelect
          label="Do you have a Driving License?"
          register={register}
          name="hasLicense"
          options={["Yes", "No"]}
          error={errors.hasLicense}
          required
        />
        </div>
        {hasLicense === "Yes" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormInput
                    label="License No"
                    register={register}
                    name="licenseNo"
                    error={errors.licenseNo}
                    required
                />
                <FormInput
                    label="Issue Date"
                    type="date"
                    register={register}
                    name="licenseIssueDate"
                    error={errors.licenseIssueDate}
                    required
                />
                <FormInput
                    label="Expiry Date"
                    type="date"
                    register={register}
                    name="licenseExpiryDate"
                    error={errors.licenseExpiryDate}
                    required
                />
            </div>
        )}

      {/* Passport */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 border-t pt-4">
        <FormSelect
          label="Do you have a Passport?"
          register={register}
          name="hasPassport"
          options={["Yes", "No"]}
          error={errors.hasPassport}
          required
        />
      </div>
       {hasPassport === "Yes" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormInput
                    label="Passport No"
                    register={register}
                    name="passportNo"
                    error={errors.passportNo}
                    required
                />
                <FormInput
                    label="Issue Date"
                    type="date"
                    register={register}
                    name="passportIssueDate"
                    error={errors.passportIssueDate}
                    required
                />
                <FormInput
                    label="Expiry Date"
                    type="date"
                    register={register}
                    name="passportExpiryDate"
                    error={errors.passportExpiryDate}
                    required
                />
            </div>
        )}
    </FormSection>
  );
};

export default DocumentFields;
