import React from "react";

const TermsAndConditions = () => {
  return (
    <>
      {/* Preamble */}
      <div className="text-justify space-y-4 mt-6">
        <p>
          In consideration of employment by Company and disclosure by Company of
          confidential data and trade secret information, the undersigned
          Employee hereby covenants and agrees as follows:
        </p>
      </div>

      {/* Terms */}
      <div className="space-y-6 text-justify mt-6">
        <div>
          <h4 className="font-bold text-sm uppercase mb-2">
            1. Confidentiality:
          </h4>
          <p className="mb-3">
            Employee acknowledges that in the course of employee’s employment by
            company employee will be exposed to company’s confidential data/
            trade secret information or any other data which is crucial to
            company. Employee agrees to treat all such information or data
            confidential and to take all necessary precautions against
            disclosure of such information to unauthorized persons or any third
            party during and after terms of this agreement.
          </p>
          <p className="mb-2">
            Employee acknowledges that trade secret or any crucial information
            of company will consist but may not be limited to:
          </p>
          <ul className="pl-8 space-y-1">
            <li className="before:content-['a)'] before:mr-2">
              <strong>Technical Information:</strong> Methods, processes,
              formulae, composition, techniques, systems, computer programs,
              inventions, machines, research projects etc.
            </li>
            <li className="before:content-['b)'] before:mr-2">
              <strong>Business Information:</strong> Customer lists, pricing
              data, sources of supply, financial data, marketing or production.
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm uppercase mb-2">2. Use</h4>
          <p>
            Employee shall not use company’s confidential and trade secret
            information, except to the extent necessary to provide services or
            goods requested by company.
          </p>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;
