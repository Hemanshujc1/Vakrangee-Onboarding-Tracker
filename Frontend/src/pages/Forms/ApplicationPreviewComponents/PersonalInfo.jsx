import React from "react";

const PersonalInfo = ({ formData, formatDate }) => {
  return (
    <>
      {/* Name Section - Desktop/Print Table */}
      <div className="hidden md:block print:block overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full mb-4">
        <table className="w-full min-w-125 print:min-w-0">
          <tbody>
            <tr className="bg-[#e6e6e6]">
              <td className="p-1 font-bold w-24">Name:</td>
              <td className="p-1 uppercase">{formData.lastname}</td>
              <td className="p-1 uppercase">{formData.firstname}</td>
              <td className="p-1 uppercase">{formData.middlename}</td>
              <td className="p-1 uppercase">{formData.Maidenname}</td>
            </tr>
            <tr className="text-[10px] font-bold">
              <td className="px-1"></td>
              <td className="px-1">Last</td>
              <td className="px-1">First</td>
              <td className="px-1">Middle</td>
              <td className="px-1">Maiden</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Name Section - Mobile Grid */}
      <div className="md:hidden print:hidden grid grid-cols-2 gap-2 mb-4 bg-[#e6e6e6] p-2">
        <div className="col-span-2 font-bold border-b border-gray-400 pb-1 mb-1">
          Name
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-600">Last</div>
          <div className="uppercase">{formData.lastname}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-600">First</div>
          <div className="uppercase">{formData.firstname}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-600">Middle</div>
          <div className="uppercase">{formData.middlename}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-600">Maiden</div>
          <div className="uppercase">{formData.Maidenname}</div>
        </div>
      </div>

      <div className="mb-4 bg-[#e6e6e6] p-1 flex flex-col md:flex-row print:flex-row gap-2 md:gap-4 print:gap-4">
        <span className="font-bold w-full md:w-48 print:w-48">
          Address For Communication:
        </span>
        <span className="flex-1">{formData.currentAddress}</span>
      </div>

      <div className="mb-4 bg-[#e6e6e6] p-1 flex flex-col md:flex-row print:flex-row gap-2 md:gap-4 print:gap-4">
        <span className="font-bold w-full md:w-48 print:w-48">
          Permanent Address:
        </span>
        <span className="flex-1">{formData.permanentAddress}</span>
      </div>

      {/* Contact Info - Desktop/Print Table */}
      <div className="hidden md:block print:block overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full mb-4">
        <table className="w-full min-w-150 print:min-w-0">
          <tbody>
            <tr className="bg-[#e6e6e6]">
              <td className="p-1 font-bold w-24">Mobile No:</td>
              <td className="p-1 w-32">{formData.mobileNo}</td>
              <td className="p-1 font-bold w-24">Alternate No:</td>
              <td className="p-1 w-32">{formData.alternateNo}</td>
              <td className="p-1 font-bold w-20">E-mail ID:</td>
              <td className="p-1">{formData.email}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Contact Info - Mobile Stack */}
      <div className="md:hidden print:hidden flex flex-col gap-2 mb-4 bg-[#e6e6e6] p-2">
        <div className="flex justify-between border-b border-gray-300 pb-1">
          <span className="font-bold">Mobile No:</span>
          <span>{formData.mobileNo}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-1">
          <span className="font-bold">Alternate No:</span>
          <span>{formData.alternateNo}</span>
        </div>
        <div className="flex flex-col border-b border-gray-300 pb-1">
          <span className="font-bold">E-mail ID:</span>
          <span className="break-all">{formData.email}</span>
        </div>
      </div>

      {/* Emergency/Gender - Desktop/Print Table */}
      <div className="hidden md:block print:block overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full mb-4">
        <table className="w-full min-w-150 print:min-w-0">
          <tbody>
            <tr className="bg-[#e6e6e6]">
              <td className="p-1 font-bold w-24">Emergency No:</td>
              <td className="p-1 w-32">{formData.emergencyNo}</td>
              <td className="p-1 font-bold w-16">Gender:</td>
              <td className="p-1 uppercase w-20">{formData.gender}</td>
              <td className="p-1 font-bold w-12">Age:</td>
              <td className="p-1 w-12">{formData.age}</td>
              <td className="p-1 font-bold w-12">DOB:</td>
              <td className="p-1">{formatDate(formData.dob)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Emergency/Gender - Mobile Grid */}
      <div className="md:hidden print:hidden grid grid-cols-2 gap-y-2 gap-x-4 mb-4 bg-[#e6e6e6] p-2">
        <div className="col-span-2 flex justify-between border-b border-gray-300 pb-1">
          <span className="font-bold">Emergency No:</span>
          <span>{formData.emergencyNo}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xs text-gray-600">Gender</span>
          <span className="uppercase">{formData.gender}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xs text-gray-600">Age</span>
          <span>{formData.age}</span>
        </div>
        <div className="col-span-2 flex justify-between border-t border-gray-300 pt-1 mt-1">
          <span className="font-bold">DOB:</span>
          <span>{formatDate(formData.dob)}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row print:flex-row bg-[#e6e6e6] mb-6 gap-2 md:gap-0 print:gap-0 p-1 md:p-0 print:p-0">
        <div className="p-1 font-bold md:w-40 print:w-40">
          Position Applied For:
        </div>
        <div className="p-1 uppercase md:w-64 print:w-64">
          {formData.positionApplied}
        </div>
        <div className="p-1 font-bold flex-1 md:text-right print:text-right pr-4">
          Currently Employed:{" "}
          <span className="ml-2 font-normal whitespace-nowrap">
            Yes {formData.currentlyEmployed === "Yes" ? "☑" : "☐"} / No{" "}
            {formData.currentlyEmployed === "No" ? "☑" : "☐"}
          </span>
        </div>
      </div>
    </>
  );
};

export default PersonalInfo;
