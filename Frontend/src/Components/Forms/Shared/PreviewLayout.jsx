import React, { forwardRef } from "react";
import PreviewActions from "./PreviewActions";

const PreviewLayout = forwardRef(
  (
    {
      status,
      isHR,
      onBack,
      onPrint,
      onVerify,
      onEdit,
      onSubmit,
      isSubmitting,
      rejectionReason,
      children,
      noPadding = false,
    },
    ref,
  ) => {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 print:p-0 print:m-0 print:w-full print:min-h-0 print:h-auto print:bg-white text-gray-900 font-sans text-sm md:text-base">
        <div className="max-w-[210mm] mx-auto print:max-w-none print:mx-0 print:w-full print:p-0">
          <div className="print:hidden">
            <PreviewActions
              status={status}
              isHR={isHR}
              onBack={onBack}
              onPrint={onPrint}
              onVerify={onVerify}
              onEdit={onEdit}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
            />
          </div>

          {(status === "REJECTED" ||
            (status === "DRAFT" && rejectionReason)) && (
            <div className="mb-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 print:hidden">
              <div className="font-bold flex items-center gap-2 mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Form Rejected
              </div>
              <p className="text-sm px-1">
                <span className="font-semibold">Reason:</span> {rejectionReason}
              </p>
              <p className="text-xs mt-2 text-red-600">
                Please review the reason and click "Edit & Resubmit" to make
                necessary changes.
              </p>
            </div>
          )}

          <div
            ref={ref}
            className={`bg-white ${noPadding ? "" : "p-4 md:p-8"} shadow-lg rounded-sm 
                  w-full max-w-[210mm] min-h-[297mm] mx-auto 
                  flex flex-col relative text-gray-900 font-serif leading-relaxed
                  print:a4-print-container print:shadow-none ${noPadding ? "print:p-0" : "print:p-5"} print:block overflow-x-hidden`}
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);

PreviewLayout.displayName = "PreviewLayout";

export default PreviewLayout;
