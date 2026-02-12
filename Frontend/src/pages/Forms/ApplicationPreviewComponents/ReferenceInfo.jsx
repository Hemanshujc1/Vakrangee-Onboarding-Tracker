import React from "react";

const ReferenceInfo = ({ references }) => {
  return (
    <div className="border border-black p-4 bg-[whitesmoke]">
      <div className="font-bold mb-2">
        Please list two professional references other than relatives.
      </div>

      {references
        .map((item, idx) => (
          <div key={idx} className="mb-4 last:mb-0">
    
            <div className="grid grid-cols-2 gap-4 mt-2 border-black pb-2">
              <div>
                <div className="bg-[#b3b3b3] font-bold px-2 py-1">
                  Name: {item.name}
                </div>
                <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                  Position: {item.position}
                </div>
                <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                  Company: {item.company}
                </div>
                <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                  Address: {item.address}
                </div>
                <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                  Contact Details: {item.contact}
                </div>
              </div>
              {/* If 2nd ref exists in parallel */}
              {references[idx + 1] && idx % 2 === 0 ? (
                <div>
                  <div className="bg-[#b3b3b3] font-bold px-2 py-1">
                    Name: {references[idx + 1].name}
                  </div>
                  <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                    Position: {references[idx + 1].position}
                  </div>
                  <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                    Company: {references[idx + 1].company}
                  </div>
                  <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                    Address: {references[idx + 1].address}
                  </div>
                  <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                    Contact Details: {references[idx + 1].contact}
                  </div>
                </div>
              ) : idx % 2 !== 0 ? null : (
                <div></div>
              )}
            </div>
          </div>
        ))
        .filter((_, i) => i % 2 === 0)}
    </div>
  );
};

export default ReferenceInfo;
