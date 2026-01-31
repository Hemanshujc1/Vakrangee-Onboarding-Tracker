import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";
import FormSelect from "../../../Components/Forms/FormSelect";

const PersonalDetails = ({ register, errors, autoFillData }) => {
  return (
    <FormSection title="Personal Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          name="first_name"
          register={register}
          error={errors.first_name}
          required
          disabled
        />
        <FormInput
          label="Middle Name"
          name="middle_name"
          register={register}
          error={errors.middle_name}
        />
        <FormInput
          label="Last Name"
          name="last_name"
          register={register}
          error={errors.last_name}
          required
          disabled
        />

        <FormInput
          label="Father's First Name"
          name="father_name"
          register={register}
          error={errors.father_name}
        />
        <FormInput
          label="Father's Middle Name"
          name="father_middle_name"
          register={register}
          error={errors.father_middle_name}
        />
        <FormInput
          label="Father's Last Name"
          name="father_last_name"
          register={register}
          error={errors.father_last_name}
        />

        <FormInput
          label="Date of Birth"
          name="date_of_birth"
          type="date"
          register={register}
          error={errors.date_of_birth}
          required
          disabled
        />
        <FormInput
          label="Birth City"
          name="birth_city"
          register={register}
          error={errors.birth_city}
          required
        />
        <FormInput
          label="Birth State"
          name="birth_state"
          register={register}
          error={errors.birth_state}
          required
        />
        <FormInput
          label="Country"
          name="country"
          register={register}
          error={errors.country}
          required
        />

        <FormSelect
          label="Blood Group"
          name="blood_group"
          options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
          register={register}
          error={errors.blood_group}
          required
        />
        <FormSelect
          label="Gender"
          name="gender"
          options={["Male", "Female", "Other"]}
          register={register}
          error={errors.gender}
          required
          disabled
        />
        <FormSelect
          label="Marital Status"
          name="marital_status"
          options={["Married", "Unmarried"]}
          register={register}
          error={errors.marital_status}
          required
        />

        <FormInput
          label="Passport Number"
          name="passport_number"
          register={register}
          error={errors.passport_number}
          disabled
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Passport Issue Date"
            name="passport_date_of_issue"
            type="date"
            register={register}
            error={errors.passport_date_of_issue}
            disabled
          />
          <FormInput
            label="Passport Expiry Date"
            name="passport_expiry_date"
            type="date"
            register={register}
            error={errors.passport_expiry_date}
            disabled
          />
        </div>
        <FormInput
          label="PAN Number"
          name="pan_number"
          register={register}
          error={errors.pan_number}
          required
          disabled
        />
        <FormInput
          label="Aadhar Number"
          name="aadhar_number"
          register={register}
          error={errors.aadhar_number}
          required
          disabled
        />

        <FormInput
          label="STD Code"
          name="std_code"
          register={register}
          error={errors.std_code}
        />
        <FormInput
          label="Alternate No"
          name="alternate_no"
          register={register}
          error={errors.alternate_no}
          required
          disabled
        />
        <FormInput
          label="Mobile No"
          name="mobile_no"
          register={register}
          error={errors.mobile_no}
          required
        />
        <FormInput
          label="Emergency No"
          name="emergency_no"
          register={register}
          error={errors.emergency_no}
          required
          disabled
        />
        <FormInput
          label="Email ID"
          name="personal_email"
          type="email"
          register={register}
          error={errors.personal_email}
          required
          disabled
        />
      </div>
    </FormSection>
  );
};

export default PersonalDetails;
      
