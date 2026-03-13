import React from "react";
import { ShieldCheck } from "lucide-react";

const FinalVerifyCard = ({
  employee,
  documents,
  handleFinalVerify,
  isEverythingReviewed,
  emailSent,
  actionLoading,
}) => {
  const isReviewed = isEverythingReviewed();
  const rejectedDocs = documents?.filter((d) => d.status === "REJECTED") || [];
  const isBasicRejected = employee.basicInfoStatus === "REJECTED";
  const hasRejections = rejectedDocs.length > 0 || isBasicRejected;

  // Only show final verify if everything is reviewed OR if we have documents to verify
  // If basic info is still pending and no docs, hide the final verify too
  if (
    !isReviewed &&
    employee.basicInfoStatus === "PENDING" &&
    (!documents || documents.length === 0)
  ) {
    return null;
  }

  let buttonText = "Verify Employee Basic Detail and Documents";
  if (emailSent) {
    buttonText = hasRejections ? "Rejection Email Sent" : "Approval Email Sent";
  } else if (isReviewed) {
    buttonText = hasRejections
      ? "Send Rejection Summary Email"
      : "Send Approval Summary Email";
  }

  return (
    <div className="flex flex-col gap-2 items-end w-full mt-6">
      <button
        onClick={handleFinalVerify}
        disabled={!isReviewed || actionLoading || emailSent}
        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${
          emailSent
            ? "bg-green-50/50 text-green-700 border border-green-100 cursor-default shadow-none"
            : isReviewed
              ? "bg-linear-to-r from-(--color-primary) to-(--color-secondary) text-white shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5"
              : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none"
        }`}
      >
        <ShieldCheck size={20} />
        <span>{buttonText}</span>
      </button>

      {!isReviewed && (
        <p className="text-[10px] text-gray-400 font-medium italic">
          * Final verification will become active once Basic Details and all
          Documents are reviewed.
        </p>
      )}
    </div>
  );
};

export default FinalVerifyCard;
