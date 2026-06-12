import React from "react";
import DocumentUploadItem from "./DocumentUploadItem";
import SearchableSelect from "../../UI/SearchableSelect";
import { DOC_CONFIG_MAP } from "../../../config/documentConfig";


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
                  readOnly={isLocked}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.tenth_percentage
                      ? "border-red-500"
                      : "border-gray-200"
                  } ${isLocked ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                  maxLength={3}
                  onInput={(e) => {
                    // Restrict to max 3 digits (e.g. 100) and allow optional decimals
                    let val = e.target.value.replace(/[^0-9.]/g, "");
                    if (val.includes(".")) {
                      const parts = val.split(".");
                      val =
                        parts[0].slice(0, 3) +
                        "." +
                        parts.slice(1).join("").slice(0, 2);
                    } else {
                      val = val.slice(0, 3);
                    }
                    e.target.value = val;
                  }}
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
              verificationStatus={verificationStatus}
              docConfig={DOC_CONFIG_MAP["10th Marksheet"]}
            />
          </div>
        </div>

        {/* 12th */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
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
                  readOnly={isLocked}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.twelfth_percentage
                      ? "border-red-500"
                      : "border-gray-200"
                  } ${isLocked ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                  maxLength={3}
                  onInput={(e) => {
                    let val = e.target.value.replace(/[^0-9.]/g, "");
                    if (val.includes(".")) {
                      const parts = val.split(".");
                      val =
                        parts[0].slice(0, 3) +
                        "." +
                        parts.slice(1).join("").slice(0, 2);
                    } else {
                      val = val.slice(0, 3);
                    }
                    e.target.value = val;
                  }}
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
                  options={[
                    { id: "High School Diploma", name: "High School Diploma" },
                    {
                      id: "Vocational / Trade Qualification",
                      name: "Vocational / Trade Qualification",
                    },
                    { id: "Diploma", name: "Diploma" },
                    {
                      id: "Associate Degrees (AA, AS)",
                      name: "Associate Degrees (AA, AS)",
                    },
                    {
                      id: "Bachelor of Arts/Science (BA/BS)",
                      name: "Bachelor of Arts/Science (BA/BS)",
                    },
                    {
                      id: "Bachelor of Engineering/Technology (B.E/B.Tech)",
                      name: "Bachelor of Engineering/Technology (B.E/B.Tech)",
                    },
                    {
                      id: "Bachelor of Business (BBA/BCom)",
                      name: "Bachelor of Business (BBA/BCom)",
                    },
                    {
                      id: "Bachelor of Computer Applications (BCA)",
                      name: "Bachelor of Computer Applications (BCA)",
                    },
                    {
                      id: "Bachelor of Fine Arts (BFA)",
                      name: "Bachelor of Fine Arts (BFA)",
                    },
                    {
                      id: "Bachelor of Laws (LLB)",
                      name: "Bachelor of Laws (LLB)",
                    },
                    {
                      id: "Bachelor of Medicine (MBBS)",
                      name: "Bachelor of Medicine (MBBS)",
                    },
                    {
                      id: "Master of Arts/Science (MA/MS)",
                      name: "Master of Arts/Science (MA/MS)",
                    },
                    {
                      id: "Master of Business/Management (MBA/MIM)",
                      name: "Master of Business/Management (MBA/MIM)",
                    },
                    {
                      id: "Master of Engineering/Technology (M.E/M.Tech)",
                      name: "Master of Engineering/Technology (M.E/M.Tech)",
                    },
                    {
                      id: "Doctorate (PhD/DBA/EdD)",
                      name: "Doctorate (PhD/DBA/EdD)",
                    },
                  ]}
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
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Degree Percentage <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <>
                <input
                  {...register("degree_percentage")}
                  type="number"
                  step="0.01"
                  readOnly={isLockedInternal}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.degree_percentage
                      ? "border-red-500"
                      : "border-gray-200"
                  } ${isLockedInternal ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                  maxLength={3}
                  onInput={(e) => {
                    let val = e.target.value.replace(/[^0-9.]/g, "");
                    if (val.includes(".")) {
                      const parts = val.split(".");
                      val =
                        parts[0].slice(0, 3) +
                        "." +
                        parts.slice(1).join("").slice(0, 2);
                    } else {
                      val = val.slice(0, 3);
                    }
                    e.target.value = val;
                  }}
                />
                {errors.degree_percentage && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.degree_percentage.message}
                  </p>
                )}
              </>
            ) : (
              <p className="font-medium text-gray-800 py-2">
                {formData.degree_percentage
                  ? `${formData.degree_percentage}%`
                  : "-"}
              </p>
            )}
          </div>
          <div className="flex items-end">
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
