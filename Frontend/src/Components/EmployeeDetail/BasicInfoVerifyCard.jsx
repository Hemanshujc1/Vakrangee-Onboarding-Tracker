import React from "react";
import { ShieldCheck, X } from "lucide-react";

const BasicInfoVerifyCard = ({
  employee,
  handleVerificationAction,
  isBasicInfoComplete,
  actionLoading,
}) => {
  if (employee.basicInfoStatus === "PENDING") return null;

  return (
    <div className="w-full flex justify-end mb-4">
      {employee.basicInfoStatus === "VERIFIED" ? (
        <div className="bg-white px-6 py-3 rounded-full border border-green-100 shadow-sm flex items-center gap-3 w-fit transition-all hover:shadow-md">
          <div className="p-1.5 bg-green-100/10 text-green-600 rounded-full">
            <ShieldCheck size={16} />
          </div>
          <div className="flex flex-row gap-2 items-center leading-none">
            <span className="text-[14px] font-bold text-green-800">
              Basic Info Verified
            </span>
            {employee.basicInfoVerifiedByName && (
              <span className="text-[11px] text-green-600 opacity-70 font-medium">
                By {employee.basicInfoVerifiedByName}
              </span>
            )}
          </div>
        </div>
      ) : employee.basicInfoStatus === "REJECTED" ? (
        <div className="bg-white px-6 py-2.5 rounded-full border border-red-100 shadow-sm flex items-center gap-3 w-fit transition-all hover:shadow-md">
          <div className="p-1.5 bg-red-50 text-red-600 rounded-full">
            <X size={16} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[14px] font-bold text-red-800">
              Basic Info Rejected
            </span>
            <span className="text-[11px] text-red-600 opacity-70 font-medium truncate max-w-[200px]">
              Reason: {employee.basicInfoRejectionReason}
            </span>
          </div>
        </div>
      ) : employee.basicInfoStatus === "SUBMITTED" ? (
        <div className="flex flex-col items-end gap-2">
          <div className="bg-white px-5 py-2.5 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-6 w-fit transition-all hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                <ShieldCheck size={18} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-orange-800">
                  Review Basic Details
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  Profile information review
                </span>
              </div>
            </div>
            <div className="flex gap-2 border-l border-gray-100 pl-5">
              <button
                onClick={() => handleVerificationAction("VERIFIED")}
                disabled={actionLoading || !isBasicInfoComplete()}
                title={
                  !isBasicInfoComplete()
                    ? "Cannot approve: Mandatory details are missing"
                    : ""
                }
                className={`px-4 py-1.5 text-white text-[11px] font-bold rounded-lg transition-all shadow-sm shadow-green-100 ${
                  !isBasicInfoComplete()
                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                    : "bg-(--color-primary) hover:bg-(--color-secondary) hover:shadow-blue-200"
                } disabled:opacity-50 pointer-events-auto`}
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
          {!isBasicInfoComplete() && (
            <p className="text-[10px] text-red-500 font-medium italic animate-pulse">
              * Employee has not filled all mandatory basic details. Approval is
              disabled.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default BasicInfoVerifyCard;
