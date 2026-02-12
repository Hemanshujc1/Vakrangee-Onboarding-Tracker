import React from "react";

const GratuityNominees = ({ nominees }) => {
  return (
    <div className="mt-8 page-break">
      <h4 className="font-semibold text-center mb-2">Nominee(s)</h4>
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full">
        <table className="w-full border-collapse border border-black text-xs min-w-150 print:min-w-0">
          <thead>
            <tr className="bg-gray-50 text-center">
              <th className="border border-black p-2 font-normal w-[40%]">
                Name in full with full address of nominee(s)
              </th>
              <th className="border border-black p-2 w-[20%] font-normal">
                Relationship with the employee
              </th>
              <th className="border border-black p-2 w-[15%] font-normal">
                Age of nominee
              </th>
              <th className="border border-black p-2 w-[25%] font-normal">
                Proportion by which the gratuity will be shared
              </th>
            </tr>
            <tr className="text-center font-bold">
              <td className="border border-black p-1">(1)</td>
              <td className="border border-black p-1">(2)</td>
              <td className="border border-black p-1">(3)</td>
              <td className="border border-black p-1">(4)</td>
            </tr>
          </thead>
          <tbody>
            {nominees && nominees.length > 0
              ? nominees.map((nominee, index) => (
                  <tr key={index} className="text-center">
                    <td className="border border-black p-2 text-left h-16 align-top">
                      <div className="font-bold">
                        {index + 1}. {nominee.name}
                      </div>
                      <div className="whitespace-pre-wrap pl-4">
                        {nominee.address}
                      </div>
                    </td>
                    <td className="border border-black p-2 align-top">
                      {nominee.relationship}
                    </td>
                    <td className="border border-black p-2 align-top">
                      {nominee.age}
                    </td>
                    <td className="border border-black p-2 align-top">
                      {nominee.share ? `${nominee.share}%` : ""}
                    </td>
                  </tr>
                ))
              : [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="border border-black p-4">&nbsp;</td>
                    <td className="border border-black p-4"></td>
                    <td className="border border-black p-4"></td>
                    <td className="border border-black p-4"></td>
                  </tr>
                ))}

            {/* Empty rows to match look if needed */}
            {(!nominees || nominees.length < 3) &&
              Array.from({
                length: 3 - (nominees?.length || 0),
              }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-10">
                  <td className="border border-black p-2">
                    {(nominees?.length || 0) + i + 1}.
                  </td>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GratuityNominees;
