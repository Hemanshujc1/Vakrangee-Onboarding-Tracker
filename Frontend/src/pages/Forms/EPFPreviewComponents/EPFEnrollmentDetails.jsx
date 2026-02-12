import React from "react";

const EPFEnrollmentDetails = ({ getValue, formatDate, renderYesNo }) => {
  return (
    <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full">
      <table className="w-full min-w-150 border border-black border-t-0 text-xs text-center mt-4 print:w-full print:min-w-0">
        <tbody>
          <tr className="h-10">
            <td className="border border-black p-1 text-sm w-8" rowSpan={2}>
              12.
            </td>
            <td className="border border-black p-1 w-30">
              First EPF Member Enrolled Date
            </td>
            <td className="border border-black p-1 w-30">
              First Employment EPF Wages
            </td>
            <td className="border border-black p-1 w-30">
              Are you EPF Member before <br />{" "}
              <span className="text-red-600 font-bold">01/09/2014</span>
            </td>
            <td className="border border-black p-1 w-30">
              If <span className="text-red-600 font-bold">Yes, EPF</span> <br />{" "}
              Amount Withdrawn?
            </td>
            <td className="border border-black p-1">
              If{" "}
              <span className="text-red-600 font-bold">Yes, EPS (Pension)</span>{" "}
              <br /> Amount Withdrawn?
            </td>
            <td className="border border-black p-1">
              After Sep 2014 earned{" "}
              <span className="text-red-600 font-bold">EPS (Pension)</span>{" "}
              Amount Withdrawn before Join current Employer?
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 font-bold">
              {formatDate(getValue("first_epf_enrolled_date"))}
            </td>
            <td className="border border-black p-1 font-bold">
              {getValue("first_epf_wages")}
            </td>
            <td className="border border-black p-1 font-bold">
              {renderYesNo(getValue("pre_2014_member", "No"))}
            </td>
            <td className="border border-black p-1 font-bold">
              {renderYesNo(getValue("withdrawn_epf", "No"))}
            </td>
            <td className="border border-black p-1 font-bold">
              {renderYesNo(getValue("withdrawn_eps", "No"))}
            </td>
            <td className="border border-black p-1 font-bold">
              {renderYesNo(getValue("post_2014_eps_withdrawn", "No"))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default EPFEnrollmentDetails;
