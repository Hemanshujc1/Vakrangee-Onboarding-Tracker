import React from "react";

const TDSDeclaration = ({ formData }) => {
  return (
    <div className="mt-12 pt-3 text-sm text-justify break-inside-avoid print:mt-20 print:pt-20">
      <p className="mb-2">
        I declare that I will contribute to the above tax saving schemes during
        the F.Y. <strong>{formData.financial_year}</strong> for A.Y.{" "}
        <strong>{formData.assessment_year}</strong>. The same may be taken for
        my Income Tax computation for TDS purpose.
      </p>
      <p className="mb-2 font-bold">
        Tax Regime once selected cannot be changed during F.Y.{" "}
        {formData.financial_year}. If employee does not select any tax regime
        then New tax regime will be considered.
      </p>
    </div>
  );
};

export default TDSDeclaration;
