import React from "react";
import { Users, Clock, CheckCircle } from "lucide-react";

const AdminStatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-500 font-medium text-sm">
            Assigned Employees
          </h3>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={20} />
          </div>
        </div>
        <p className="text-3xl font-bold text-[#4E4E4E]">
          {stats?.totalAssigned || 0}
        </p>
      </div>
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-500 font-medium text-sm">
            Onboarding Active
          </h3>
          <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
            <Clock size={20} />
          </div>
        </div>
        <p className="text-3xl font-bold text-[#4E4E4E]">
          {stats?.activeOnboarding || 0}
        </p>
      </div>
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-500 font-medium text-sm">Fully Onboarded</h3>
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle size={20} />
          </div>
        </div>
        <p className="text-3xl font-bold text-[#4E4E4E]">
          {stats?.completed || 0}
        </p>
      </div>
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-500 font-medium text-sm">Not Joined</h3>
          <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
            <Users size={20} />
          </div>
        </div>
        <p className="text-3xl font-bold text-[#4E4E4E]">
          {stats?.notJoined || 0}
        </p>
      </div>
    </div>
  );
};

export default AdminStatsGrid;
