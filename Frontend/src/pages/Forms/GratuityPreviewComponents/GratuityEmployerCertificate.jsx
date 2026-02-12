import React from "react";

const GratuityEmployerCertificate = () => {
  return (
    <div className="mt-12 page-break-inside-avoid">
      <h4 className="font-semibold text-center mb-6">
        Certificate by the Employer
      </h4>
      <p className="mb-6">
        Certified that the particulars of the above nomination have been
        verified and recorded in this establishment.
      </p>

      <div className="flex flex-col md:flex-row print:flex-row justify-between items-start gap-12 mt-12">
        <div className="flex-1 w-full">
          <div className="flex items-end gap-2">
            <span className="whitespace-nowrap">
              Employer's Reference No., if any
            </span>
            <span className="flex-1 border-b border-black h-6"></span>
          </div>
        </div>
        <div className="flex-1 w-full flex flex-col items-start md:items-start print:items-start">
          <span className="border-t border-black w-full pt-1 text-xs text-center md:text-left print:text-left">
            Signature of the employer/Officer authorised
          </span>
          <span className="text-xs w-full text-center md:text-left print:text-left">
            Designation
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row print:flex-row justify-between items-start gap-12 mt-12">
        <div className="w-full md:w-1/3 print:w-1/3">
          <div className="flex items-end gap-2">
            <span>Date:</span>
            <span className="flex-1 border-b border-black h-6"></span>
          </div>
        </div>
        <div className="flex-1 w-full flex flex-col items-start pl-0 md:pl-12 print:pl-12">
          <span className="text-xs mb-8">
            Name and address of the establishment or rubber stamp thereof.
          </span>
        </div>
      </div>
    </div>
  );
};

export default GratuityEmployerCertificate;
