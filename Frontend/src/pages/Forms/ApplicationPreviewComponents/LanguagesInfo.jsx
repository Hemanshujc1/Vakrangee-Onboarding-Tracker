import React from "react";

const LanguagesInfo = ({ languages }) => {
  return (
    <>
      <div className="mb-2 font-bold text-sm">Languages Known</div>
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full mb-6">
        <table className="w-full min-w-125 print:min-w-0 border-collapse border border-black">
          <thead className="bg-[#b3b3b3] text-center">
            <tr>
              <th className="border border-black p-1">Languages Known</th>
              <th className="border border-black p-1 w-32">Speak</th>
              <th className="border border-black p-1 w-32">Read</th>
              <th className="border border-black p-1 w-32">Write</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((item, idx) => (
              <tr key={idx} className="border-b border-black h-8">
                <td className="border-r border-black p-1 font-bold uppercase">
                  {item.language}
                </td>
                <td className="border-r border-black p-1 text-center">
                  {item.speak ? "☑" : ""}
                </td>
                <td className="border-r border-black p-1 text-center">
                  {item.read ? "☑" : ""}
                </td>
                <td className="p-1 text-center">{item.write ? "☑" : ""}</td>
              </tr>
            ))}
            {[...Array(Math.max(0, 4 - languages.length))].map((_, i) => (
              <tr key={`empty-lang-${i}`} className="border-b border-black h-8">
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

export default LanguagesInfo;
