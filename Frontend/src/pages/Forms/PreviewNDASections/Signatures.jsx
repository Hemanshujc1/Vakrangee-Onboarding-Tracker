import React from "react";
import { formatToday } from "../../../utils/basicInfoHelpers";

const Signatures = ({ formData, finalSignature }) => {
  return (
    <div className="mt-16 pt-8 flex flex-col md:flex-row print:flex-row gap-8 justify-between items-start md:items-end print:items-end text-sm break-inside-avoid">
      {/* Left: Company */}
      <div className="flex-1 w-full md:w-auto">
        <div className="font-bold uppercase mb-16">
          For Vakrangee Ltd.
        </div>

        <div className="border-t border-dashed border-black pt-2 w-full max-w-62.5">
          Authorised Signatory
        </div>

        <div className="mt-6 flex items-end gap-2">
          <span className="uppercase">Date:</span>
          <span className="border-b border-dashed border-black w-32 inline-block"></span>
        </div>
      </div>

      {/* Right: Employee (Accepted) */}
      <div className="flex-1 w-full md:w-auto flex flex-col items-start md:items-end print:items-end text-left md:text-right print:text-right">
        <div className="font-bold uppercase mb-4 text-left w-full md:pl-8 print:pl-8">
          Accepted
          <div className="font-normal border-b border-black w-full md:w-48 print:w-48 inline-block md:mx-3 print:mx-3 mt-2 md:mt-0 print:mt-0">
            {/* Signature Image */}
            <div className="mb-2 w-full flex justify-start md:justify-end print:justify-end">
              {finalSignature ? (
                <img
                  src={finalSignature}
                  alt="Signature"
                  className="h-12 object-contain"
                />
              ) : (
                <div className="h-12 w-32"></div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-end gap-2 w-full md:pl-8 print:pl-8 justify-between">
          <span className="uppercase font-bold">Name</span>
          <span className="border-b border-black flex-1 text-center font-bold uppercase text-sm px-2 pb-0.5">
            {formData.employee_full_name}
          </span>
        </div>

        <div className="mt-6 flex items-end gap-2 w-full md:pl-8 print:pl-8 justify-between">
          <span className="uppercase">Date:</span>
          <span className="border-b border-black flex-1 text-center text-sm px-2 pb-0.5">
            {formatToday()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signatures;
