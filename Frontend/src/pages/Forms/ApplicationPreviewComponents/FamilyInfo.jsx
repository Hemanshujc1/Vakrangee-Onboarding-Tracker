import React from "react";

const FamilyInfo = ({ family }) => {
  return (
    <>
      <div className="mb-2 font-bold text-sm">Family Details</div>
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full mb-6">
        <table className="w-full min-w-150 print:min-w-0 border-collapse border border-black">
          <thead className="bg-[#b3b3b3] text-center">
            <tr>
              <th className="border border-black p-1 w-32">Relationship</th>
              <th className="border border-black p-1">Name</th>
              <th className="border border-black p-1 w-16">Age</th>
              <th className="border border-black p-1 w-48">
                Occupation / Study
              </th>
            </tr>
          </thead>
          <tbody>
            {family.map((item, idx) => (
              <tr key={idx} className="border-b border-black h-8">
                <td className="border-r border-black p-1">
                  {item.relationship}
                </td>
                <td className="border-r border-black p-1 font-bold uppercase">
                  {item.name}
                </td>
                <td className="border-r border-black p-1 font-bold text-center">
                  {item.age}
                </td>
                <td className="p-1 font-bold uppercase">{item.occupation}</td>
              </tr>
            ))}
            {[...Array(Math.max(0, 5 - family.length))].map((_, i) => (
              <tr key={`empty-fam-${i}`} className="border-b border-black h-8">
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

export default FamilyInfo;
