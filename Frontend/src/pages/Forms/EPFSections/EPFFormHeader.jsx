import React from "react";

const EPFFormHeader = () => {
  return (
    <>
      <div className="relative mb-6">
        <div className="flex justify-between items-start">
          <img
            src={`${import.meta.env.BASE_URL}epf form logo.webp`}
            alt="EPF Logo"
            className="w-20"
            onError={(e) => (e.target.style.display = "none")}
          />
          <div className="text-right text-xs">
            <p className="font-bold">New Form : 11 - Declaration Form</p>
            <p>(To be retained by the employer for future reference)</p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm mb-6">
        <p>Employees' Provident Fund Scheme, 1952 (Paragraph 34 & 57) and</p>
        <p>Employees' Pension Scheme, 1995 (Paragraph 24)</p>
        <p className="text-xs italic mt-1">
          (Declaration by a person taking up Employment in any Establishment on
          which EPF Scheme, 1952 and for EPS, 1995 is applicable)
        </p>
      </div>
    </>
  );
};

export default EPFFormHeader;
