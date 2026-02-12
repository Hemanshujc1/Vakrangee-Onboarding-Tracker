import React from "react";

const TrainingInfo = ({ otherTraining }) => {
  const bgYellow = "bg-[#ffffcc]";

  return (
    <>
      <div className="mb-2 font-bold text-sm">
        Mention if any other IT certifications & qualification acquired or
        training programmes attended:
      </div>
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full">
        <table className="w-full min-w-150 print:min-w-0 border-collapse border border-black text-center">
          <thead className="bg-[#b3b3b3]">
            <tr>
              <th className="border border-black p-1">
                Institute / Organization
              </th>
              <th className="border border-black p-1">Location</th>
              <th className="border border-black p-1">Duration</th>
              <th className="border border-black p-1">Details of Training</th>
            </tr>
          </thead>
          <tbody className={bgYellow}>
            {otherTraining.map((item, idx) => (
              <tr key={idx} className="border-b border-black h-8">
                <td className="border-r border-black p-1 uppercase text-left">
                  {item.institute}
                </td>
                <td className="border-r border-black p-1 uppercase text-left">
                  {item.location}
                </td>
                <td className="border-r border-black p-1">{item.duration}</td>
                <td className="p-1 uppercase text-left">{item.details}</td>
              </tr>
            ))}
            {[...Array(Math.max(0, 4 - otherTraining.length))].map((_, i) => (
              <tr key={`empty-t-${i}`} className="border-b border-black h-8">
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

export default TrainingInfo;
