import React from 'react';

const InstructionBlock = () => {
  return (
    <div className="p-4 mb-6 text-sm text-black print:px-4">
      <div className="flex flex-col gap-1">
        <p className="font-bold uppercase tracking-wide text-gray-900 mb-1 pb-1 print:underline print:uppercase print:tracking-wide">
          Personal and Confidential
        </p>
        <p className="font-semibold mt-1 print:font-bold print:underline print:mt-0">Instructions:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-1 text-black print:list-none">
          <li>
            All fields are Mandatory. Where Not Applicable, please specify{" "}
            <strong>N/A</strong>.
          </li>
          <li>
            Kindly furnish all details correctly; the verification will be conducted on the basis of antecedents stated.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default InstructionBlock;
