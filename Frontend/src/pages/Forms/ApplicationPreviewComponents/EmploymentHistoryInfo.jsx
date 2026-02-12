import React from "react";

const EmploymentHistoryInfo = ({ employmentHistory, formatDate }) => {
  return (
    <>
      <div className="mb-1 font-bold text-sm">Employment History</div>
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full mb-6">
        <table className="w-full min-w-150 print:min-w-0 border-collapse border border-black mb-6">
          <thead className="bg-[#b3b3b3] text-center">
            <tr>
              <th rowSpan={2} className="border border-black p-1 w-48">
                Name of Company
              </th>
              <th colSpan={2} className="border border-black p-1">
                Period Worked
              </th>
              <th rowSpan={2} className="border border-black p-1">
                Designation
              </th>
              <th rowSpan={2} className="border border-black p-1">
                CTC Details
              </th>
              <th rowSpan={2} className="border border-black p-1">
                Reporting Officer
              </th>
            </tr>
            <tr>
              <th className="border border-black p-1 w-20">From</th>
              <th className="border border-black p-1 w-20">To</th>
            </tr>
          </thead>
          <tbody>
            {employmentHistory.map((item, idx) => (
              <tr key={idx} className="border-b border-black h-8">
                <td className="border-r border-black p-1 uppercase">
                  {item.employer}
                </td>
                <td className="border-r border-black p-1 text-center">
                  {formatDate(item.fromDate)}
                </td>
                <td className="border-r border-black p-1 text-center">
                  {formatDate(item.toDate)}
                </td>
                <td className="border-r border-black p-1 uppercase">
                  {item.designation}
                </td>
                <td className="border-r border-black p-1">{item.ctc}</td>
                <td className="p-1 uppercase">{item.reportingOfficer}</td>
              </tr>
            ))}
            {[...Array(Math.max(0, 5 - employmentHistory.length))].map(
              (_, i) => (
                <tr
                  key={`empty-hist-${i}`}
                  className="border-b border-black h-8 bg-[#ffffcc]"
                >
                  <td className="border-r border-black bg-[#ffffcc]"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td></td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default EmploymentHistoryInfo;
