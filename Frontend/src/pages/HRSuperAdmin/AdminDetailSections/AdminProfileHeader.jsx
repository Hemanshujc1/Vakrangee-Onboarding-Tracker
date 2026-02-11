import React from "react";
import { ArrowLeft } from "lucide-react";

const AdminProfileHeader = ({ navigate, accountStatus }) => {
  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4"
      >
        <ArrowLeft size={20} />
        <span>Back to Admins</span>
      </button>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Admin Profile</h1>
        {/* Account Status Badge */}
        <div
          className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
            accountStatus === "Inactive"
              ? "bg-red-50 text-red-600 border-red-500"
              : accountStatus === "INVITED"
                ? "bg-yellow-50 text-yellow-600 border-yellow-500"
                : "bg-green-50 text-green-600 border-green-500"
          }`}
        >
          {accountStatus || "ACTIVE"}
        </div>
      </div>
    </div>
  );
};

export default AdminProfileHeader;
