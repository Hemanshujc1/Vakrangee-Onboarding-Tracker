import React from "react";
import FormInputField from "../../UI/FormInputField";
import FormSelectField from "../../UI/FormSelectField";

const PersonalDetailsSection = ({
  register,
  errors,
  isEditing,
  formData,
  formatDate,
}) => {
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  const maxDate = eighteenYearsAgo.toISOString().split("T")[0];

  return (
    <>
      <div className="md:col-span-2 mt-4">
        <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2">
          Personal Details
        </h4>
      </div>
      
      <FormInputField
        label="Employee ID"
        name="employeeId"
        register={register}
        isEditing={isEditing}
        value={formData.employeeId || formData.id}
        disabled={true}
      />

      <FormInputField
        label="First Name"
        name="firstname"
        register={register}
        errors={errors}
        isEditing={isEditing}
        value={formData.firstname}
        disabled={true}
        required={true}
        placeholder="Rohit"
      />

      <FormInputField
        label="Last Name"
        name="lastname"
        register={register}
        errors={errors}
        isEditing={isEditing}
        value={formData.lastname}
        disabled={true}
        required={true}
        placeholder="Sharma"
      />

      <FormInputField
        label="Company Email Address"
        name="email"
        register={register}
        isEditing={isEditing}
        value={formData.email}
        type="email"
        disabled={true}
        placeholder="Not Assigned Yet"
      />

      <FormInputField
        label="Personal Email Address"
        name="personal_email_id"
        register={register}
        errors={errors}
        isEditing={isEditing}
        value={formData.personal_email_id}
        type="email"
        disabled={true}
        required={true}
        placeholder="john.doe@gmail.com"
      />

      <FormInputField
        label="Phone Number"
        name="phone"
        register={register}
        errors={errors}
        isEditing={isEditing}
        value={formData.phone}
        type="tel"
        required={true}
        placeholder="9876543210"
        maxLength={10}
        minLength={10}
        inputMode="numeric"
        onInput={(e) => {
          e.target.value = e.target.value.replace(/[^0-9]/g, "");
        }}
      />

      <FormInputField
        label="Date of Birth"
        name="date_of_birth"
        register={register}
        errors={errors}
        isEditing={isEditing}
        value={formatDate(formData.date_of_birth)}
        type="date"
        required={true}
        max={maxDate}
      />

      <FormSelectField
        label="Gender"
        name="gender"
        register={register}
        errors={errors}
        isEditing={isEditing}
        value={formData.gender}
        required={true}
        options={[
          { value: "Male", label: "Male" },
          { value: "Female", label: "Female" },
          { value: "Other", label: "Other" },
        ]}
        placeholder="Select Gender"
      />
    </>
  );
};

export default PersonalDetailsSection;
