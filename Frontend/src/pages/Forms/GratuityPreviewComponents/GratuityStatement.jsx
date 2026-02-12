import React from "react";

const GratuityStatement = ({ formData, formatDate, signaturePreview }) => {
  return (
    <div className="mt-8">
      <h4 className="font-semibold text-center mb-6">Statement</h4>
      <div className="space-y-3">
        {/*full name */}
        <div className="flex flex-col md:flex-row print:flex-row items-start md:items-end print:items-end gap-2">
          <span className="md:whitespace-nowrap print:whitespace-nowrap text-left">
            1. Name of employee in full
          </span>
          <span className="flex-1 border-b border-black px-2 font-bold uppercase w-full">
            {formData.firstname} {formData.middlename || ""} {formData.lastname}
          </span>
        </div>
        {/* Sex */}
        <div className="flex flex-col md:flex-row print:flex-row items-start md:items-end print:items-end gap-2">
          <span className="md:whitespace-nowrap print:whitespace-nowrap text-left">
            2. Sex
          </span>
          <span className="flex-1 border-b border-black px-2 uppercase w-full">
            {formData.gender}
          </span>
        </div>
        {/* regilion*/}
        <div className="flex flex-col md:flex-row print:flex-row items-start md:items-end print:items-end gap-2">
          <span className="md:whitespace-nowrap print:whitespace-nowrap text-left">
            3. Religion
          </span>
          <span className="flex-1 border-b border-black px-2 uppercase w-full">
            {formData.religion}
          </span>
        </div>
        {/* marital status */}
        <div className="flex flex-col md:flex-row print:flex-row items-start md:items-end print:items-end gap-2">
          <span className="md:whitespace-nowrap print:whitespace-nowrap text-left">
            4. Whether unmarried/married/widow/widower
          </span>
          <span className="flex-1 border-b border-black px-2 uppercase w-full">
            {formData.marital_status}
          </span>
        </div>
        {/*department */}
        <div className="flex flex-col md:flex-row print:flex-row items-start md:items-end print:items-end gap-2">
          <span className="md:whitespace-nowrap print:whitespace-nowrap text-left">
            5. Department/Branch/Section where employed
          </span>
          <span className="flex-1 border-b border-black px-2 uppercase w-full">
            {formData.department}
          </span>
        </div>
        {/*post held */}
        <div className="flex flex-col md:flex-row print:flex-row items-start md:items-end print:items-end gap-2">
          <span className="md:whitespace-nowrap print:whitespace-nowrap text-left">
            6. Post held with Ticket No. or Serial No., if any
          </span>
          <span className="flex-1 border-b border-black px-2 uppercase w-full">
            {formData.ticket_no}
          </span>
        </div>
        {/* date of appointment */}
        <div className="flex flex-col md:flex-row print:flex-row items-start md:items-end print:items-end gap-2">
          <span className="md:whitespace-nowrap print:whitespace-nowrap text-left">
            7. Date of appointment
          </span>
          <span className="flex-1 border-b border-black px-2 uppercase w-full">
            {formatDate(formData.date_of_appointment)}
          </span>
        </div>
        {/* Address */}
        <div>
          <div className="flex items-end gap-2 mb-2">
            <span>8. Permanent address:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-x-8 gap-y-2 ml-0 md:ml-4 print:ml-4">
            <div className="flex items-end gap-2">
              <span>Village</span>
              <span className="flex-1 border-b border-black px-2">
                {formData.village}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span>Thana</span>
              <span className="flex-1 border-b border-black px-2">
                {formData.thana}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span>Sub-division</span>
              <span className="flex-1 border-b border-black px-2">
                {formData.sub_division}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span>Post Office</span>
              <span className="flex-1 border-b border-black px-2">
                {formData.post_office}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span>District</span>
              <span className="flex-1 border-b border-black px-2">
                {formData.district}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span>State</span>
              <span className="flex-1 border-b border-black px-2">
                {formData.state}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col md:flex-row print:flex-row justify-between items-start px-4 gap-8 md:gap-0 print:gap-0">
        <div className="text-left w-full md:w-1/3 print:w-1/3">
          <div className="flex items-end gap-2 mb-4">
            <span>Place:</span>
            <span className="flex-1 border-b border-black font-bold h-6">
              {formData.place}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span>Date:</span>
            <span className="flex-1 border-b border-black font-bold h-6">
              {new Date().toLocaleDateString("en-GB")}
            </span>
          </div>
        </div>
        <div className="text-center md:text-right print:text-right w-full md:w-1/3 print:w-1/3 flex flex-col items-center md:items-end print:items-end">
          <div className="min-h-16 mb-2 flex items-end justify-center md:justify-end print:justify-end w-full">
            {signaturePreview ? (
              <img
                src={signaturePreview}
                alt="Signature"
                className="h-16 object-contain"
              />
            ) : (
              <div className="h-12 w-full"></div>
            )}
          </div>
          <p className="border-t border-black w-full pt-1 text-center text-xs font-bold">
            Signature/Thumb-impression of the Employee
          </p>
        </div>
      </div>
    </div>
  );
};

export default GratuityStatement;
