import React from "react";

const EPFHeader = () => {
  return (
    <div className="relative mb-2 flex flex-col md:block print:block">
      <div className="flex justify-between items-start md:block print:block mb-4 md:mb-0 print:mb-0">
        {/* Logo */}
        <div className="relative md:absolute md:top-4 md:left-0 print:absolute print:top-4 print:left-0">
          <img
            src={`${import.meta.env.BASE_URL}epf form logo.webp`}
            alt="EPF Logo"
            className="w-16 h-auto"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
        {/* Right Text */}
        <div className="text-right md:absolute md:top-0 md:right-0 print:absolute print:top-0 print:right-0">
          <h3 className="font-semibold text-xs">
            New Form : 11 - Declaration Form
          </h3>
          <p className="text-[10px]">
            (To be retained by the employer for future reference)
          </p>
        </div>
      </div>

      <div className="items-center pt-0 md:pt-10 print:pt-10">
        <div className="text-center flex-1">
          <h2 className="font-bold text-[15px] text-[#0066cc] uppercase">
            EMPLOYEES' PROVIDENT FUND ORGANISATION
          </h2>
          <p className="">
            Employees' Provident Fund Scheme, 1952 (Paragraph 34 & 57) and
          </p>
          <p className="">Employees' Pension Scheme, 1995 (Paragraph 24)</p>
          <p className="text-[10px] mt-1">
            (Declaration by a person taking up Employment in any Establishment
            on which EPF Scheme, 1952 and for EPS, 1995 is applicable)
          </p>
        </div>
      </div>
    </div>
  );
};

export default EPFHeader;
