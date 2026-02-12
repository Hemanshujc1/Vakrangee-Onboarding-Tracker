import React from "react";

const GratuityWitnesses = ({ formData, formatDate }) => {
  return (
    <div className="page-break-inside-avoid">
      <h4 className="font-semibold text-center mb-6">
        Declaration by Witnesses
      </h4>
      <p className="mb-8 text-sm">
        Nomination signed/thumb-impressed before me
      </p>

      <div className="flex flex-col md:flex-row print:flex-row justify-between gap-8 mb-8">
        <div className="w-full md:w-[45%] print:w-[45%]">
          <p className="mb-2 text-sm">
            Name in full and full address of witnesses.
          </p>
          {formData.witnesses &&
            formData.witnesses.map((witness, index) => (
              <div key={index} className="flex items-end gap-2 mb-4">
                <span>{index + 1}.</span>
                <div className="flex-1 border-b border-black pb-1">
                  <span className="uppercase font-bold">{witness.name}</span>
                  {witness.address && (
                    <span className="text-xs ml-2">({witness.address})</span>
                  )}
                </div>
              </div>
            ))}
          {(!formData.witnesses || formData.witnesses.length < 2) && (
            <>
              <div className="flex items-end gap-2 mb-4">
                <span>1.</span>
                <div className="flex-1 border-b border-black h-6"></div>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span>2.</span>
                <div className="flex-1 border-b border-black h-6"></div>
              </div>
            </>
          )}
        </div>
        <div className="w-full md:w-[45%] print:w-[45%]">
          <p className="mb-2 text-sm">Signature of Witnesses.</p>
          <div className="flex items-end gap-2 mb-4 h-8 mt-6.5">
            <span>1.</span>
            <div className="flex-1 border-b border-black h-6"></div>
          </div>
          <div className="flex items-end gap-2 mb-4 h-8">
            <span>2.</span>
            <div className="flex-1 border-b border-black h-6"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full md:w-1/3 print:w-1/3 gap-4">
        <div className="flex items-end gap-2">
          <span>Place:</span>
          <span className="flex-1 border-b border-black font-bold h-6 relative top-1">
            {formData.witnesses_place || formData.place}
          </span>
        </div>
        <div className="flex items-end gap-2">
          <span>Date:</span>
          <span className="flex-1 border-b border-black font-bold h-6 relative top-1">
            {formatDate(
              formData.witnesses_date || formData.witnesses?.[0]?.date,
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GratuityWitnesses;
