import React from "react";

const StageControl = ({
  employee,
  isEverythingVerified,
  actionLoading,
  handleAdvanceStage,
}) => {
  return (
    <>
      {/* Stage Control: BASIC_INFO to PRE_JOINING (Manual) */}
      {employee.onboardingStage === "BASIC_INFO" && isEverythingVerified() && (
        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-sm font-bold text-blue-800 mb-1">
              Ready for Pre-joining
            </h3>
            <p className="text-xs text-blue-600">
              All basic information and mandatory documents are verified.
            </p>
          </div>
          <button
            onClick={() => handleAdvanceStage("PRE_JOINING")}
            disabled={actionLoading}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
          >
            Confirm & Start Pre joining
          </button>
        </div>
      )}

      {/* Stage Control: PRE_JOINING_VERIFIED to POST_JOINING */}
      {employee.onboardingStage === "PRE_JOINING_VERIFIED" && (
        <div className="bg-green-50/50 p-6 rounded-xl border border-green-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-sm font-bold text-green-800 mb-1">
              Ready for Joining
            </h3>
            <p className="text-xs text-green-600">
              Verification complete. Start the post-joining onboarding process.
            </p>
          </div>
          <button
            onClick={() => handleAdvanceStage("POST_JOINING")}
            disabled={actionLoading}
            className="bg-green-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition-all shadow-md disabled:opacity-50"
          >
            Confirm & Start Joining
          </button>
        </div>
      )}
    </>
  );
};

export default StageControl;
