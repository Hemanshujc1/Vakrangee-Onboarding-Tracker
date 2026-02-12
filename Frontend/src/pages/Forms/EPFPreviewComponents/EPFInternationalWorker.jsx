import React from "react";

const EPFInternationalWorker = ({ getValue, formatDate, renderYesNo }) => {
  return (
    <>
      {/* 10. International Worker */}
      <tr>
        <td className="border border-black p-1 text-center text-sm" rowSpan={4}>
          10.
        </td>
        <td className="border border-black p-1 pl-1">
          a) International Worker
        </td>
        <td className="border border-black p-1 pl-2 text-center font-bold uppercase">
          {renderYesNo(getValue("international_worker", "No"))}
        </td>
      </tr>
      <tr>
        <td className="border border-black p-1 pl-1">
          b) If Yes, state country of origin (name of other country)
        </td>
        <td className="border border-black p-1 pl-2 font-bold">
          {getValue("country_of_origin")}
        </td>
      </tr>
      <tr>
        <td className="border border-black p-1 pl-1">c) Passport No.</td>
        <td className="border border-black p-1 pl-2 font-bold">
          {getValue("passport_no")}
        </td>
      </tr>
      <tr>
        <td className="border border-black p-1 pl-1">
          d) Validity of passport (dd/mm/yyyy) to (dd/mm/yyyy)
        </td>
        <td className="border border-black p-1 pl-2 font-bold">
          {getValue("passport_valid_from") && getValue("passport_valid_to")
            ? `${formatDate(
                getValue("passport_valid_from"),
              )} to ${formatDate(getValue("passport_valid_to"))}`
            : ""}
        </td>
      </tr>
    </>
  );
};

export default EPFInternationalWorker;
