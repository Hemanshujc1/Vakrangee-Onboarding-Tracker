import React from "react";
import { PrintCheckbox } from "../../../Components/Forms/Shared/PrintComponents";

const EducationalDetails = ({ data, formatDate }) => {
  return (
    <>
      <h3
        className="
      bg-gray-100 italic tracking-wider font-bold text-black border border-gray-800 p-1 text-center text-sm mb-2 mt-4"
      >
        Educational Details (Fill in block letters)
      </h3>

      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full">
        <div className="min-w-175 print:min-w-0">
          {(data.educational_details || []).map((edu, index) => (
            <div
              key={index}
              className="border-x border-b border-gray-800 mb-4 text-xs break-inside-avoid"
            >
              {/* Course Name Selection Row */}
              <div className="flex border-b border-t border-gray-800">
                <div className="w-37.5 p-1 font-semibold border-r border-gray-800 flex items-center">
                  Course Name
                </div>
                <div className="flex-1 flex items-center justify-around p-1">
                  {[
                    "10th",
                    "12th",
                    "Graduation",
                    "Post Graduation",
                    "Others",
                  ].map((c) => (
                    <PrintCheckbox
                      key={c}
                      label={c}
                      checked={edu.course === c}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[150px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center text-xs">
                  Degree(Specialization)
                </div>
                <div className="p-1 uppercase">{edu.degree}</div>
              </div>

              <div className="grid grid-cols-[128px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center">
                  Institute/College
                </div>
                <div className="p-1 uppercase">{edu.institute}</div>
              </div>

              <div className="grid grid-cols-[128px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center">
                  Address
                </div>
                <div className="p-1 uppercase">{edu.address}</div>
              </div>

              <div className="flex border-b border-gray-800">
                <div className="w-32 p-1 font-semibold border-r border-gray-800 flex items-center">
                  State
                </div>
                <div className="flex-1 p-1 uppercase border-r border-gray-800">
                  {edu.state}
                </div>
                <div className="w-24 p-1 font-semibold border-r border-gray-800 flex items-center justify-center">
                  Pin Code
                </div>
                <div className="w-32 p-1 uppercase">{edu.pin}</div>
              </div>

              <div className="grid grid-cols-[128px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center">
                  University/Board
                </div>
                <div className="p-1 uppercase">{edu.university}</div>
              </div>

              <div className="grid grid-cols-[128px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center">
                  Address
                </div>
                <div className="p-1 uppercase">{edu.universityAddress}</div>
              </div>

              <div className="flex border-b border-gray-800">
                <div className="w-32 p-1 font-semibold border-r border-gray-800 flex items-center">
                  State
                </div>
                <div className="flex-1 p-1 uppercase border-r border-gray-800">
                  {edu.universitystate}
                </div>
                <div className="w-24 p-1 font-semibold border-r border-gray-800 flex items-center justify-center">
                  Pin Code
                </div>
                <div className="w-32 p-1 uppercase">{edu.universitypin}</div>
              </div>

              <div className="grid grid-cols-[128px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center">
                  Roll No:
                </div>
                <div className="p-1 uppercase">{edu.rollNo}</div>
              </div>

              <div className="grid grid-cols-[128px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center">
                  Enrollment No.
                </div>
                <div className="p-1 uppercase">{edu.enrollmentNo}</div>
              </div>

              <div className="flex border-b border-gray-800">
                <div className="w-32 p-1 font-semibold border-r border-gray-800 flex items-center">
                  Duration
                </div>
                <div className="flex-1 flex">
                  <div className="flex-1 flex items-center p-1 border-r border-gray-800">
                    <span className="mr-2">Start:</span>{" "}
                    {formatDate(edu.startDate)}
                  </div>
                  <div className="flex-1 flex items-center p-1">
                    <span className="mr-2">End:</span> {formatDate(edu.endDate)}
                  </div>
                </div>
              </div>

              <div className="flex border-b border-gray-800">
                <div className="w-32 p-1 font-semibold border-r border-gray-800 flex items-center">
                  Status (√)
                </div>
                <div className="flex-1 flex items-center justify-around border-r border-gray-800">
                  {["Completed", "Pursuing", "Dropped"].map((s) => (
                    <PrintCheckbox
                      key={s}
                      label={s}
                      checked={edu.status === s}
                    />
                  ))}
                </div>
                <div className="w-32 p-1 font-semibold border-r border-gray-800 flex items-center text-[10px] leading-tight">
                  Total Marks %/CPA Obtained
                </div>
                <div className="w-32 p-1 uppercase flex items-center justify-center">
                  {edu.marks}
                </div>
              </div>

              <div className="flex border-b border-gray-800">
                <div className="w-32 p-1 font-semibold border-r border-gray-800 flex items-center">
                  Education Type (√)
                </div>
                <div className="flex-1 flex items-center justify-around">
                  {["Regular", "Correspondence", "Part Time"].map((t) => (
                    <PrintCheckbox
                      key={t}
                      label={t}
                      checked={edu.educationType === t}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[128px_1fr] border-b border-gray-800">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center text-[10px]">
                  Any Other( Hall Ticket No etc)
                </div>
                <div className="p-1 uppercase">{edu.anyOther}</div>
              </div>

              <div className="grid grid-cols-[128px_1fr]">
                <div className="p-1 font-semibold border-r border-gray-800 flex items-center">
                  Documents Attached
                </div>
                <div className="p-1 uppercase">{edu.documentsAttached}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EducationalDetails;
