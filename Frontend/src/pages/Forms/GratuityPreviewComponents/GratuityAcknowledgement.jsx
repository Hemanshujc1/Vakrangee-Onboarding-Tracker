import React from "react";

const GratuityAcknowledgement = ({
  formData,
  formatDate,
  signaturePreview,
}) => {
  return (
    <div className="page-break p-8 mt-12 border-t-2 border-black pt-12">
      <h4 className="font-bold text-center mb-8">
        Acknowledgement by the Employee
      </h4>
      <p className="mb-12">
        Received the duplicate copy of nomination in Form 'F' filed by me and
        duly certified by the employer.
      </p>
      <div className="flex flex-col md:flex-row print:flex-row justify-between items-center mt-24 gap-8 md:gap-0 print:gap-0">
        <div className="w-full md:w-fit print:w-fit">
          <div className="flex items-end gap-2">
            <span>Date:</span>
            <span className="flex-1 border-b border-black h-6">
              {formatDate(formData.date_of_submit)}
            </span>
          </div>
          <p className="text-[10px] mt-2 font-bold">
            Note.—Strike out the words/paragraphs not applicable.
          </p>
        </div>
        <div className="text-center w-full md:w-fit print:w-fit">
          <div className="min-h-12 mb-2 flex justify-center">
            {signaturePreview && (
              <img
                src={signaturePreview}
                alt="Signature"
                className="h-12 object-contain"
              />
            )}
          </div>
          <p className="pt-1 text-sm font-bold border-t border-black md:border-0 print:border-0 w-48 mx-auto md:w-auto print:w-auto">
            Signature of the Employee
          </p>
        </div>
      </div>
    </div>
  );
};

export default GratuityAcknowledgement;
