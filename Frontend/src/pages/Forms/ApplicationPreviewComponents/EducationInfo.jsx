import React from "react";

const EducationInfo = ({ education }) => {
  const bgYellow = "bg-[#ffffcc]";

  return (
    <>
      <div className="mb-2 font-bold text-sm">
        Educational & Professional Qualifications:
      </div>
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full mb-6">
        <table className="w-full min-w-150 print:min-w-0 border-collapse border border-black text-center">
          <thead className="bg-[#b3b3b3]">
            <tr>
              <th className="border border-black p-1">Qualification</th>
              <th className="border border-black p-1">
                University / Institute
              </th>
              <th className="border border-black p-1">Year of Passing</th>
              <th className="border border-black p-1">Percentage of Marks</th>
              <th className="border border-black p-1">Location</th>
            </tr>
          </thead>
          <tbody className={bgYellow}>
            {education.map((edu, idx) => (
              <tr key={idx} className="border-b border-black h-8">
                <td className="border-r border-black p-1 uppercase text-left">
                  {edu.qualification}
                </td>
                <td className="border-r border-black p-1 uppercase text-left">
                  {edu.institute}
                </td>
                <td className="border-r border-black p-1">{edu.year}</td>
                <td className="border-r border-black p-1">{edu.percentage}</td>
                <td className="p-1 uppercase">{edu.location}</td>
              </tr>
            ))}
            {/* Fill empty rows to look like sheet */}
            {[...Array(Math.max(0, 5 - education.length))].map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-black h-8">
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default EducationInfo;
