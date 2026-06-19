import React from "react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Edit2,
  ShieldCheck,
  X,
  Save,
  Loader2,
} from "lucide-react";

const BasicInfoHeader = ({
  verificationStatus,
  isEditing,
  setIsEditing,
  onCancel,
  onSubmitVerification,
  onSubmitLoading,
  saving,
  verifiedByName,
  rejectionReason,
  isProfileComplete,
  documents = [],
  onSave,
  onTrySubmitIncomplete,
}) => {
  const hasRejectedDocs = documents.some((d) => d.status === "REJECTED");
  const hasUploadedDocs = documents.some((d) => d.status === "UPLOADED");
  const hasSubmittedDocs = documents.some((d) => d.status === "SUBMITTED");
  const isResubmission =
    verificationStatus !== "PENDING" &&
    (verificationStatus === "REJECTED" || hasRejectedDocs || hasUploadedDocs);
  const showSubmitButton =
    verificationStatus !== "SUBMITTED" &&
    (verificationStatus !== "VERIFIED" || hasRejectedDocs || hasUploadedDocs);

  // Determine status banner content
  const renderStatusBanner = () => {
    if (verificationStatus === "SUBMITTED") {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100 text-sm">
          <Clock size={15} className="shrink-0" />
          <span>Submitted for Verification</span>
        </div>
      );
    }
    if (
      verificationStatus === "VERIFIED" &&
      !hasRejectedDocs &&
      !hasUploadedDocs &&
      !hasSubmittedDocs
    ) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium border border-green-100 text-sm">
          <CheckCircle size={15} className="shrink-0" />
          <span>
            Profile Verified{verifiedByName ? ` by ${verifiedByName}` : ""}
          </span>
        </div>
      );
    }
    if (verificationStatus === "VERIFIED" && hasRejectedDocs) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium border border-red-100 text-sm">
          <AlertCircle size={15} className="shrink-0" />
          <span>Some documents are rejected — please re-upload</span>
        </div>
      );
    }
    if (
      verificationStatus === "VERIFIED" &&
      hasUploadedDocs &&
      !hasRejectedDocs
    ) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100 text-sm">
          <Clock size={15} className="shrink-0" />
          <span>Documents re-uploaded — submit for verification</span>
        </div>
      );
    }
    if (verificationStatus === "VERIFIED" && hasSubmittedDocs) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100 text-sm">
          <Clock size={15} className="shrink-0" />
          <span>Documents submitted for verification</span>
        </div>
      );
    }
    if (verificationStatus === "REJECTED") {
      return (
        <div className="flex items-start gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium border border-red-100 text-sm">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">Verification Rejected</span>
            <span className="font-normal text-xs">
              {rejectionReason || "Please check the details again."}
              {hasRejectedDocs &&
                " Please re-upload the rejected documents as well."}
            </span>
            {verifiedByName && (
              <span className="text-xs text-red-400 font-normal">
                by {verifiedByName}
              </span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const statusBanner = renderStatusBanner();

  return (
    <header className="mb-6 sticky top-14 lg:top-0 z-5000 bg-[#efefef]/95 backdrop-blur-sm pt-4 pb-4 border-b border-gray-200 -mx-4 px-4 lg:-mx-8 lg:px-8 -mt-4 lg:-mt-8 lg:pt-8">
      {/* Top row: title + action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-(--color-text-dark)">
            Basic Information
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Personal and professional details.
          </p>
        </div>

        {/* Action buttons only */}
        <div className="flex flex-row flex-wrap gap-2 sm:gap-3 sm:shrink-0">
          {!isEditing && showSubmitButton && (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all font-medium text-sm shadow-sm"
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>

              {isProfileComplete ? (
                <button
                  type="button"
                  onClick={onSubmitVerification}
                  disabled={onSubmitLoading}
                  className={`flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg transition-all font-medium text-sm shadow-sm ${
                    onSubmitLoading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-green-700"
                  }`}
                >
                  {onSubmitLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  <span>
                    {onSubmitLoading
                      ? "Submitting..."
                      : isResubmission
                        ? "Resubmit"
                        : "Submit"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onTrySubmitIncomplete}
                  title="Complete your profile and upload all required documents to submit for verification."
                  className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 hover:text-white transition-all font-medium text-sm shadow-sm"
                >
                  <ShieldCheck size={16} />
                  <span>{isResubmission ? "Resubmit" : "Submit"}</span>
                </button>
              )}
            </>
          )}

          {isEditing && (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className={`flex items-center gap-2 bg-(--color-primary) text-white px-4 py-2 rounded-lg transition-all font-medium text-sm shadow-sm ${
                  saving
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:brightness-110"
                }`}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>{saving ? "Saving..." : "Save Draft"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {statusBanner && <div className="mt-3">{statusBanner}</div>}
    </header>
  );
};

export default BasicInfoHeader;
