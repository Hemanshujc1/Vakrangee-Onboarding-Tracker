import React from "react";
import DocumentUploadItem from "./DocumentUploadItem";
import SearchableSelect from "../../UI/SearchableSelect";
import { DOC_CONFIG_MAP } from "../../../config/documentConfig";
import FormInputField from "../../UI/FormInputField";
import { DEGREE_OPTIONS } from "../../../config/dropdownOptions";

const percentageOnInput = (e) => {
  let val = e.target.value.replace(/[^0-9.]/g, "");
  if (val.includes(".")) {
    const parts = val.split(".");
    val = parts[0].slice(0, 3) + "." + parts.slice(1).join("").slice(0, 2);
  } else {
    val = val.slice(0, 3);
  }
  e.target.value = val;
};

const AcademicDetailsSection = ({
  register,
  errors,
  isEditing,
  formData,
  getDocStatus,
  uploadingState,
  handleUpload,
  handleDelete,
  isLocked,
  verificationStatus,
  setValue,
}) => {
  const isLockedInternal = isLocked || verificationStatus === "VERIFIED";
  const tenthDoc = getDocStatus("10th Marksheet");
  const twelfthDoc = getDocStatus("12th Marksheet");
  const degreeDoc = getDocStatus("Degree Certificate");

  return (
    <>
      <div className="mt-6 mb-6">
        <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
          Academic Details
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 md:col-span-2">
        {/* 10th */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
          <FormInputField
            label="10th Percentage"
            name="tenth_percentage"
            register={register}
            errors={errors}
            isEditing={isEditing}
            value={formData.tenth_percentage ? `${formData.tenth_percentage}%` : ""}
            type="number"
            step="0.01"
            readOnly={isLocked}
            required={true}
            maxLength={3}
            onInput={percentageOnInput}
          />
          <div className="flex items-start">
            <DocumentUploadItem
              label="10th Marksheet"
              docKey="10th Marksheet"
              status={tenthDoc.status}
              data={tenthDoc.data}
              isUploading={uploadingState["10th Marksheet"]}
              handleUpload={handleUpload}
              handleDelete={handleDelete}
              isEditing={isEditing}
              verificationStatus={verificationStatus}
              docConfig={DOC_CONFIG_MAP["10th Marksheet"]}
            />
          </div>
        </div>

        {/* 12th */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
          <FormInputField
            label="12th Percentage"
            name="twelfth_percentage"
            register={register}
            errors={errors}
            isEditing={isEditing}
            value={formData.twelfth_percentage ? `${formData.twelfth_percentage}%` : ""}
            type="number"
            step="0.01"
            readOnly={isLocked}
            required={true}
            maxLength={3}
            onInput={percentageOnInput}
          />
          <div className="flex items-start">
            <DocumentUploadItem
              label="12th Marksheet"
              docKey="12th Marksheet"
              status={twelfthDoc.status}
              data={twelfthDoc.data}
              isUploading={uploadingState["12th Marksheet"]}
              handleUpload={handleUpload}
              handleDelete={handleDelete}
              isEditing={isEditing}
              verificationStatus={verificationStatus}
              docConfig={DOC_CONFIG_MAP["12th Marksheet"]}
            />
          </div>
        </div>

        {/* Degree */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 sm:col-span-2">
          <div>
            {isEditing ? (
              <div>
                <SearchableSelect
                  label="Degree Name"
                  name="degree_name"
                  value={formData.degree_name || ""}
                  onChange={(e) => {
                    if (setValue) {
                      setValue("degree_name", e.target.value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }
                  }}
                  options={DEGREE_OPTIONS}
                  disabled={isLockedInternal}
                  required={true}
                  allowCustom={true}
                  showSearch={false}
                  placeholder="e.g. B.Tech / B.Sc / B.Com"
                />
                {errors.degree_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.degree_name.message}
                  </p>
                )}
              </div>
            ) : (
              <>
                <label className="block text-sm text-gray-500 mb-1">
                  Degree Name
                </label>
                <p className="font-medium text-gray-800 py-2">
                  {formData.degree_name || "-"}
                </p>
              </>
            )}
          </div>
          
          <FormInputField
            label="Degree Percentage"
            name="degree_percentage"
            register={register}
            errors={errors}
            isEditing={isEditing}
            value={formData.degree_percentage ? `${formData.degree_percentage}%` : ""}
            type="number"
            step="0.01"
            readOnly={isLockedInternal}
            required={true}
            maxLength={3}
            onInput={percentageOnInput}
          />
          
          <div className="flex items-start">
            <DocumentUploadItem
              label="Degree Certificate Upload"
              docKey="Degree Certificate"
              status={degreeDoc.status}
              data={degreeDoc.data}
              isUploading={uploadingState["Degree Certificate"]}
              handleUpload={handleUpload}
              handleDelete={handleDelete}
              isEditing={isEditing}
              verificationStatus={verificationStatus}
              docConfig={DOC_CONFIG_MAP["Degree Certificate"]}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AcademicDetailsSection;
