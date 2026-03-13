import React from "react";
import DocumentUploadItem from "./DocumentUploadItem";

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
  verificationStatus,
}) => {
  const isLocked = verificationStatus === "VERIFIED";
  const panDoc = getDocStatus("PAN Card");
  const aadhaarDoc = getDocStatus("Aadhar Card");

  return (
    <>
      <div className="md:col-span-2">
        <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
           Profile & Identity Verification
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 md:col-span-2">
        <div>
          <label className="block text-sm text-gray-500 mb-1">
            First Name (as per PAN) <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <>
              <input
                {...register("firstname")}
                readOnly={panVerified || isLocked}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.firstname ? "border-red-500" : "border-gray-200"} ${(panVerified || isLocked) ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
              />
              {errors.firstname && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.firstname.message}
                </p>
              )}
            </>
          ) : (
            <p className="font-medium text-gray-800 py-2">
              {formData.firstname || "-"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Middle Name (as per PAN)  <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <>
              <input
                {...register("middlename")}
                readOnly={panVerified || isLocked}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.middlename ? "border-red-500" : "border-gray-200"} ${(panVerified || isLocked) ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
              />
              {errors.middlename && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.middlename.message}
                </p>
              )}
            </>
          ) : (
            <p className="font-medium text-gray-800 py-2">
              {formData.middlename || "-"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Last Name (as per PAN) <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <>
              <input
                {...register("lastname")}
                readOnly={panVerified || isLocked}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.lastname ? "border-red-500" : "border-gray-200"} ${(panVerified || isLocked) ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
              />
              {errors.lastname && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lastname.message}
                </p>
              )}
            </>
          ) : (
            <p className="font-medium text-gray-800 py-2">
              {formData.lastname || "-"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Date of Birth (as per PAN) <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <>
              <input
                {...register("date_of_birth")}
                type="date"
                readOnly={panVerified || isLocked}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.date_of_birth ? "border-red-500" : "border-gray-200"} ${(panVerified || isLocked) ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
              />
              {errors.date_of_birth && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.date_of_birth.message}
                </p>
              )}
            </>
          ) : (
            <p className="font-medium text-gray-800 py-2">
              {formatDate(formData.date_of_birth) || "-"}
            </p>
          )}
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-500 mb-1">
              PAN Number <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <>
                <input
                  {...register("pan_number")}
                  readOnly={panVerified || isLocked}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 uppercase ${errors.pan_number ? "border-red-500" : "border-gray-200"} ${(panVerified || isLocked) ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                />
                {errors.pan_number && (
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
                {panVerified && !panVerifying && (
                  <p className="text-green-600 text-xs mt-1 font-medium">
                    ✓ PAN Verified
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
            />
          </div>
        </div>

        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Aadhaar Number <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <>
                <input
                  {...register("adhar_number")}
                  readOnly={isLocked}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.adhar_number ? "border-red-500" : "border-gray-200"} ${isLocked ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                />
                {errors.adhar_number && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.adhar_number.message}
                  </p>
                )}
              </>
            ) : (
              <p className="font-medium text-gray-800 py-2">
                {formData.adhar_number || "-"}
              </p>
            )}
          </div>
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
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileIdentitySection;
