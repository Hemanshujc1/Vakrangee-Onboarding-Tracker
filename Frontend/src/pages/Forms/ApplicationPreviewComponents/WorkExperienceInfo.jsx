import React from "react";

const WorkExperienceInfo = ({ workExperience, formatDate }) => {
  return (
    <>
      <div className="mb-1 font-bold text-sm">Work Experience</div>
      <div className="mb-4 text-xs">
        Please list your work experience beginning with your most recent job. If
        you were self-employed, give firm name.
      </div>

      {workExperience && workExperience[0] ? (
        <div className="border border-black mb-6">
          <div className="flex flex-col md:flex-row print:flex-row border-b border-black">
            <div className="w-full md:w-1/4 print:w-1/4 p-1 font-bold md:border-r print:border-r border-black border-b md:border-b-0 print:border-b-0">
              Current Employer
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1 md:border-r print:border-r border-black uppercase border-b md:border-b-0 print:border-b-0">
              {workExperience[0].employer}
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1 font-bold md:border-r print:border-r border-black border-b md:border-b-0 print:border-b-0">
              Turnover
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1">
              {workExperience[0].turnover}
            </div>
          </div>
          <div className="flex flex-col md:flex-row print:flex-row border-b border-black">
            <div className="w-full md:w-1/4 print:w-1/4 p-1 font-bold md:border-r print:border-r border-black border-b md:border-b-0 print:border-b-0">
              Location
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1 md:border-r print:border-r border-black uppercase border-b md:border-b-0 print:border-b-0">
              {workExperience[0].location}
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1 font-bold md:border-r print:border-r border-black border-b md:border-b-0 print:border-b-0">
              No. of Employees
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1">
              {workExperience[0].noOfEmployees}
            </div>
          </div>
          <div className="flex flex-col md:flex-row print:flex-row border-b border-black">
            <div className="w-full md:w-1/4 print:w-1/4 p-1 font-bold md:border-r print:border-r border-black border-b md:border-b-0 print:border-b-0">
              Joining Designation
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1 md:border-r print:border-r border-black uppercase border-b md:border-b-0 print:border-b-0">
              {workExperience[0].designation}
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1 font-bold md:border-r print:border-r border-black border-b md:border-b-0 print:border-b-0">
              Joining CTC
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1">
              {workExperience[0].joiningCTC}
            </div>
          </div>
          <div className="flex flex-col md:flex-row print:flex-row border-b border-black">
            <div className="w-full md:w-1/4 print:w-1/4 p-1 font-bold md:border-r print:border-r border-black border-b md:border-b-0 print:border-b-0">
              Reporting To
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1 md:border-r print:border-r border-black uppercase border-b md:border-b-0 print:border-b-0">
              {workExperience[0].reportingOfficer}
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1 font-bold md:border-r print:border-r border-black border-b md:border-b-0 print:border-b-0">
              Joining Date
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1">
              {formatDate(workExperience[0].joiningDate)}
            </div>
          </div>
          <div className="flex flex-col md:flex-row print:flex-row border-b border-black">
            <div className="w-full md:w-1/4 print:w-1/4 p-1 font-bold md:border-r print:border-r border-black border-b md:border-b-0 print:border-b-0">
              Current Designation
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1 md:border-r print:border-r border-black uppercase border-b md:border-b-0 print:border-b-0">
              {workExperience[0].currentDesignation}
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1 font-bold md:border-r print:border-r border-black border-b md:border-b-0 print:border-b-0">
              Current CTC
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1">
              {workExperience[0].currentCTC}
            </div>
          </div>
          <div className="flex flex-col md:flex-row print:flex-row border-b border-black">
            <div className="w-full md:w-1/4 print:w-1/4 p-1 font-bold md:border-r print:border-r border-black border-b md:border-b-0 print:border-b-0">
              Expected Salary
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1 md:border-r print:border-r border-black border-b md:border-b-0 print:border-b-0">
              {workExperience[0].expectedSalary}
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1 font-bold md:border-r print:border-r border-black border-b md:border-b-0 print:border-b-0">
              Notice Period
            </div>
            <div className="w-full md:w-1/4 print:w-1/4 p-1">
              {workExperience[0].noticePeriod}
            </div>
          </div>
          <div className="p-1 font-bold border-b border-black">
            Key Responsibilities
          </div>
          <div className="p-2 h-32 border-b border-black whitespace-pre-wrap">
            {workExperience[0].responsibilities}
          </div>
          <div className="p-1 font-bold border-b border-black">
            Reason for wanting to leave
          </div>
          <div className="p-2 h-16 whitespace-pre-wrap">
            {workExperience[0].reasonLeaving}
          </div>
        </div>
      ) : (
        <div className="border border-black p-4 text-center mb-6">
          No Current Experience Listed
        </div>
      )}
    </>
  );
};

export default WorkExperienceInfo;
