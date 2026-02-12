import React from "react";
import { PrintSectionHeader } from "../../../Components/Forms/Shared/PrintComponents";

const EmploymentDetails = ({ data, formatDate }) => {
  return (
    <>
      <div className="print:break-before-page mt-8"></div>

      <PrintSectionHeader title="Employment Details (Fill in block letters)" />

      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full">
        <div className="min-w-175 print:min-w-0">
          {(data.employment_details || []).map((emp, index) => (
            <div
              key={index}
              className="border-x border-gray-800 mb-6 text-xs break-inside-avoid shadow-sm"
            >
              <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Company Name
                </div>
                <div className="p-1 uppercase flex items-center text-sm">
                  {emp.companyName}
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Address
                </div>
                <div className="p-1 uppercase flex items-center text-sm">
                  {emp.address}
                </div>
              </div>

              <div className="flex border-b border-gray-800">
                <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Employment Type
                </div>
                <div className="flex-1 flex items-center justify-around">
                  {["Full Time", "Consultants", "Contractual", "Temporary"].map(
                    (type) => (
                      <div
                        key={type}
                        className="flex items-center gap-1 border-r border-gray-800 last:border-0 h-full px-2 flex-1 justify-center"
                      >
                        <span className="font-semibold mr-1">{type}</span>
                        <div className="w-4 h-4 border border-gray-800 flex items-center justify-center">
                          {emp.empType === type && "✓"}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Employee Code
                </div>
                <div className="p-1 uppercase flex items-center">
                  {emp.empCode}
                </div>
              </div>

              <div className="flex border-b border-gray-800">
                <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Tenure
                </div>
                <div className="flex-1 flex">
                  <div className="flex flex-1 items-center border-r border-gray-800">
                    <span className="px-2 font-semibold bg-gray-50 h-full flex items-center border-r border-gray-800">
                      Start Date
                    </span>
                    <span className="px-2 flex-1 text-center font-mono">
                      {formatDate(emp.startDate)}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center">
                    <span className="px-2 font-semibold bg-gray-50 h-full flex items-center border-r border-gray-800">
                      End Date
                    </span>
                    <span className="px-2 flex-1 text-center font-mono">
                      {formatDate(emp.endDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Position Held
                </div>
                <div className="p-1 uppercase flex items-center">
                  {emp.position}
                </div>
              </div>

              <div className="flex border-b border-gray-800">
                <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Compensation
                </div>
                <div className="flex-1 flex items-center p-1">
                  <span className="font-semibold mr-2">INR (Rupees)</span>
                  <span className="flex-1 border-b border-dotted border-gray-800 uppercase px-1">
                    {emp.compensation}
                  </span>
                  <span className="font-semibold ml-2">Per Annum</span>
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  City Last Worked
                </div>
                <div className="p-1 uppercase flex items-center">
                  {emp.city}
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] border-b border-gray-800 bg-gray-100">
                <div className="p-1 font-bold border-r border-gray-800 flex items-center">
                  HR Representative
                </div>
                <div className="p-1 uppercase font-bold">{emp.hrRep}</div>
              </div>

              <div className="flex border-b border-gray-800">
                <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Telephone No.
                </div>
                <div className="flex-1 flex text-xs">
                  <div className="flex-1 border-r border-gray-800 p-1 uppercase">
                    {emp.hrTel}
                  </div>
                  <div className="w-20 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50 justify-center">
                    Mobile
                  </div>
                  <div className="flex-1 p-1 uppercase">{emp.hrMob}</div>
                </div>
              </div>
              <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Email
                </div>
                <div className="p-1 lowercase flex items-center">
                  {emp.hrEmail}
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] border-b border-gray-800 bg-gray-100">
                <div className="p-1 font-bold border-r border-gray-800 flex items-center">
                  Supervisor Name
                </div>
                <div className="p-1 uppercase font-bold">
                  {emp.supervisorName}
                </div>
              </div>

              <div className="flex border-b border-gray-800">
                <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Telephone No.
                </div>
                <div className="flex-1 flex text-xs">
                  <div className="flex-1 border-r border-gray-800 p-1 uppercase">
                    {emp.supTel}
                  </div>
                  <div className="w-20 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50 justify-center">
                    Mobile
                  </div>
                  <div className="flex-1 p-1 uppercase">{emp.supMob}</div>
                </div>
              </div>
              <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Email
                </div>
                <div className="p-1 lowercase flex items-center">
                  {emp.supEmail}
                </div>
              </div>
              <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Designation
                </div>
                <div className="p-1 uppercase flex items-center">
                  {emp.designation}
                </div>
              </div>

              <div className="flex border-b border-gray-800">
                <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Reporting Period
                </div>
                <div className="flex-1 flex">
                  <div className="flex flex-1 items-center border-r border-gray-800 text-[10px]">
                    <span className="px-2 font-semibold bg-gray-50 h-full flex items-center border-r border-gray-800">
                      Start Date
                    </span>
                    <span className="px-2 flex-1 text-center font-mono">
                      {formatDate(emp.reportStartDate || emp.startDate)}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center text-[10px]">
                    <span className="px-2 font-semibold bg-gray-50 h-full flex items-center border-r border-gray-800">
                      End Date
                    </span>
                    <span className="px-2 flex-1 text-center font-mono">
                      {formatDate(emp.reportEndDate || emp.endDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-800 p-1 text-[9px] italic text-left">
                In case the reporting period to the above Referee is less than 9
                months or any other Supervisor in the above stated tenure,
                Kindly give details of the next reporting Supervisor.
              </div>

              <div className="grid grid-cols-[140px_1fr] border-b border-gray-800 bg-gray-100">
                <div className="p-1 font-bold border-r border-gray-800 flex items-center">
                  Supervisor Name
                </div>
                <div className="p-1 uppercase font-bold">
                  {emp.supervisorName2}
                </div>
              </div>

              <div className="flex border-b border-gray-800">
                <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Telephone No.
                </div>
                <div className="flex-1 flex text-xs">
                  <div className="flex-1 border-r border-gray-800 p-1 uppercase">
                    {emp.supTel2}
                  </div>
                  <div className="w-20 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50 justify-center">
                    Mobile
                  </div>
                  <div className="flex-1 p-1 uppercase">{emp.supMob2}</div>
                </div>
              </div>
              <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Email
                </div>
                <div className="p-1 lowercase flex items-center">
                  {emp.supEmail2}
                </div>
              </div>
              <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Designation
                </div>
                <div className="p-1 uppercase flex items-center">
                  {emp.designation2}
                </div>
              </div>

              <div className="flex border-b border-gray-800">
                <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
                  Reporting Period
                </div>
                <div className="flex-1 flex">
                  <div className="flex flex-1 items-center border-r border-gray-800 text-[10px]">
                    <span className="px-2 font-semibold bg-gray-50 h-full flex items-center border-r border-gray-800">
                      Start Date
                    </span>
                    <span className="px-2 flex-1 text-center font-mono">
                      {formatDate(emp.reportStartDate2)}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center text-[10px]">
                    <span className="px-2 font-semibold bg-gray-50 h-full flex items-center border-r border-gray-800">
                      End Date
                    </span>
                    <span className="px-2 flex-1 text-center font-mono">
                      {formatDate(emp.reportEndDate2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50 h-24">
                  Nature of Responsibilities (In Brief)
                </div>
                <div className="p-1 whitespace-pre-wrap">{emp.duties}</div>
              </div>

              <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50 h-16">
                  Reasons for Leaving
                </div>
                <div className="p-1 whitespace-pre-wrap">
                  {emp.reasonLeaving}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EmploymentDetails;
