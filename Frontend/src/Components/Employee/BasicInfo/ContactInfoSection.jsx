import React from "react";
import SearchableSelect from "../../UI/SearchableSelect";

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
        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Personal Email Address <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <>
              <input
                {...register("personal_email_id")}
                type="email"
                readOnly
                className={`w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none ${errors.personal_email_id ? "border-red-500" : "border-gray-200"}`}
              />
              {errors.personal_email_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.personal_email_id.message}
                </p>
              )}
            </>
          ) : (
            <p className="font-medium text-gray-800 py-2">
              {formData.personal_email_id || "-"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <>
              <input
                {...register("phone")}
                type="tel"
                readOnly={isLocked}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.phone ? "border-red-500" : "border-gray-200"} ${isLocked ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                maxLength={10}
                minLength={10}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </>
          ) : (
            <p className="font-medium text-gray-800 py-2">
              {formData.phone || "-"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <>
              <select
                {...register("gender")}
                disabled={isLocked}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 bg-white ${errors.gender ? "border-red-500" : "border-gray-200"} ${isLocked ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.gender.message}
                </p>
              )}
            </>
          ) : (
            <p className="font-medium text-gray-800 py-2">
              {formData.gender || "-"}
            </p>
          )}
        </div>

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

        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Emergency Contact Name <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <>
              <input
                {...register("emergency_contact_name")}
                readOnly={isLocked}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.emergency_contact_name ? "border-red-500" : "border-gray-200"} ${isLocked ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
              />
              {errors.emergency_contact_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.emergency_contact_name.message}
                </p>
              )}
            </>
          ) : (
            <p className="font-medium text-gray-800 py-2">
              {formData.emergency_contact_name || "-"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Emergency Contact Number <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <>
              <input
                {...register("emergency_contact_number")}
                type="tel"
                readOnly={isLocked}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.emergency_contact_number ? "border-red-500" : "border-gray-200"} ${isLocked ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                maxLength={10}
                minLength={10}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
              />
              {errors.emergency_contact_number && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.emergency_contact_number.message}
                </p>
              )}
            </>
          ) : (
            <p className="font-medium text-gray-800 py-2">
              {formData.emergency_contact_number || "-"}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ContactInfoSection;
