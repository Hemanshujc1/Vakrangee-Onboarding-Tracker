import React from "react";

const PersonalDetails = ({ data, formatDate }) => {
  return (
    <>
      {/* Personal Details Heading */}
      <div className="text-center font-bold underline mb-6 text-lg">
        Personal Details
      </div>

      {/* Personal Details - Specific Layout */}
      <div className="space-y-4 text-sm mb-8 px-2 md:px-0">
        {/* Employee Full Name */}
        <div className="flex flex-col md:flex-row md:items-start print:flex-row print:items-start">
          <div className="w-full md:w-48 print:w-48 font-bold shrink-0">
            Employee Full Name:
          </div>
          <div className="flex-1 flex w-full md:max-w-[80%] print:max-w-[80%]">
            <div className="flex-1 border-b border-black border-dotted leading-none pt-1 uppercase">
              {data.employee_full_name}
            </div>
          </div>
        </div>

        {/* Date Of Birth */}
        <div className="flex flex-col md:flex-row md:items-start print:flex-row print:items-start">
          <div className="w-full md:w-48 print:w-48 font-bold shrink-0">
            Date Of birth:
          </div>
          <div className="flex-1 flex w-full md:max-w-[50%] print:max-w-[50%]">
            <div className="flex-1 border-b border-black border-dotted leading-none pt-1">
              {formatDate(data.date_of_birth)}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col md:flex-row md:items-start print:flex-row print:items-start">
          <div className="w-full md:w-48 print:w-48 font-bold shrink-0 mt-0 md:mt-1 print:mt-1">
            Address:
          </div>
          <div className="flex-1 flex w-full md:max-w-[80%] print:max-w-[80%]">
            <div className="flex-1 flex flex-col gap-1">
              <div className="border-b border-black border-dotted min-h-[1.5em]">
                {data.address_line1}
              </div>
              {(data.address_line2 || data.landmark || data.city) && (
                <div className="border-b border-black border-dotted min-h-[1.5em]">
                  {[data.address_line2, data.landmark, data.post_office]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
              <div className="border-b border-black border-dotted min-h-[1.5em]">
                {`${data.city}, ${data.district}, ${data.state} - ${data.pincode}`}
              </div>
            </div>
          </div>
        </div>

        {/* Gender */}
        <div className="flex flex-col md:flex-row md:items-start print:flex-row print:items-start">
          <div className="w-full md:w-48 print:w-48 font-bold shrink-0">
            Gender:
          </div>
          <div className="flex-1 flex w-full md:max-w-[50%] print:max-w-[50%]">
            <div className="flex-1 border-b border-black border-dotted leading-none pt-1">
              {data.gender}
            </div>
          </div>
        </div>

        {/* Marital Status */}
        <div className="flex flex-col md:flex-row md:items-start print:flex-row print:items-start">
          <div className="w-full md:w-48 print:w-48 font-bold shrink-0">
            Marital Status:
          </div>
          <div className="flex-1 flex w-full md:max-w-[50%] print:max-w-[50%]">
            <div className="flex-1 border-b border-black border-dotted leading-none pt-1">
              {data.marital_status}
            </div>
          </div>
        </div>

        {/* Mobile No. */}
        <div className="flex flex-col md:flex-row md:items-start print:flex-row print:items-start">
          <div className="w-full md:w-48 print:w-48 font-bold shrink-0">
            Mobile No. :
          </div>
          <div className="flex-1 flex w-full md:max-w-[50%] print:max-w-[50%]">
            <div className="flex-1 border-b border-black border-dotted leading-none pt-1">
              {data.mobile_number}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonalDetails;
