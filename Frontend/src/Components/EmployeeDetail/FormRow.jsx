import React from "react";
import { ToggleLeft, ToggleRight, Lock } from "lucide-react";

const FormRow = ({
  title,
  description = "Lorem ipsum dolor sit.",
  status,
  isDisabled,
  onToggle,
  onView,
  showToggle = true,
  verifiedByName,
  isEmployeeView = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border border-gray-100 rounded-lg bg-gray-50 gap-3">
      <div className="w-full sm:w-40 md:w-1/3">
        <p className="font-semibold text-gray-800 text-xs">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        {showToggle && (
          <button
            onClick={onToggle}
            className={`p-1 rounded-md transition-colors ${
              isDisabled
                ? "text-red-500 bg-black-500 hover:bg-red-100"
                : "text-green-500 bg-green-50 hover:bg-green-100"
            }`}
            title={isDisabled ? "Enable Form" : "Disable Form"}
          >
            {isDisabled ? <ToggleLeft size={20} /> : <ToggleRight size={20} />}
          </button>
        )}

        {/* Status Badge */}
        <div className="flex flex-col items-end">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded ${
              status === "VERIFIED"
                ? "bg-green-100 text-green-700"
                : status === "REJECTED"
                  ? "bg-red-100 text-red-700"
                  : status === "SUBMITTED"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
            }`}
          >
            {status === "SUBMITTED"
              ? "Submitted"
              : status === "VERIFIED"
                ? "Verified"
                : status === "REJECTED"
                  ? "Rejected"
                  : "Pending"}
          </span>
          {status === "VERIFIED" && verifiedByName && (
            <span className="text-[10px] text-gray-500 mt-1">
              By: {verifiedByName}
            </span>
          )}
        </div>

        {!isDisabled ? (
          (isEmployeeView || status !== "PENDING") && (
            <button
              onClick={onView}
              className={`text-xs border px-3 py-1.5 rounded font-medium ${
                isEmployeeView &&
                ["PENDING", "DRAFT", "REJECTED"].includes(status || "PENDING")
                  ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {isEmployeeView
                ? ["PENDING", "DRAFT"].includes(status || "PENDING")
                  ? "Fill Form"
                  : status === "REJECTED"
                    ? "Correct Form"
                    : "View Form"
                : "View Form"}
            </button>
          )
        ) : (
          <span className="flex items-center gap-1 text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded border border-red-100">
            <Lock size={12} /> Disabled
          </span>
        )}
      </div>
    </div>
  );
};

export default FormRow;
