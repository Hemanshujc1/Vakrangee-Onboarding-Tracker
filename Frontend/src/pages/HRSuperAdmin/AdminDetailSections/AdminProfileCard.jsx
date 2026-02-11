import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Users,
  Pencil,
} from "lucide-react";

const AdminProfileCard = ({
  admin,
  isEditing,
  setIsEditing,
  editForm,
  setEditForm,
  handleSave,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-32 bg-linear-to-r from-blue-600 to-blue-800"></div>
      <div className="px-4 md:px-8 pb-8">
        <div className="relative flex flex-col md:flex-row justify-between items-center md:items-end -mt-12 mb-6 gap-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 w-full md:w-auto">
            <div className="relative shrink-0">
              {admin.profilePhoto ? (
                <img
                  src={admin.profilePhoto}
                  alt={admin.firstName}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center text-4xl font-bold text-blue-600">
                  {admin.firstName?.[0]}
                </div>
              )}
            </div>
            <div className="mb-2 text-center md:text-left mt-2 md:mt-0">
              <h2 className="text-2xl font-bold text-gray-800">
                {admin.firstName} {admin.lastName}
              </h2>
              <div className="text-blue-600 font-medium flex items-center justify-center md:justify-start gap-2">
                <Briefcase size={16} />
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.jobTitle}
                    onChange={(e) =>
                      setEditForm({ ...editForm, jobTitle: e.target.value })
                    }
                    className="border border-blue-200 rounded px-2 py-1 text-sm text-blue-600 font-medium focus:outline-none focus:border-blue-600 w-full"
                  />
                ) : (
                  <span>{admin.jobTitle || admin.role}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="mb-2 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors self-center md:self-end"
            title="Edit Details"
          >
            <Pencil size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Company Email</p>
              <p className="font-medium text-sm">{admin.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Phone</p>
              <p className="font-medium text-sm">{admin.phone || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
              <Building size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Department</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) =>
                    setEditForm({ ...editForm, department: e.target.value })
                  }
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-[#2C9DE6]"
                />
              ) : (
                <p className="font-medium text-sm">
                  {admin.department || "N/A"}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Location</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-[#2C9DE6]"
                />
              ) : (
                <p className="font-medium text-sm">{admin.location || "N/A"}</p>
              )}
            </div>
          </div>
          {isEditing && (
            <div className="flex items-center gap-3 col-span-1 md:col-span-3 justify-end mt-4 border-t pt-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    location: admin.location || "",
                    jobTitle: admin.jobTitle || "",
                    department: admin.department || "",
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#2C9DE6] hover:bg-[#205081] text-white rounded-lg text-sm font-medium"
              >
                Save Changes
              </button>
            </div>
          )}
          {!isEditing && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
                <Users size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Gender</p>
                <p className="font-medium text-sm">{admin.gender || "N/A"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfileCard;
