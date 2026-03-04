import React from "react";
import { ShieldCheck } from "lucide-react";
import DocumentVerificationItem from "./DocumentVerificationItem";

const EducationIdentityCard = ({ employee }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#4E4E4E]">
          Academic Information
        </h3>
        <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
          <ShieldCheck size={20} />
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">10th Percentage</p>
            <p className="text-sm text-gray-800 font-medium">
              {employee.tenthPercentage
                ? `${employee.tenthPercentage}%`
                : "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">12th Percentage</p>
            <p className="text-sm text-gray-800 font-medium">
              {employee.twelfthPercentage
                ? `${employee.twelfthPercentage}%`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationIdentityCard;
