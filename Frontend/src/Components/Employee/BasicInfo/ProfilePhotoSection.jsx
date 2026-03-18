import React from 'react';
import { User, Camera } from 'lucide-react';

const ProfilePhotoSection = ({
  previewImage,
  isEditing,
  handleImageChange,
  isLocked,
  photoStatus,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-4 pb-6 sm:pb-8 text-center sm:text-left">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={32} className="text-gray-400" />
          )}
        </div>
        {isEditing && !isLocked && (
          <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 border border-gray-200">
            <Camera size={16} className="text-gray-600" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-gray-800">Profile Photo</h3>
        <p className="text-sm text-gray-500">
          {isEditing ? "Upload a professional photo." : "Your profile picture."}
        </p>
        {photoStatus?.status === "REJECTED" &&
          photoStatus.data?.rejection_reason && (
            <div className="mt-2 text-[10px] text-red-600 font-medium bg-red-50 p-2 rounded border border-red-100 max-w-sm">
              <span className="font-bold">Rejection Reason:</span>{" "}
              {photoStatus.data.rejection_reason}
            </div>
          )}
      </div>
    </div>
  );
};

export default ProfilePhotoSection;
