import React from "react";
import DocumentUploadItem from "./DocumentUploadItem";
import { DOC_CONFIG_MAP } from "../../../config/documentConfig";
import FormInputField from "../../UI/FormInputField";
import FormSelectField from "../../UI/FormSelectField";

const ProfileIdentitySection = ({
  register,
  errors,
  isEditing,
  formData,
  formatDate,
  getDocStatus,
  uploadingState,
  handleUpload,
  handleDelete,
  panVerifying,
  panVerified,
  panVerificationFailed,
  panFormatError,
  verificationStatus,
  isLocked,
}) => {
  const panDoc = getDocStatus("PAN Card");
  const aadhaarDoc = getDocStatus("Aadhar Card");

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  const maxDate = eighteenYearsAgo.toISOString().split("T")[0];

  return (
    <>
      <div className="mb-4">
        <h4 className="font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
          Profile & Identity Verification
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 md:col-span-2">
        <FormInputField
          label="First Name (as per PAN)"
          name="firstname"
          register={register}
          errors={errors}
          isEditing={isEditing}
          value={formData.firstname}
          readOnly={panVerified || isLocked}
          required={true}
        />

        <FormInputField
          label="Middle Name (as per PAN)"
          name="middlename"
          register={register}
          errors={errors}
          isEditing={isEditing}
          value={formData.middlename}
          readOnly={panVerified || isLocked}
        />

        <FormInputField
          label="Last Name (as per PAN)"
          name="lastname"
          register={register}
          errors={errors}
          isEditing={isEditing}
          value={formData.lastname}
          readOnly={panVerified || isLocked}
          required={true}
        />

        <FormInputField
          label="Date of Birth (as per PAN)"
          name="date_of_birth"
          register={register}
          errors={errors}
          isEditing={isEditing}
          value={formatDate(formData.date_of_birth)}
          type="date"
          readOnly={panVerified || isLocked}
          required={true}
          max={maxDate}
        />

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              PAN Number <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <>
                <input
                  {...register("pan_number")}
                  readOnly={panVerified || isLocked}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 uppercase ${errors.pan_number ? "border-red-500" : "border-gray-200"} ${panVerified || isLocked ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                />
                {errors.pan_number && !panVerified && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.pan_number.message}
                  </p>
                )}

                {panVerifying && (
                  <p className="text-blue-600 text-xs mt-1 flex items-center gap-1">
                    <svg
                      className="animate-spin h-3 w-3"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying PAN...
                  </p>
                )}
                {panFormatError && !panVerifying && !panVerified && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {panFormatError}
                  </p>
                )}
                {panVerified && !panVerifying && (
                  <p className="text-green-600 text-xs mt-1 font-medium">
                    PAN Verified
                  </p>
                )}
                {panVerificationFailed && !panVerifying && (
                  <div className="bg-red-50 text-red-600 border border-red-200 p-2 rounded-md mt-2 text-xs">
                    <p className="font-semibold mb-1">
                      PAN Verification Failed
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="font-medium text-gray-800 py-2">
                {formData.pan_number || "-"}
              </p>
            )}
          </div>
          <div className="flex items-end">
            <DocumentUploadItem
              label="PAN Card Upload"
              docKey="PAN Card"
              status={panDoc.status}
              data={panDoc.data}
              isUploading={uploadingState["PAN Card"]}
              handleUpload={handleUpload}
              handleDelete={handleDelete}
              isEditing={isEditing}
              verificationStatus={verificationStatus}
              docConfig={DOC_CONFIG_MAP["PAN Card"]}
            />
          </div>
        </div>

        <div className="sm:col-span-2 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FormSelectField
            label="Blood Group"
            name="blood_group"
            register={register}
            errors={errors}
            isEditing={isEditing}
            value={formData.blood_group}
            disabled={isLocked}
            required={true}
            options={[
              { value: "A+", label: "A+" },
              { value: "A-", label: "A-" },
              { value: "B+", label: "B+" },
              { value: "B-", label: "B-" },
              { value: "AB+", label: "AB+" },
              { value: "AB-", label: "AB-" },
              { value: "O+", label: "O+" },
              { value: "O-", label: "O-" },
            ]}
            placeholder="Select Blood Group"
          />
          
          <FormInputField
            label="Aadhaar Number"
            name="adhar_number"
            register={register}
            errors={errors}
            isEditing={isEditing}
            value={formData.adhar_number}
            readOnly={isLocked}
            required={true}
            maxLength={12}
            minLength={12}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^0-9]/g, "");
            }}
          />
          
          <div className="flex items-end">
            <DocumentUploadItem
              label="Aadhaar Card Upload"
              docKey="Aadhar Card"
              status={aadhaarDoc.status}
              data={aadhaarDoc.data}
              isUploading={uploadingState["Aadhar Card"]}
              handleUpload={handleUpload}
              handleDelete={handleDelete}
              isEditing={isEditing}
              verificationStatus={verificationStatus}
              docConfig={DOC_CONFIG_MAP["Aadhar Card"]}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileIdentitySection;
