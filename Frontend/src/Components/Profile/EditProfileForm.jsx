import React from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileView from "./ProfileView";
import ProfileEdit from "./ProfileEdit";
import { useEditProfileForm } from "../../hooks/useEditProfileForm";

const EditProfileForm = () => {
  const {
    loading,
    saving,
    message,
    role,
    companyEmail,
    errors,
    formData,
    previewImage,
    isEditing,
    setIsEditing,
    departments,
    designations,
    loadingDropdowns,
    initialRecord,
    handleInputChange,
    handleDeptChange,
    handleJobTitleChange,
    handleImageChange,
    handleSubmit,
    validateField,
    setErrors,
    fetchProfile,
  } = useEditProfileForm();

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading profile...</div>
    );

  const fullAddress = [
    formData.address_line1,
    formData.address_line2,
    formData.landmark,
    formData.post_office ? `PO: ${formData.post_office}` : "",
    formData.city,
    formData.district,
    formData.state,
    formData.country,
    formData.pincode ? `Pin: ${formData.pincode}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Banner */}
      <div className="h-32 bg-(--color-secondary)"></div>

      <div className="px-4 md:px-8 pb-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <ProfileHeader
            formData={formData}
            role={role}
            companyEmail={companyEmail}
            previewImage={previewImage}
            isEditing={isEditing}
            onImageChange={handleImageChange}
          />

          {/* Right Content Area */}
          <div className="w-full lg:w-2/3 lg:mt-6">
            {message.text && (
              <div
                className={`mb-6 p-4 rounded-lg text-sm font-medium ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {!isEditing ? (
              <ProfileView
                formData={formData}
                companyEmail={companyEmail}
                fullAddress={fullAddress}
                onEdit={() => setIsEditing(true)}
              />
            ) : (
              <ProfileEdit
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                validateField={validateField}
                handleDeptChange={handleDeptChange}
                handleJobTitleChange={handleJobTitleChange}
                departments={departments}
                designations={designations}
                loadingDropdowns={loadingDropdowns}
                onCancel={() => {
                  setIsEditing(false);
                  fetchProfile();
                  setErrors({});
                }}
                onSubmit={handleSubmit}
                saving={saving}
                role={role}
                initialRecord={initialRecord}
                companyEmail={companyEmail}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;
