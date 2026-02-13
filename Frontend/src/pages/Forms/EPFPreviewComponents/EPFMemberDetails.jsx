import React from "react";

const EPFMemberDetails = ({ getValue, data, formatDate, renderYesNo }) => {
  return (
    <>
      {/* 1. Name */}
      <tr>
        <td className="border border-black p-1 text-center w-8 text-sm">1.</td>
        <td className="border border-black p-1 w-[45%] font-medium">
          Name of Member{" "}
          <span className="text-red-600 font-bold">(Aadhar Name)</span>
        </td>
        <td className="border border-black p-1 pl-2 font-bold uppercase">
          {getValue("member_name_aadhar", data.fullName)}
        </td>
      </tr>

      {/* 2. Father/Spouse Name */}
      <tr>
        <td className="border border-black p-1 text-center text-sm">2.</td>
        <td className="border border-black p-1">
          <div className="flex items-center">
            <span className="font-medium mr-2">Father's Name</span>
            <div className="border border-black w-4 h-4 flex items-center justify-center mr-4">
              {getValue("relationship_type") === "Father" && "✓"}
            </div>
            <span className="font-medium mr-2">Spouse's Name</span>
            <div className="border border-black w-4 h-4 flex items-center justify-center">
              {getValue("relationship_type") === "Spouse" && "✓"}
            </div>
          </div>
          <div className="text-[10px] italic mt-1">
            (Please tick whichever applicable)
          </div>
        </td>
        <td className="border border-black p-1 pl-2 uppercase font-bold">
          {getValue("relationship_type") === "Father"
            ? getValue("father_name")
            : getValue("spouse_name")}
        </td>
      </tr>

      {/* 3. DOB */}
      <tr>
        <td className="border border-black p-1 text-center text-sm">3.</td>
        <td className="border border-black p-1 font-medium">
          Date of Birth <span className="font-normal">(dd/mm/yyyy)</span>
        </td>
        <td className="border border-black p-1 pl-2 font-bold">
          {formatDate(getValue("dob", data.dateOfBirth))}
        </td>
      </tr>

      {/* 4. Gender */}
      <tr>
        <td className="border border-black p-1 text-center text-sm">4.</td>
        <td className="border border-black p-1 font-medium">
          Gender{" "}
          <span className="font-normal">(Male / Female / Transgender)</span>
        </td>
        <td className="border border-black p-1 pl-2 uppercase font-bold">
          {getValue("gender", data.gender)}
        </td>
      </tr>

      {/* 5. Marital Status */}
      <tr>
        <td className="border border-black p-1 text-center text-sm">5.</td>
        <td className="border border-black p-1 font-medium">
          Marital Status{" "}
          <span className="font-normal text-[10px]">
            (Single/Married/Widow/Widower/Divorcee)
          </span>
        </td>
        <td className="border border-black p-1 pl-2 uppercase font-bold">
          {getValue("marital_status")}
        </td>
      </tr>

      {/* 6. Contact Info */}
      <tr>
        <td className="border border-black p-1 text-center text-sm">6.</td>
        <td className="border border-black py-1">
          <div className="font-medium px-1">(a) Email ID</div>
          <div className="font-medium border-t border-black mt-1 pt-1 px-1">
            (b) Mobile No{" "}
            <span className="text-red-600 font-bold">(Aadhar Registered)</span>
          </div>
        </td>
        <td className="border border-black py-1 font-bold">
          <div className="px-2">{getValue("email", data.email)}</div>
          <div className="border-t border-black mt-1 pt-1 px-2">
            {getValue("mobile", data.phone)}
          </div>
        </td>
      </tr>

      {/* 7. Previous EPF Member */}
      <tr>
        <td className="border border-black p-1 text-center text-sm">7.</td>
        <td className="border border-black p-1 font-medium">
          Whether earlier member of the Employee's Provident Fund Scheme, 1952 ?
        </td>
        <td className="border border-black p-1 pl-2 font-bold text-center uppercase">
          {renderYesNo(getValue("prev_epf_member", "No"))}
        </td>
      </tr>

      {/* 8. Previous EPS Member */}
      <tr>
        <td className="border border-black p-1 text-center text-sm">8.</td>
        <td className="border border-black p-1 font-medium">
          Whether earlier member of the Employee's Pension Scheme, 1995 ?
        </td>
        <td className="border border-black p-1 pl-2 font-bold text-center uppercase">
          {renderYesNo(getValue("prev_eps_member", "No"))}
        </td>
      </tr>
    </>
  );
};

export default EPFMemberDetails;
