import React from 'react';
import { User, Camera } from 'lucide-react';

const ProfilePhotoSection = ({ previewImage, isEditing, handleImageChange }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-4 pb-8 text-center sm:text-left">
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
        {isEditing && (
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
      <div>
        <h3 className="font-semibold text-lg text-gray-800">Profile Photo</h3>
        <p className="text-sm text-gray-500">
          {isEditing ? "Upload a professional photo." : "Your profile picture."}
        </p>
      </div>
    </div>
  );
};

export default ProfilePhotoSection;
