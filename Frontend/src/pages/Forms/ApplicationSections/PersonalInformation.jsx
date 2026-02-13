import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import FormInput from "../../../Components/Forms/FormInput";
import FormSelect from "../../../Components/Forms/FormSelect";

const PersonalInformation = ({ register, errors, autoFillData }) => {
  return (
    <FormSection title="Personal Information">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          register={register}
          name="firstname"
          error={errors.firstname}
          required
          disabled={!!autoFillData?.firstname}
        />
        <FormInput
          label="Last Name"
          register={register}
          name="lastname"
          error={errors.lastname}
          required
          disabled={!!autoFillData?.lastname}
        />
        <FormInput
          label="Middle Name"
          register={register}
          name="middlename"
          error={errors.middlename}
        />
        <FormInput
          label="Maiden Name"
          register={register}
          name="Maidenname"
          error={errors.Maidenname}
        />
        <FormInput
          label="Mobile No"
          register={register}
          name="mobileNo"
          error={errors.mobileNo}
          required
          disabled={!!(autoFillData?.mobileNo || autoFillData?.phone)}
        />
        <FormInput
          label="Alternate No"
          register={register}
          name="alternateNo"
          error={errors.alternateNo}
          required
        />
        <FormInput
          label="Email ID"
          register={register}
          name="email"
          error={errors.email}
          required
          disabled={!!autoFillData?.email}
        />
        <FormInput
          label="Emergency No"
          register={register}
          name="emergencyNo"
          error={errors.emergencyNo}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormSelect
            label="Gender"
            register={register}
            name="gender"
            options={["Male", "Female", "Other"]}
            error={errors.gender}
            required
            disabled={!!autoFillData?.gender}
          />
          <FormInput label="Age" type="number" register={register} name="age" />
          <FormInput
            label="Date of Birth"
            type="date"
            register={register}
            name="dob"
            error={errors.dob}
            required
            disabled={!!(autoFillData?.dob || autoFillData?.dateOfBirth)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <FormInput
          label="Position Applied For"
          register={register}
          name="positionApplied"
          error={errors.positionApplied}
          disabled={
            !!(autoFillData?.positionApplied || autoFillData?.positionApplied)
          }
        />
        <FormSelect
          label="Currently Employed"
          register={register}
          name="currentlyEmployed"
          options={["Yes", "No"]}
        />
      </div>
    </FormSection>
  );
};

export default PersonalInformation;
