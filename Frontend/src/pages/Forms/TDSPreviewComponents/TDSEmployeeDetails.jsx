import React from "react";

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
          {new Date().toLocaleDateString()}
        </div>

        {/* Signature Block */}
        <div className="mt-1 pt-4 flex items-end">
          <span className="font-bold min-w-37.5 inline-block">Signature:</span>
          <div>
            {signaturePreview ? (
              <img
                src={signaturePreview}
                alt="Signature"
                className="h-16 w-auto p-1"
              />
            ) : formData.signature_path ? (
              <img
                src={`/uploads/signatures/${formData.signature_path}`}
                alt="Signature"
                className="h-16 w-auto p-1"
              />
            ) : (
              <div className="h-16 w-48 flex items-center justify-center text-xs text-gray-400">
                No Signature
              </div>
            )}
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
