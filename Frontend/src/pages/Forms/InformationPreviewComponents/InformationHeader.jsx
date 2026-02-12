import React from "react";

const InformationHeader = ({ data, record }) => {
  return (
    <div className="text-center mb-6 relative">
      <div className="flex flex-col md:block print:block">
        <img
          src={`${import.meta.env.BASE_URL}vakrangee-logo.svg`}
          alt="Vakrangee"
          className="h-20 mx-auto mb-2"
        />
        {(data.profile_photo_path ||
          record.profile_photo_path ||
          record.profile_photo ||
          record.profilePhoto) && (
          <img
            src={`/uploads/profilepic/${(
              data.profile_photo_path ||
              record.profile_photo_path ||
              record.profile_photo ||
              record.profilePhoto
            ).replace(/^.*[\\\/]/, "")}`}
            alt="Profile"
            className="lg:absolute print:absolute lg:top-20 print:top-20 right-0 w-32 h-32 object-cover border border-black mx-auto mb-4 lg:mb-0 print:mb-0"
          />
        )}
      </div>
      <h1 className="text-2xl font-bold uppercase text-gray-800">Vakrangee</h1>
      <h2 className="text-xl font-bold inline-block pb-1 mb-2">
        Employee Information Form
      </h2>
      <p className="font-bold uppercase text-xs">Personal and Confidential</p>

      <div className="p-0.5 mb-6 text-sm text-left mt-4 print:mt-4">
        <div className="p-2 print:bg-white print:border-0">
          <p className="font-bold mb-1">Instructions:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              All fields are Mandatory, where Not Applicable Please specify
              (NA).
            </li>
            <li>
              Kindly furnish all details correctly; the verification will be
              conducted on the basis of antecedents stated.
            </li>
            <li>
              After completing the form please ensure that you have attached all
              necessary documents.
            </li>
          </ul>
        </div>
      </div>

      <div className="flex items-center mb-4 text-left mt-4 print:mt-8">
        <span className="font-bold w-24 uppercase">Designation</span>
        <div className="border-b border-gray-800 flex-1 px-2 font-mono uppercase">
          {data.designation || record.job_title}
        </div>
      </div>
    </div>
  );
};

export default InformationHeader;
