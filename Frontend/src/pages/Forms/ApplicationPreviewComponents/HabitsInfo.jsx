import React from "react";

const HabitsInfo = ({ formData }) => {
  return (
    <div className="border border-black p-2 mb-6 flex flex-col md:flex-row print:flex-row items-start md:items-center print:items-center justify-between gap-2 md:gap-0 print:gap-0">
      <div className="font-bold md:font-normal">
        Do you have following habits:
      </div>
      <div className="flex items-center justify-between w-full md:w-auto">
        Smoking:{" "}
        <span className="border border-black px-4 ml-1 inline-block">
          {formData.smoking}
        </span>
      </div>
      <div className="flex items-center justify-between w-full md:w-auto">
        Chewing Tobacco:{" "}
        <span className="border border-black px-4 ml-1 inline-block">
          {formData.tobacco}
        </span>
      </div>
      <div className="flex items-center justify-between w-full md:w-auto">
        Drinking Liquor:{" "}
        <span className="border border-black px-4 ml-1 inline-block">
          {formData.liquor}
        </span>
      </div>
    </div>
  );
};

export default HabitsInfo;
