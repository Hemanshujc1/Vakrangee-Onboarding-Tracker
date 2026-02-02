import React from 'react';
import { FileText, CheckCircle, Edit, ChevronRight } from 'lucide-react';

const FormCard = ({ 
    form, 
    onClick 
}) => {
    const { name, description, status, time, verifiedByName } = form;

    const renderActionButton = () => {
        if (status === "Approved") {
          return (
            <button
              onClick={onClick}
              className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-all"
            >
              <CheckCircle size={16} /> View Approved
            </button>
          );
        }
    
        if (status === "Submitted") {
          return (
            <button
              onClick={onClick}
              className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-all"
            >
              View Submitted
            </button>
          );
        }
    
        if (status === "Rejected") {
          return (
            <button
              onClick={onClick}
              className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all"
            >
              <Edit size={16} /> View Rejection Details
            </button>
          );
        }
    
        // Default / Pending
        return (
          <button
            onClick={onClick}
            className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 bg-(--color-primary) text-white hover:brightness-110 shadow-sm transition-all"
          >
            Start Filling <ChevronRight size={16} />
          </button>
        );
      };

    return (
        <div
        className={`p-6 rounded-xl shadow-sm border transition-all group ${
          status === "Rejected"
            ? "bg-red-50 border-red-200"
            : "bg-white border-gray-100 hover:border-blue-200"
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div
            className={`p-3 rounded-lg ${
              status === "Approved"
                ? "bg-green-100 text-green-600"
                : status === "Rejected"
                ? "bg-red-100 text-red-600"
                : status === "Submitted"
                ? "bg-blue-100 text-blue-600"
                : "bg-blue-50 text-(--color-primary)"
            }`}
          >
            <FileText size={24} />
          </div>

          {/* Status Badge */}
          <div className="flex flex-col gap-2 text-center">
            <span
              className={`text-xs font-semibold px-1 py-1 rounded ${
                status === "Approved"
                  ? "bg-green-100 text-green-700"
                  : status === "Rejected"
                  ? "bg-red-100 text-red-700"
                  : status === "Submitted"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {status === "Submitted"
                ? "Submitted for Verification"
                : status === "Approved"
                ? "Verified"
                : status === "Rejected"
                ? "Returned"
                : `~ ${time}`}
            </span>

            {status === "Approved" && verifiedByName && (
              <div className="text-[10px] text-gray-500 font-medium mt-1 text-right">
                Verified by: {verifiedByName}
              </div>
            )}
          </div>
        </div>

        <h3 className="font-bold text-lg text-gray-800 mb-1">
          {name}
        </h3>
        <p className="text-sm text-gray-500 mb-6 min-h-10">
          {description}
        </p>

        {renderActionButton()}
      </div>
    );
};

export default FormCard;
