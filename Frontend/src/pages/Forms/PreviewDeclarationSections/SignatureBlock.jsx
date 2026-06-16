import React from "react";

const SignatureBlock = ({ formData, signaturePreview }) => {
  return (
    <div className="mt-20 space-y-6 text-base font-medium text-gray-800 break-inside-avoid">
      <div className="flex flex-col md:flex-row md:items-center print:flex-row print:items-center gap-2 md:gap-4">
        <span className="min-w-30 w-32">Name:</span>
        <span className="font-semibold px-0 md:px-4 uppercase flex-1 border-b border-dashed border-gray-400 w-full md:w-auto">
          {formData.employee_full_name}
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center print:flex-row print:items-center gap-2 md:gap-4">
        <span className="min-w-30 w-32">Designation:</span>
        <span className="font-semibold px-0 md:px-4 uppercase flex-1 border-b border-dashed border-gray-400 w-full md:w-auto">
          {formData.current_job_title}
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end print:flex-row print:items-end gap-2 md:gap-4 mt-8">
        <span className="min-w-30 w-32">Signature:</span>
        {signaturePreview ? (
          <div className="px-0 md:px-4 flex-1 pb-2 w-full md:w-auto border-b border-gray-400 md:border-none">
            <img
              src={signaturePreview}
              alt="Signature"
              className="h-16 object-contain"
            />
          </div>
        ) : (
          <span className="font-semibold px-4 italic text-gray-500 flex-1">
            Pending
          </span>
        )}
      </div>
      <div className="items-center gap-4 hidden md:flex">
        <span className="min-w-30 w-32"></span>
        <span className="text-xs uppercase tracking-wide text-gray-500 w-48 border-t border-gray-400 text-center pt-1">
          Employee Signature
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center print:flex-row print:items-center gap-2 md:gap-4 mt-8">
        <span className="min-w-30 w-32">Date:</span>
        <span className="font-semibold px-0 md:px-4 flex-1 w-full md:w-auto">
          {new Date().toLocaleDateString("en-GB")}
        </span>
      </div>
    </div>
  );
};

export default SignatureBlock;
