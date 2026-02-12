import React from "react";

const EPFUndertaking = ({ getValue, formatDate, stateSig, epf, data }) => {
  return (
    <div
      className="flex flex-col mt-10 pt-10"
      style={{ pageBreakBefore: "always" }}
    >
      {/* Undertaking */}
      <div className="text-sm leading-tight">
        <h3 className="font-semibold underline underline-offset-2 mb-1 uppercase text-lg text-center">
          Undertaking
        </h3>
        <div className="px-2 flex flex-col gap-1">
          <p>
            1) Certified that the particulars are true to the best of my
            knowledge
          </p>
          <p>
            2) I authorise EPFO to use my Aadhar for verification /
            authentication / eKYC purpose for service delivery
          </p>
          <p>
            3) Kindly transfer the fund and service details, if applicable, from
            the previous PF account as declared above to the present PF account.
          </p>
          <p className="pl-2">
            (The transfer would be possible only if the identified KYC details
            approved by previous employer has been verified by present employer
            using his Digital Signature)
          </p>
          <p>
            4) In case of changes in above details, the same will be intimated
            to employer at the earliest.
          </p>
        </div>
      </div>

      {/* Member Signature Section */}
      <div className="flex flex-col md:flex-row print:flex-row justify-between items-start md:items-end print:items-end mt-8 mb-2 px-2 gap-4 md:gap-0 print:gap-0">
        <div className="text-sm">
          <div className="mb-1">
            <span>Date :</span> {formatDate(new Date())}
          </div>
          <div>
            <span>Place :</span> {getValue("place")}
          </div>
        </div>
        <div className="flex flex-col items-center text-sm self-center md:self-end print:self-end">
          {stateSig ||
          (epf.signature instanceof File
            ? URL.createObjectURL(epf.signature)
            : null) ||
          epf.signature_path ||
          data.signature ? (
            <img
              src={
                stateSig ||
                (epf.signature instanceof File
                  ? URL.createObjectURL(epf.signature)
                  : null) ||
                `/uploads/signatures/${epf.signature_path || data.signature}`
              }
              className="h-14 mb-1"
              alt="Signature"
            />
          ) : (
            <div className="h-10 w-32 border border-gray-300 bg-gray-50 flex items-center justify-center text-sm">
              No Signature
            </div>
          )}
          <span className="pt-1 px-4">Signature of Member</span>
        </div>
      </div>
    </div>
  );
};

export default EPFUndertaking;
