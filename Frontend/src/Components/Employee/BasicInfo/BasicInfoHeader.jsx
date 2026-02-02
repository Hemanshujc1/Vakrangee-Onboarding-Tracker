import React from 'react';
import { Clock, CheckCircle, AlertCircle, Edit2, ShieldCheck, X, Save } from 'lucide-react';

const BasicInfoHeader = ({
  verificationStatus,
  isEditing,
  setIsEditing,
  onCancel, // Optional if setIsEditing(false) is handled inside or passed directly
  onSubmitVerification,
  saving,
  verifiedByName,
  rejectionReason
}) => {
  return (
    <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-(--color-text-dark)">Basic Information</h1>
        <p className="text-gray-500 mt-2">Personal and professional details.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        {/* Status Banner / Action */}
        {verificationStatus === "SUBMITTED" && (
          <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100 flex items-center gap-2">
            <Clock size={16} /> Submitted for Verification
          </div>
        )}
        {verificationStatus === "VERIFIED" && (
          <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium border border-green-100 flex items-center gap-2">
            <CheckCircle size={16} /> Profile Verified
            {verifiedByName && (
              <span className="text-sm border-l border-green-200 pl-2 ml-1">
                by {verifiedByName}
              </span>
            )}
          </div>
        )}
        {verificationStatus === "REJECTED" && (
          <div className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium border border-red-100 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>
              Verification Rejected
              {verifiedByName && <span className="text-sm"> by {verifiedByName}</span>}
              {rejectionReason && <> due to: {rejectionReason}</>}
            </span>
          </div>
        )}

        {/* Edit Button - Hide if Submitted/Verified */}
        {!isEditing &&
        verificationStatus !== "SUBMITTED" &&
        verificationStatus !== "VERIFIED" ? (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex justify-center items-center gap-2 bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-all font-medium shadow-sm w-full sm:w-auto"
            >
              <Edit2 size={18} />
              <span>Edit Profile</span>
            </button>

            {/* Submit for Verification Button */}
            <button
              type="button"
              onClick={onSubmitVerification}
              className="flex justify-center items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-all font-medium shadow-sm w-full sm:w-auto"
            >
              <ShieldCheck size={18} />
              <span>Submit for Verification</span>
            </button>
          </>
        ) : isEditing ? (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              className="flex justify-center items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-all font-medium w-full sm:w-auto"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`flex justify-center items-center gap-2 bg-(--color-primary) text-white px-6 py-2.5 rounded-lg transition-all font-medium shadow-sm w-full sm:w-auto ${
                saving ? "opacity-70 cursor-not-allowed" : "hover:brightness-110"
              }`}
            >
              <Save size={18} />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default BasicInfoHeader;
