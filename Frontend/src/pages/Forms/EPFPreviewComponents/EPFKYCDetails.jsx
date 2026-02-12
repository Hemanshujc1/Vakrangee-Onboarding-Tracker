import React from "react";

const EPFKYCDetails = ({ getValue, data }) => {
  return (
    <>
      {/* 11. KYC Details */}
      <tr>
        <td className="border border-black p-1 text-center text-sm" rowSpan={4}>
          11.
        </td>
        <td className="border border-black p-1 font-bold">
          KYC Details :{" "}
          <span className="font-normal text-[10px]">
            (attach self attested copies of following KYC's)
          </span>
        </td>
        <td className="border border-black p-2 italic text-[10px] text-gray-600">
          Must Enclose Scan copy for the following documents
        </td>
      </tr>
      <tr>
        <td className="border border-black p-1 pl-1">
          a) Bank Account No. & IFS Code
        </td>
        <td className="border border-black p-1 pl-2 font-bold">
          {getValue("bank_account_no")}{" "}
          {getValue("ifsc_code") ? `& ${getValue("ifsc_code")}` : ""}
        </td>
      </tr>
      <tr>
        <td className="border border-black p-1 pl-1">b) AADHAR Number</td>
        <td className="border border-black p-1 pl-2 font-bold">
          {getValue("aadhaar_no", data.aadhaar)}
        </td>
      </tr>
      <tr>
        <td className="border border-black p-1 pl-1">
          c) Permanent Account Number (PAN), If available
        </td>
        <td className="border border-black p-1 pl-2 font-bold">
          {getValue("pan_no", data.panNo)}
        </td>
      </tr>
    </>
  );
};

export default EPFKYCDetails;
