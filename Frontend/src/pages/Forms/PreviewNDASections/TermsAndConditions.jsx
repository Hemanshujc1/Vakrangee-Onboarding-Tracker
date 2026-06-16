import React from "react";

const TermsAndConditions = () => {
  return (
    <>
      {/* 5. Preamble */}
      <p className="text-justify mb-6 text-sm">
        In consideration of employment by company and disclosure by company
        of confidential data and trade secret information, the undersigned
        employee hereby covenants and agrees as follows:
      </p>

      {/* 6. Terms */}
      <div className="space-y-6 text-justify text-sm">
        <h3 className="font-bold mb-2 uppercase">1. Confidentiality:</h3>
        <p className="mb-2">
          Employee acknowledges that in the course of employee's employment
          by company employee will be exposed to company's confidential
          data/ trade secret information or any other data which is crucial
          to company. Employee agrees to treat all such information or data
          confidential and to take all necessary precautions against
          disclosure of such information to unauthorized persons or any
          third party during and after terms of this agreement.
        </p>
        <p className="mb-2">
          Employee acknowledges that trade secret or any crucial information
          of company will consist but may not be limited to:
        </p>
        <div className="pl-6 md:pl-10 print:pl-10 space-y-1">
          <div className="flex gap-2">
            <span>a{")"}</span>
            <div>
              <span className="font-bold">Technical Information:</span>{" "}
              Methods, processes, formulae, composition, techniques,
              systems, computer programs, inventions, machines, research
              projects etc.
            </div>
          </div>
          <div className="flex gap-2">
            <span>b{")"}</span>
            <div>
              <span className="font-bold">Business Information:</span>{" "}
              Customer lists, pricing data, sources of supply, financial
              data, marketing or production.
            </div>
          </div>
        </div>
      </div>

      <div className="break-inside-avoid mt-10 pt-10">
        <div className="space-y-6 text-justify text-sm">
          <h3 className="font-bold mb-2 uppercase">2. Use</h3>
          <p>
            Employee shall not use company's confidential and trade secret
            information, except to the extent necessary to provide services
            or goods requested by company.
          </p>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;
