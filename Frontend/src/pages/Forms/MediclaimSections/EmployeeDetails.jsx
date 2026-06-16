import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";
import FormSelect from "../../../Components/Forms/FormSelect";

const EmployeeDetails = ({ register, errors, autoFillData }) => {
  return (
    <FormSection title="Employee Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Full Name"
          register={register}
          name="employee_full_name"
          error={errors.employee_full_name}
          disabled={!!autoFillData?.fullName}
          required={true}
        />

        <div className="hidden">
          <input {...register("employee_code")} type="hidden" />
        </div>

        <FormInput
          label="Date of Birth"
          type="date"
          register={register}
          name="date_of_birth"
          error={errors.date_of_birth}
          disabled={!!autoFillData?.dateOfBirth}
          required={true}
        />

        <FormSelect
          label="Gender"
          register={register}
          name="gender"
          options={["Male", "Female", "Other"]}
          error={errors.gender}
          disabled={!!autoFillData?.gender}
          required={true}
        />

        <FormSelect
          label="Marital Status"
          register={register}
          name="marital_status"
          options={["Married", "Unmarried"]}
          error={errors.marital_status}
          required={true}
        />

        <FormInput
          label="Mobile No"
          register={register}
          name="mobile_number"
          error={errors.mobile_number}
          disabled={!!autoFillData?.phone}
          required={true}
        />
      </div>
    </FormSection>
  );
};

export default EmployeeDetails;
