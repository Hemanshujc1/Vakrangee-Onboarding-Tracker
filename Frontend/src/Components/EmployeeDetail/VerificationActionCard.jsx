import React from "react";
import { ShieldCheck, X } from "lucide-react";

const VerificationActionCard = ({
  employee,
  handleVerificationAction,
  actionLoading,
}) => {
  // if (!employee || employee.onboardingStage !== "BASIC_INFO") return null;

  if (employee.basicInfoStatus === "VERIFIED") {
    return (
      <div className="bg-white px-6 py-3 rounded-full border border-green-100 shadow-sm flex items-center gap-3 w-full ml-auto transition-all hover:shadow-md">
        <div className="p-1.5 bg-green-50 text-green-600 rounded-full">
          <ShieldCheck size={16} />
        </div>
        <div className="flex flex-row gap-2 items-center leading-none">
          <span className="text-[15px] font-bold text-green-800">
            Basic Info Verified
          </span>
          <span className="text-[12px] text-green-600 opacity-70 font-medium">
            By {employee.basicInfoVerifiedByName || "HR Admin"}
          </span>
        </div>
      </div>
    );
  }

  if (employee.basicInfoStatus === "REJECTED") {
    return (
      <div className="bg-white px-6 py-2.5 rounded-full border border-red-100 shadow-sm flex items-center gap-3 w-fit ml-auto transition-all hover:shadow-md">
        <div className="p-1.5 bg-red-50 text-red-600 rounded-full">
          <X size={16} />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-bold text-red-800">
            Verification Rejected
          </span>
          <span className="text-[12px] text-red-600 opacity-70 font-medium truncate max-w-[37.5]">
            {employee.basicInfoRejectionReason}
          </span>
        </div>
      </div>
    );
  }

  if (employee.basicInfoStatus === "SUBMITTED") {
    return (
      <div className="bg-white px-5 py-2.5 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-6 w-fit ml-auto transition-all hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
            <ShieldCheck size={18} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-orange-800">
              Review Required
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              Verify basic profile details
            </span>
          </div>
        </div>
        <div className="flex gap-2 border-l border-gray-100 pl-5">
          <button
            onClick={() => handleVerificationAction("VERIFIED")}
            disabled={actionLoading}
            className="px-4 py-1.5 bg-green-600 text-white text-[11px] font-bold rounded-lg hover:bg-green-700 transition-all shadow-sm shadow-green-100 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => handleVerificationAction("REJECTED")}
            disabled={actionLoading}
            className="px-4 py-1.5 bg-white border border-red-100 text-red-600 text-[11px] font-bold rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default VerificationActionCard;
