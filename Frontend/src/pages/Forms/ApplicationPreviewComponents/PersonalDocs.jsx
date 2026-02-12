import React from "react";

const PersonalDocs = ({ formData, formatDate }) => {
  return (
    <>
      <div className="border border-black flex flex-col md:flex-row print:flex-row mb-4">
        <div className="w-full md:w-1/2 print:w-1/2 border-b md:border-b-0 print:border-b-0 md:border-r print:border-r border-black p-2">
          <div className="font-bold border-b border-black pb-1 mb-2">
            Driver's License
          </div>
          <div className="mb-2">
            Do you have a driver's license? Yes{" "}
            {formData.hasLicense === "Yes" ? "☑" : "☐"} No{" "}
            {formData.hasLicense === "No" ? "☑" : "☐"}
          </div>
          <div className="mb-2">
            Driver's license number: {formData.licenseNo}
          </div>
          <div className="mb-2">
            Date of Issue: {formatDate(formData.licenseIssueDate)}
          </div>
          <div>Expiry Date: {formatDate(formData.licenseExpiryDate)}</div>
        </div>
        <div className="w-full md:w-1/2 print:w-1/2 p-2">
          <div className="font-bold border-b border-black pb-1 mb-2">
            Passport
          </div>
          <div className="mb-2">
            Do you have a passport? Yes{" "}
            {formData.hasPassport === "Yes" ? "☑" : "☐"} No{" "}
            {formData.hasPassport === "No" ? "☑" : "☐"}
          </div>
          <div className="mb-2">Passport number: {formData.passportNo}</div>
          <div className="mb-2">
            Date of Issue: {formatDate(formData.passportIssueDate)}
          </div>
          <div>Expiry Date: {formatDate(formData.passportExpiryDate)}</div>
        </div>
      </div>

      <div className="border border-black p-2 mb-6 flex flex-col md:flex-row print:flex-row">
        <div className="w-full md:w-1/2 print:w-1/2 md:border-r print:border-r border-black md:pr-2 print:pr-2 mb-2 md:mb-0 print:mb-0">
          <div className="font-bold border-b border-black pb-1 mb-2">
            Pan Card
          </div>
          <div className="mb-2">
            Do you have Pan Card? Yes {formData.hasPan === "Yes" ? "☑" : "☐"} No{" "}
            {formData.hasPan === "No" ? "☑" : "☐"}
          </div>
          <div>Pan Card number: {formData.panNo}</div>
        </div>
        <div className="w-full md:w-1/2 print:w-1/2"></div>
      </div>
    </>
  );
};

export default PersonalDocs;
