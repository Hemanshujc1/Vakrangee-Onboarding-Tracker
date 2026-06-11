import React from "react";

const TDSHeader = () => {
  return (
    <div className="flex flex-col justify-center items-center text-center mb-4 border-b-2 border-black">
      <img
        src={`${import.meta.env.BASE_URL}vakrangee-logo.png`}
        alt="Vakrangee Logo"
        className="h-16 w-auto mb-1"
      />
      <h1 className="font-bold text-xl uppercase">Vakrangee Limited</h1>
      <h2 className="font-bold text-xl uppercase mt-2">
        DECLARATION FOR T.D.S. AS PER INCOME TAX ACT
      </h2>
    </div>
  );
};

export default TDSHeader;
