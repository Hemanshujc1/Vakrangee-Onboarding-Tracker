import React from "react";
import { formatDate } from "../../../utils/basicInfoHelpers";

const SignatureSection = ({ data, derivedSignature }) => {
  return (
    <div className="mt-16 flex flex-col items-end mr-1 md:mr-0 print:mr-0">
      <div className="flex items-end gap-2 mb-4 w-64">
        <span className="font-bold shrink-0 w-28 whitespace-nowrap text-right pr-2">
          Signature :
        </span>
        <div className="flex-1 border-b border-black border-dotted h-6 flex justify-center items-end">
          {derivedSignature ? (
            <img src={derivedSignature} alt="Signature" className="h-10 mb-1" />
          ) : null}
        </div>
      </div>
      <div className="flex items-end gap-2 w-64">
        <span className="font-bold shrink-0 w-28 whitespace-nowrap text-right pr-2">Date :</span>
        <div className="flex-1 border-b border-black border-dotted h-6 text-center leading-none">
          {data?.date || data?.created_at ? formatDate(data.date || data.created_at) : ""}
        </div>
      </div>
    </div>
  );
};

export default SignatureSection;
