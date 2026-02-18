import React from "react";
import FormInput from "../../../Components/Forms/FormInput";
import FormSelect from "../../../Components/Forms/FormSelect";
import FormSection from "../../../Components/Forms/FormSection";

const EPFMemberDetails = ({
  register,
  errors,
  relationshipType,
  autoFillData,
}) => {
  return (
    <FormSection title="1. Member Details">
      <FormInput
        label="Name of Member (Aadhar Name)"
        register={register}
        name="member_name_aadhar"
        className="uppercase"
        error={errors.member_name_aadhar}
        disabled
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Date of Birth"
          type="date"
          register={register}
          name="dob"
          error={errors.dob}
          disabled
        />
        <FormSelect
          label="Gender"
          register={register}
          name="gender"
          options={["Male", "Female", "Transgender"]}
          error={errors.gender}
          disabled={!!autoFillData?.gender}
        />
        <FormSelect
          label="Marital Status"
          register={register}
          name="marital_status"
          options={["Single", "Married", "Widow", "Widower", "Divorcee"]}
          error={errors.marital_status}
          disabled={!!autoFillData?.maritalStatus}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col">
          <label className="text-xs font-bold uppercase text-gray-600 mb-2">
            Relationship
          </label>
          <div className="flex gap-4 mb-2">
            <label
              className={`flex items-center gap-2 cursor-pointer text-sm ${
                errors.relationship_type ? "text-red-600" : ""
              }`}
            >
              <input
                type="radio"
                value="Father"
                {...register("relationship_type")}
              />{" "}
              Father
            </label>
            <label
              className={`flex items-center gap-2 cursor-pointer text-sm ${
                errors.relationship_type ? "text-red-600" : ""
              }`}
            >
              <input
                type="radio"
                value="Spouse"
                {...register("relationship_type")}
              />{" "}
              Spouse
            </label>
          </div>
          {errors.relationship_type && (
            <p className="text-red-500 text-[10px] mt-1">
              {errors.relationship_type.message}
            </p>
          )}
          {relationshipType && (
            <FormInput
              label={
                relationshipType === "Father"
                  ? "Father's Name"
                  : "Spouse's Name"
              }
              register={register}
              name={
                relationshipType === "Father" ? "father_name" : "spouse_name"
              }
              className="uppercase"
              error={
                relationshipType === "Father"
                  ? errors.father_name
                  : errors.spouse_name
              }
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <FormInput
          label="Email ID"
          type="email"
          register={register}
          name="email"
          error={errors.email}
          disabled={!!autoFillData?.email}
        />
        <FormInput
          label="Mobile No (Aadhar Registered)"
          type="tel"
          register={register}
          name="mobile"
          error={errors.mobile}
          disabled={!!autoFillData?.mobileNo}
        />
      </div>
    </FormSection>
  );
};

export default EPFMemberDetails;
