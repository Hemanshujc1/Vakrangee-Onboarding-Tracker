import React from "react";

const EPFPreviousEmployment = ({ getValue, formatDate }) => {
  return (
    <>
      {/* 9. Previous Employment Details */}
      <tr>
        <td className="border border-black p-1 text-center text-sm" rowSpan={6}>
          9.
        </td>
        <td className="border-r border-black p-1 font-bold text-red-600">
          <span className="text-black">Previous Employment details ?</span> (If
          Yes, 7 & 8 details above)
        </td>
        <td className="border font-bold pl-2 border-black" rowSpan={2}>
          {getValue("uan_number")}
        </td>
      </tr>
      <tr>
        <td className="border-b border-black p-1 pl-1">
          a) Universal Account Number (UAN)
        </td>
      </tr>
      <tr>
        <td className="border border-black p-1 pl-1">
          b) Previous PF Account Number
        </td>
        <td className="border border-black p-1 pl-2 font-bold">
          {getValue("prev_pf_number")}
        </td>
      </tr>
      <tr>
        <td className="border border-black p-1 pl-1">
          c) Date of Exit from previous Employment ? (dd/mm/yyyy)
        </td>
        <td className="border border-black p-1 pl-2 font-bold">
          {formatDate(getValue("date_of_exit_prev"))}
        </td>
      </tr>
      <tr>
        <td className="border border-black p-1 pl-1">
          d) Scheme Certificate No (If issued)
        </td>
        <td className="border border-black p-1 pl-2 font-bold">
          {getValue("scheme_cert_no")}
        </td>
      </tr>
      <tr>
        <td className="border border-black p-1 pl-1">
          e) Pension Payment Order (PPO) (If issued)
        </td>
        <td className="border border-black p-1 pl-2 font-bold">
          {getValue("ppo_no")}
        </td>
      </tr>
    </>
  );
};

export default EPFPreviousEmployment;
