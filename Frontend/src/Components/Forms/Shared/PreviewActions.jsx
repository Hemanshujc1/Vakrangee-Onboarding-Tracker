import React from 'react';
import { ArrowLeft, CheckCircle, Printer, ChevronLeft, ChevronRight } from "lucide-react";

const PreviewActions = ({ 
  status, 
  isHR, 
  onBack, 
  onPrint, 
  printLabel,
  onVerify, 
  onEdit, 
  onSubmit, 
  isSubmitting,
  isSubmitHidden,
  onPrevious,
  onNext,
  disablePrevious,
  disableNext
}) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6 print:hidden">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-fit"
      >
        <ArrowLeft size={20} />
        {status === "SUBMITTED" || status === "VERIFIED" || status === "REJECTED" || isHR
          ? "Back"
          : "Back to Edit"}
      </button>

      {/* Navigation Buttons */}
      {(onPrevious || onNext) && (
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <button
            onClick={onPrevious}
            disabled={disablePrevious}
            className={`flex items-center justify-center p-2 rounded-full border ${
              disablePrevious
                ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
            title="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={onNext}
            disabled={disableNext}
            className={`flex items-center justify-center p-2 rounded-full border ${
              disableNext
                ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
            title="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-end md:justify-end">
        
        {/* Print Button */}
        <button
          onClick={onPrint || (() => window.print())}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded hover:bg-gray-50 text-gray-700"
        >
          <Printer size={18} />
          {printLabel || "Print / Save PDF"}
        </button>

        {/* HR Actions */}
        {isHR && status === "SUBMITTED" ? (
          <>
            <button
              onClick={() => onVerify("REJECTED")}
              className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50"
            >
              Reject
            </button>
            <button
              onClick={() => onVerify("VERIFIED")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow-sm"
            >
              Approve Form
            </button>
          </>
        ) : status === "SUBMITTED" ? (
          <button
            disabled
            className="flex items-center gap-2 px-6 py-2 bg-blue-100 text-blue-700 rounded cursor-not-allowed border border-blue-200"
          >
            <CheckCircle size={18} /> Submitted for Verification
          </button>
        ) : status === "VERIFIED" ? (
          <button
            disabled
            className="flex items-center gap-2 px-6 py-2 bg-green-100 text-green-700 rounded cursor-not-allowed border border-green-200"
          >
            <CheckCircle size={18} /> Verified
          </button>
        ) : status === "REJECTED" ? (
          !isHR ? (
            <button 
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 shadow-sm"
            >
              <ArrowLeft size={18} /> Edit & Resubmit
            </button>
          ) : (
            <button 
              disabled
              className="flex items-center gap-2 px-6 py-2 bg-red-100 text-red-700 rounded cursor-not-allowed border border-red-200"
            >
              <CheckCircle size={18} /> Rejected
            </button>
          )
        ) : (
          !isHR && !isSubmitHidden && (
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : (
                <>
                  <CheckCircle size={18} /> Confirm & Submit
                </>
              )}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default PreviewActions;
