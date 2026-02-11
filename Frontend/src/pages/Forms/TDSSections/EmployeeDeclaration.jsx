import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";

const EmployeeDeclaration = ({ register, errors, watch }) => {
  return (
    <>
      <div className="p-4 bg-gray-50 rounded text-sm text-justify">
        <p className="mb-2">
          I declare that I will contribute to the above tax saving schemes
          during the F.Y. {watch("financial_year") || "2024-25"}. The same may
          be taken for my Income Tax computation for TDS purpose.
        </p>
      </div>

      <FormSection title="Employee Declaration">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Name"
            register={register}
            name="employee_name"
            disabled
            error={errors.employee_name}
          />
          <FormInput
            label="Designation"
            register={register}
            name="job_title"
            disabled
            error={errors.job_title}
          />
          <div className="md:col-span-2">
            <FormInput
              label="Residence Address"
              register={register}
              name="address_line1"
              disabled
              error={errors.address_line1}
            />
          </div>
          <FormInput
            label="PAN No."
            register={register}
            name="pan_no"
            disabled
            error={errors.pan_no}
          />
          <FormInput
            label="Contact No."
            register={register}
            name="contact_no"
            disabled
            error={errors.contact_no}
          />
        </div>
      </FormSection>
    </>
  );
};

export default EmployeeDeclaration;
