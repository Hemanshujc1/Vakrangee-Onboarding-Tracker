import React from "react";

const TDSTaxRegime = ({ taxRegime }) => {
  return (
    <div className="border border-black w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 text-center">
        {/* Left Text */}
        <div className="border-b md:border-b-0 md:border-r border-black p-3 flex items-center justify-center">
          <span className="font-normal uppercase text-sm">
            OPTION FOR OPTING NEW TAX REGIME OR OLD TAX REGIME
          </span>
        </div>

        {/* New Tax Regime */}
        <div className="border-b md:border-b-0 md:border-r border-black p-3">
          <div className="font-normal uppercase mb-2 text-sm">
            New Tax Regime
          </div>
          <div className="flex justify-center">
            <div className="w-6 h-6 border border-black flex items-center justify-center">
              {taxRegime === "new" && (
                <span className="text-lg font-normal">✔</span>
              )}
            </div>
          </div>
        </div>

        {/* Old Tax Regime */}
        <div className="p-3">
          <div className="font-normal uppercase mb-2 text-sm">
            Old Tax Regime
          </div>
          <div className="flex justify-center">
            <div className="w-6 h-6 border border-black flex items-center justify-center">
              {taxRegime === "old" && (
                <span className="text-lg font-normal">✔</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TDSTaxRegime;
