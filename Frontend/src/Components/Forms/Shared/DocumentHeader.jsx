import React from "react";

const DocumentHeader = ({ title = "Information Form" }) => {
  return (
    <div className="flex flex-col justify-center items-center text-center pb-0 mb-3.5">
      <img
        src={`${import.meta.env.BASE_URL}vakrangee-logo.svg`}
        alt="Vakrangee Logo"
        className="h-24 w-auto mb-1"
      />
      <h1 className="text-xl font-extrabold uppercase text-gray-900">
        VAKRANGEE LIMITED
      </h1>
      <p className="mt-0 text-sm font-extrabold text-gray-900">{title}</p>
    </div>
  );
};

export default DocumentHeader;
