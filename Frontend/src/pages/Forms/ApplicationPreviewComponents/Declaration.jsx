import React from "react";

const Declaration = ({ signaturePreview, formData, autoFillData }) => {
  return (
    <>
      <div className="mb-6">
        <div className="mt-8 text-justify font-bold text-sm">
          I declare that the particulars given above are true & complete to the
          best of my knowledge & belief. I agree to produce any documentary
          evidence in proof of the above statements as may be demanded by the
          company. If found otherwise, my appointment shall be liable for
          termination. I confirm that I do not have any criminal record. I will
          also abide by all rules & regulations, Code of Conduct framed by the
          company from time to time.
        </div>
      </div>
      <div className="mb-6">
        <div className="mt-12 flex flex-col md:flex-row print:flex-row justify-between items-start md:items-end print:items-end gap-4 md:gap-0 print:gap-0">
          <div>
            <div className="h-16 w-32 mb-2 relative">
              {(signaturePreview ||
                formData?.signature_path ||
                autoFillData?.signature) && (
                <img
                  src={
                    signaturePreview
                      ? signaturePreview
                      : `/uploads/signatures/${
                          formData?.signature_path || autoFillData?.signature
                        }`
                  }
                  alt="Signature"
                  className="h-full w-full object-contain"
                />
              )}
            </div>
            <div className="font-bold">Signature of the candidate</div>
          </div>
          <div className="font-bold mb-4 md:mr-20 print:mr-20">
            Date: {new Date().toLocaleDateString("en-GB")}
          </div>
        </div>
      </div>
    </>
  );
};

export default Declaration;
