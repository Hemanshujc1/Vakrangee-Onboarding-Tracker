import React from "react";

const AchievementsInfo = ({ achievements }) => {
  return (
    <>
      <div className="mb-1 font-bold text-sm">Significant Achievements</div>
      <div className="mb-2 text-xs">
        Distinction, honors, awards (Academic / extracurricular, Community /
        Welfare activities) received.
      </div>

      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full mb-6">
        <table className="w-full min-w-125 print:min-w-0 border-collapse border border-black">
          <thead className="bg-[#b3b3b3] text-center">
            <tr>
              <th className="border border-black p-1 w-24">Year</th>
              <th className="border border-black p-1">
                Distinction / Honors / Awards
              </th>
            </tr>
          </thead>
          <tbody>
            {achievements.map((item, idx) => (
              <tr key={idx} className="border-b border-black h-10">
                <td className="border-r border-black p-1 text-center">
                  {item.year}
                </td>
                <td className="p-1 uppercase">{item.details}</td>
              </tr>
            ))}
            {[...Array(Math.max(0, 4 - achievements.length))].map((_, i) => (
              <tr key={`empty-a-${i}`} className="border-b border-black h-10">
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

export default AchievementsInfo;
