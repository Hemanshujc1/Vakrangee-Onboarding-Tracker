import React from "react";

const Parties = ({ formData }) => {
  return (
    <div className="space-y-6 mb-8 text-sm">
      {/* Between */}
      <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] print:grid-cols-[100px_1fr] gap-2 md:gap-0">
        <div className="font-bold">Between:</div>
        <div>
          <div className="flex flex-col md:flex-row print:flex-row md:items-end print:items-end">
            <div className="flex-1 border-b border-black px-2 pb-0.5 font-bold uppercase">
              {formData.employee_full_name}
            </div>
            <div className="md:ml-2 print:ml-2 whitespace-nowrap mt-1 md:mt-0 print:mt-0">
              (the "Employee")
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-800">
            An individual with its main address at:
          </div>
          <div className="border-b border-black mt-1 px-2 pb-0.5">
            {[
              formData.address_line1,
              formData.address_line2,
              formData.landmark,
              formData.post_office,
            ]
              .filter(Boolean)
              .join(", ")}
          </div>
          <div className="border-b border-black mt-1 px-2 pb-0.5">
            {[
              formData.district,
              formData.city && formData.pincode
                ? `${formData.city} - ${formData.pincode}`
                : formData.city || formData.pincode,
              formData.state,
            ]
              .filter(Boolean)
              .join(", ")}
          </div>
        </div>
      </div>

      {/* And */}
      <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] print:grid-cols-[100px_1fr] gap-2 md:gap-0">
        <div className="font-bold">And:</div>
        <div className="text-justify">
          <span className="font-bold">Vakrangee Limited</span> a
          corporation organized and existing under 'Companies Act, 1956'
          and having its Head office located at:
          <div className="mt-2 underline text-gray-800">
            Plot No. 93, Road No-16, M.I.D.C., Marol, Andheri (East),
            Mumbai: - 400093, Maharashtra.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parties;
