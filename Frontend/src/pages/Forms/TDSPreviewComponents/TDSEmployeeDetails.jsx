import React from "react";
import { formatToday } from "../../../utils/basicInfoHelpers";

const TDSEmployeeDetails = ({ formData, signaturePreview }) => {
  return (
    <div className="mt-8 mb-6 p-6 print:bg-white print:border-black break-inside-avoid">
      <div className="flex flex-col gap-3 text-sm">
        <div>
          <span className="font-bold min-w-37.5 inline-block">Name:</span>
          {formData.employee_name}
        </div>
        <div className="flex items-start">
          <span className="font-bold min-w-37.5 inline-block">Address:</span>
          <span className="flex-1">
            {[
              formData.address_line1,
              formData.address_line2,
              formData.landmark,
              formData.city,
              formData.district,
              formData.state,
              formData.pincode,
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
        </div>
        <div>
          <span className="font-bold min-w-37.5 inline-block">
            Designation:
          </span>
          {formData.job_title}
        </div>
        <div>
          <span className="font-bold min-w-37.5 inline-block">
            Employee Code:
          </span>
          {formData.employee_id}
        </div>

        <div>
          <span className="font-bold min-w-37.5 inline-block">PAN No:</span>
          {formData.pan_no}
        </div>
        <div>
          <span className="font-bold min-w-37.5 inline-block">Date:</span>
          {formatToday()}
        </div>

        {/* Signature Block */}
        <div className="mt-4 flex items-center">
          <span className="font-bold min-w-37.5 inline-block">Signature:</span>
          <div className="flex flex-col items-center">
            <div className="h-16 min-w-[200px] flex items-end justify-center border-b border-black border-dotted pb-1">
              {signaturePreview ? (
                <img
                  src={signaturePreview}
                  alt="Signature"
                  className="max-h-14 w-auto object-contain"
                />
              ) : formData.signature_path ? (
                <img
                  src={`/uploads/signatures/${formData.signature_path}`}
                  alt="Signature"
                  className="max-h-14 w-auto object-contain"
                />
              ) : null}
            </div>
            <p className="text-xs font-bold mt-1">(Signature of Employee)</p>
          </div>
        </div>
        <div>
          <span className="font-bold min-w-37.5 inline-block">Contact No:</span>
          {formData.contact_no}
        </div>
      </div>
    </div>
  );
};

export default TDSEmployeeDetails;
