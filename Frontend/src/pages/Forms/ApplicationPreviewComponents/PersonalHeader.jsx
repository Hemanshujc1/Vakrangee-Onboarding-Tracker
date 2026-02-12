import React from "react";
import { DocumentHeader } from "../../../Components/Forms/Shared";

const PersonalHeader = ({ autoFillData }) => {
  return (
    <>
      <DocumentHeader
        title="Employment Application Form"
        className="bg-black"
      />

      {/* Profile Photo */}
      {autoFillData?.profilePhoto && (
        <div className="relative md:absolute print:absolute md:top-8 print:top-8 md:right-8 print:right-8 w-24 h-32 border border-black bg-white p-1 z-10 mb-4 md:mb-0 mx-auto md:mx-0">
          <img
            src={`/uploads/profilepic/${autoFillData.profilePhoto}`}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
      )}

      {/* Personal Info */}
      <div className="mb-2 mt-4 flex flex-col md:block print:block">
        <span className="font-bold underline text-sm">
          Personal Information: -
        </span>
        <span className="md:float-right print:float-right font-bold text-sm">
          Date: {new Date().toLocaleDateString("en-GB")}
        </span>
      </div>
    </>
  );
};

export default PersonalHeader;
