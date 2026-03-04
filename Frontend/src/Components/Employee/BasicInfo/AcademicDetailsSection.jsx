import React from "react";
import DocumentUploadItem from "./DocumentUploadItem";

const AcademicDetailsSection = ({
  register,
  errors,
  isEditing,
  formData,
  getDocStatus,
  uploadingState,
  handleUpload,
  handleDelete,
}) => {
  const tenthDoc = getDocStatus("10th Marksheet");
  const twelfthDoc = getDocStatus("12th Marksheet");
  const degreeDoc = getDocStatus("Degree Certificate");

  return (
    <>
      <div className="md:col-span-2 mt-8">
        <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
           Academic Details
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 md:col-span-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              10th Percentage <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <>
                <input
                  {...register("tenth_percentage")}
                  type="number"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.tenth_percentage ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.tenth_percentage && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tenth_percentage.message}
                  </p>
                )}
              </>
            ) : (
              <p className="font-medium text-gray-800 py-2">
                {formData.tenth_percentage
                  ? `${formData.tenth_percentage}%`
                  : "-"}
              </p>
            )}
          </div>
          <div className="flex items-end">
            <DocumentUploadItem
              label="10th Marksheet"
              docKey="10th Marksheet"
              status={tenthDoc.status}
              data={tenthDoc.data}
              isUploading={uploadingState["10th Marksheet"]}
              handleUpload={handleUpload}
              handleDelete={handleDelete}
              isEditing={isEditing}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              12th Percentage <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <>
                <input
                  {...register("twelfth_percentage")}
                  type="number"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${errors.twelfth_percentage ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.twelfth_percentage && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.twelfth_percentage.message}
                  </p>
                )}
              </>
            ) : (
              <p className="font-medium text-gray-800 py-2">
                {formData.twelfth_percentage
                  ? `${formData.twelfth_percentage}%`
                  : "-"}
              </p>
            )}
          </div>
          <div className="flex items-end">
            <DocumentUploadItem
              label="12th Marksheet"
              docKey="12th Marksheet"
              status={twelfthDoc.status}
              data={twelfthDoc.data}
              isUploading={uploadingState["12th Marksheet"]}
              handleUpload={handleUpload}
              handleDelete={handleDelete}
              isEditing={isEditing}
            />
          </div>
        </div>

        <div className="sm:col-span-1">
          <DocumentUploadItem
            label="Degree Certificate Upload"
            docKey="Degree Certificate"
            status={degreeDoc.status}
            data={degreeDoc.data}
            isUploading={uploadingState["Degree Certificate"]}
            handleUpload={handleUpload}
            handleDelete={handleDelete}
            isEditing={isEditing}
            // optional={true}
          />
        </div>
      </div>
    </>
  );
};

export default AcademicDetailsSection;
