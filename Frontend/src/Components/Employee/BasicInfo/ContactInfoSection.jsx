import React from "react";
import SearchableSelect from "../../UI/SearchableSelect";
import FormInputField from "../../UI/FormInputField";
import FormSelectField from "../../UI/FormSelectField";

const ContactInfoSection = ({
  register,
  errors,
  isEditing,
  formData,
  isLocked,
  setValue,
}) => {
  return (
    <>
      <div className="mt-6">
        <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
          Contact Information
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 md:col-span-2">
        <FormInputField
          label="Personal Email Address"
          name="personal_email_id"
          register={register}
          errors={errors}
          isEditing={isEditing}
          value={formData.personal_email_id}
          type="email"
          readOnly={true}
          required={true}
        />

        <FormInputField
          label="Phone Number"
          name="phone"
          register={register}
          errors={errors}
          isEditing={isEditing}
          value={formData.phone}
          type="tel"
          readOnly={isLocked}
          required={true}
          maxLength={10}
          minLength={10}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />

        <FormSelectField
          label="Gender"
          name="gender"
          register={register}
          errors={errors}
          isEditing={isEditing}
          value={formData.gender}
          disabled={isLocked}
          required={true}
          options={[
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Other", label: "Other" },
          ]}
          placeholder="Select Gender"
        />

        <div>
          {isEditing ? (
            <div>
              <SearchableSelect
                label="Emergency Contact Relationship"
                name="emergency_contact_relationship"
                value={formData.emergency_contact_relationship || ""}
                onChange={(e) => {
                  if (setValue) {
                    setValue("emergency_contact_relationship", e.target.value, { shouldValidate: true, shouldDirty: true });
                  }
                }}
                options={[
                  { id: "Father", name: "Father" },
                  { id: "Mother", name: "Mother" },
                  { id: "Spouse", name: "Spouse" },
                  { id: "Brother", name: "Brother" },
                  { id: "Sister", name: "Sister" },
                  { id: "Son", name: "Son" },
                  { id: "Daughter", name: "Daughter" },
                  { id: "Guardian", name: "Guardian" },
                  { id: "Friend", name: "Friend" },
                ]}
                disabled={isLocked}
                required={true}
                allowCustom={true}
                showSearch={false}
                placeholder="Select or type..."
              />
              {errors.emergency_contact_relationship && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.emergency_contact_relationship.message}
                </p>
              )}
            </div>
          ) : (
            <>
              <label className="block text-sm text-gray-500 mb-1">
                Emergency Contact Relationship
              </label>
              <p className="font-medium text-gray-800 py-2">
                {formData.emergency_contact_relationship || "-"}
              </p>
            </>
          )}
        </div>

        <FormInputField
          label="Emergency Contact Name"
          name="emergency_contact_name"
          register={register}
          errors={errors}
          isEditing={isEditing}
          value={formData.emergency_contact_name}
          readOnly={isLocked}
          required={true}
        />

        <FormInputField
          label="Emergency Contact Number"
          name="emergency_contact_number"
          register={register}
          errors={errors}
          isEditing={isEditing}
          value={formData.emergency_contact_number}
          type="tel"
          readOnly={isLocked}
          required={true}
          maxLength={10}
          minLength={10}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
      </div>
    </>
  );
};

export default ContactInfoSection;
