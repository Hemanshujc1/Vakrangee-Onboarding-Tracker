import React from "react";
import { Camera } from "lucide-react";

const ProfileHeader = ({
  formData,
  role,
  companyEmail,
  previewImage,
  isEditing,
  onImageChange,
}) => {
  return (
    <div className="w-full lg:w-1/3 -mt-16 flex flex-col items-center text-center mb-6 lg:mb-0">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
              {formData.firstname ? formData.firstname[0] : "U"}
            </div>
          )}
        </div>
        {isEditing && (
          <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200">
            <Camera size={18} className="text-gray-600" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onImageChange}
            />
          </label>
        )}
      </div>

      <h2 className="mt-4 text-2xl font-bold text-(--color-text-dark)">
        {formData.firstname} {formData.lastname}
      </h2>
      <p className="text-(--color-primary) font-medium">
        {role.replace(/_/g, " ")}
      </p>
      {companyEmail && (
        <p className="text-sm text-gray-500 mt-1">{companyEmail}</p>
      )}
    </div>
  );
};

export default ProfileHeader;
