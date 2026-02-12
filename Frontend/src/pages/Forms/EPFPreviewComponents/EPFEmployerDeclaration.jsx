import React from "react";

const EPFEmployerDeclaration = ({
  getValue,
  data,
  formatDate,
  getSignatureUrl,
  epf,
}) => {
  return (
    <div className="mt-6 text-sm">
      <div className="text-center font-semibold  underline-offset-2 underline text-lg mb-1">
        DECLARATION BY PRESENT EMPLOYER
      </div>

      <div className="px-2 mt-4 text-xs flex flex-col gap-4">
        {/* Section A */}
        <div className="flex items-start">
          <span className="mr-4">A.</span>
          <div className="w-full">
            The member Mr./Ms./Mrs.{" "}
            <span className="inline-block border-b border-black border-dotted px-2 min-w-25 md:min-w-50 print:min-w-50 text-center font-bold mx-2">
              {" "}
              {getValue("member_name_aadhar", data.fullName)}{" "}
            </span>
            Has joined on
            <span className="inline-block border-b border-black border-dotted px-2 min-w-20 md:min-w-25 print:min-w-25 text-center font-bold mx-2">
              {formatDate(getValue("present_joining_date"))}
            </span>
            and has been alloted PF Number
            <span className="inline-block border-b border-black border-dotted px-2 min-w-25 md:min-w-37.5 print:min-w-37.5 text-center font-bold mx-2">
              {getValue("present_pf_number")}
            </span>
          </div>
        </div>

        {/* Section B */}
        <div className="flex items-start">
          <span className="mr-4">B.</span>
          <div className="w-full">
            <div className="mb-2 text-justify leading-snug">
              In case the person was earlier not a member of EPF Scheme, 1952
              and EPS, 1995: ((Post allotment of UAN) The UAN Alloted for Member
              is
              <span className="inline-block border-b border-black border-dotted px-2 min-w-25 md:min-w-37.5 print:min-w-37.5 text-center font-bold mx-1">
                {getValue("uan_number")}
              </span>
              Please Tick the Appropriate Option:
              <span className="block md:inline print:inline md:ml-12 print:ml-12 mt-2 md:mt-0 print:mt-0 font-bold md:font-normal print:font-normal">
                The KYC details of the above member in the UAN database
              </span>
            </div>

            <div className="flex flex-col md:flex-row print:flex-row justify-between items-start mt-3 px-2 gap-2 md:gap-0 print:gap-0">
              {/* B1 */}
              <div className="flex items-center align-middle gap-1 w-full md:w-[30%] print:w-[30%]">
                <div className="w-3 h-3 border border-black shrink-0 flex items-center justify-center relative">
                  {getValue("present_kyc_status") === "Not Uploaded" && "✓"}
                </div>
                <span>Have not been uploaded</span>
              </div>

              {/* B2 */}
              <div className="flex items-center align-middle gap-1 w-full md:w-[32%] print:w-[32%]">
                <div className="w-3 h-3 border border-black shrink-0 flex items-center justify-center relative">
                  {getValue("present_kyc_status") === "Uploaded Not Approved" &&
                    "✓"}
                </div>
                <span>Have been uploaded but not approved</span>
              </div>

              {/* B3 */}
              <div className="flex items-center align-middle gap-1 w-full md:w-[36%] print:w-[36%]">
                <div className="w-3 h-3 border border-black shrink-0 flex items-center justify-center relative">
                  {getValue("present_kyc_status") === "Approved DSC" && "✓"}
                </div>
                <span>Have been uploaded and approved with DSC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section C */}
        <div className="flex items-start">
          <span className="mr-4">C.</span>
          <div className="w-full">
            <p className="mb-3">
              In case the person was earlier a member of EPF Scheme, 1952 and
              EPS 1995;
            </p>

            <div className="flex flex-col gap-4 pl-1">
              {/* C1 */}
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 border border-black shrink-0 flex items-center justify-center text-lg mt-0.5">
                  {getValue("present_transfer_status") ===
                    "Approved DSC Transfer" && "✓"}
                </div>
                <span className="leading-snug text-justify">
                  The KYC details of the above member in the UAN database have
                  been approved with Digital Signature Certificate and transfer
                  request has been generated on portal
                </span>
              </div>

              {/* C2 */}
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 border border-black shrink-0 flex items-center justify-center text-lg mt-0.5">
                  {getValue("present_transfer_status") === "Physical Claim" &&
                    "✓"}
                </div>
                <span className="leading-snug text-justify">
                  As the DSC of establishment are not registered with EPFO, the
                  member has been informed to file physical claim (Form-13) for
                  transfer of funds from his previous establishment.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row print:flex-row justify-between items-start md:items-end print:items-end mt-16 pt-8 gap-8 md:gap-0 print:gap-0">
          <div className="text-base">Date :</div>
          <div className="flex flex-col items-center w-full md:w-auto print:w-auto self-center md:self-end print:self-end">
            <div className="h-16 w-full flex items-end justify-center mb-1">
              {getSignatureUrl(epf.sinature_of_employer_path) && (
                <img
                  src={getSignatureUrl(epf.sinature_of_employer_path)}
                  className="h-full object-contain"
                  alt="Employer Signature"
                />
              )}
            </div>
            <div className="text-base text-center w-full">
              Signature of Employer with Seal of Establishment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EPFEmployerDeclaration;
