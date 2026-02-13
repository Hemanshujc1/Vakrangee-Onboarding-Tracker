import React from "react";

const FamilyDetails = ({ data, formatDate }) => {
  return (
    <div className="break-inside-avoid">
      {/* Family Details Heading */}
      <div className="text-center font-bold underline mb-4 text-lg mt-12">
        <span>Family Details</span>
      </div>

      {/* Family Details Note */}
      <div className="text-left font-bold text-sm mb-2">
        <span className="underline">Note:</span>
        <span> If Married then specify your Spouse &amp; Children Names.</span>
      </div>

      {/* Family Details Table */}
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full">
        <table className="w-full border-collapse border border-black text-sm text-center">
          <thead>
            <tr className="bg-[#dcd6b6]">
              <th className="px-4 py-2 border border-black w-1/4 font-bold">
                Relationship
              </th>
              <th className="px-4 py-2 border border-black w-1/2 font-bold">
                Name
              </th>
              <th className="px-4 py-2 border border-black w-1/4 font-bold">
                Age (Date Of Birth)
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Row 1: Spouse */}
            <tr>
              <td className="px-4 py-2 border border-black font-bold">
                Spouse
              </td>
              <td className="px-4 py-2 border border-black text-left">
                {data.dependents?.find(
                  (d) => d.relationship.toLowerCase() === "spouse",
                )?.name || ""}
              </td>
              <td className="px-4 py-2 border border-black">
                {data.dependents?.find(
                  (d) => d.relationship.toLowerCase() === "spouse",
                )
                  ? `${
                      data.dependents.find(
                        (d) => d.relationship.toLowerCase() === "spouse",
                      ).age
                    } (${formatDate(
                      data.dependents.find(
                        (d) => d.relationship.toLowerCase() === "spouse",
                      ).dob,
                    )})`
                  : ""}
              </td>
            </tr>
            {/* Row 2: Child -1 */}
            <tr>
              <td className="px-4 py-2 border border-black font-bold">
                Child -1
              </td>
              <td className="px-4 py-2 border border-black text-left">
                {data.dependents?.filter(
                  (d) =>
                    d.relationship.toLowerCase().includes("child") ||
                    d.relationship.toLowerCase().includes("son") ||
                    d.relationship.toLowerCase().includes("daughter"),
                )[0]?.name || ""}
              </td>
              <td className="px-4 py-2 border border-black">
                {data.dependents?.filter(
                  (d) =>
                    d.relationship.toLowerCase().includes("child") ||
                    d.relationship.toLowerCase().includes("son") ||
                    d.relationship.toLowerCase().includes("daughter"),
                )[0]
                  ? `${
                      data.dependents.filter(
                        (d) =>
                          d.relationship.toLowerCase().includes("child") ||
                          d.relationship.toLowerCase().includes("son") ||
                          d.relationship.toLowerCase().includes("daughter"),
                      )[0].age
                    } (${formatDate(
                      data.dependents.filter(
                        (d) =>
                          d.relationship.toLowerCase().includes("child") ||
                          d.relationship.toLowerCase().includes("son") ||
                          d.relationship.toLowerCase().includes("daughter"),
                      )[0].dob,
                    )})`
                  : ""}
              </td>
            </tr>
            {/* Row 3: Child -2 */}
            <tr>
              <td className="px-4 py-2 border border-black font-bold">
                Child -2
              </td>
              <td className="px-4 py-2 border border-black text-left">
                {data.dependents?.filter(
                  (d) =>
                    d.relationship.toLowerCase().includes("child") ||
                    d.relationship.toLowerCase().includes("son") ||
                    d.relationship.toLowerCase().includes("daughter"),
                )[1]?.name || ""}
              </td>
              <td className="px-4 py-2 border border-black">
                {data.dependents?.filter(
                  (d) =>
                    d.relationship.toLowerCase().includes("child") ||
                    d.relationship.toLowerCase().includes("son") ||
                    d.relationship.toLowerCase().includes("daughter"),
                )[1]
                  ? `${
                      data.dependents.filter(
                        (d) =>
                          d.relationship.toLowerCase().includes("child") ||
                          d.relationship.toLowerCase().includes("son") ||
                          d.relationship.toLowerCase().includes("daughter"),
                      )[1].age
                    } (${formatDate(
                      data.dependents.filter(
                        (d) =>
                          d.relationship.toLowerCase().includes("child") ||
                          d.relationship.toLowerCase().includes("son") ||
                          d.relationship.toLowerCase().includes("daughter"),
                      )[1].dob,
                    )})`
                  : ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FamilyDetails;
