import React from "react";

const EPFEmployerDeclaration = ({ register, errors, watch, isEmployee }) => {
  return (
    <div className="flex flex-col mb-4 pt-4">
      <h1 className="text-center underline-offset-4 underline font-bold">
        DECLARATION BY PRESENT EMPLOYER
      </h1>
      <ul className="list-[upper-alpha] list-inside text-sm mt-5 flex flex-col gap-2">
        <li>
          The member{" "}
          <span className="underline font-bold mr-2 uppercase">
            {watch("member_name_aadhar") || "____________________"}
          </span>
          has joined on{" "}
          <span className="inline-block relative">
            <input
              disabled={isEmployee}
              type="date"
              {...register("present_joining_date")}
              className={`border-b outline-none px-1 ${
                errors.present_joining_date
                  ? "border-red-500"
                  : "border-gray-400"
              }`}
            />
            {errors.present_joining_date && (
              <span className="absolute -bottom-4 left-0 text-red-500 text-[10px] whitespace-nowrap">
                {errors.present_joining_date.message}
              </span>
            )}
          </span>{" "}
          and has been alloted PF Number
          <span className="inline-block relative">
            <input
              disabled={isEmployee}
              type="text"
              {...register("present_pf_number")}
              className={`border-b outline-none px-1 ml-1 w-32 ${
                errors.present_pf_number ? "border-red-500" : "border-gray-400"
              }`}
            />
            {errors.present_pf_number && (
              <span className="absolute -bottom-4 left-1 text-red-500 text-[10px] whitespace-nowrap">
                {errors.present_pf_number.message}
              </span>
            )}
          </span>
          .
        </li>

        <li>
          In case the person was earlier not a member of EPF Scheme, 1952 and
          EPS, 1995:
          <span className="italic block text-xs mb-1">
            ((Post allotment of UAN) The UAN alloted or the member is) Please
            Tick the Appropriate Option:
          </span>
          <span className="font-semibold block mb-2">
            The KYC details of the above member in the UAN database
          </span>
          <div
            className={`flex flex-col md:flex-row gap-4 mt-2 p-2 rounded ${
              errors.present_kyc_status ? "bg-red-50 border border-red-200" : ""
            }`}
          >
            <label className="flex items-center gap-1">
              <input
                disabled={isEmployee}
                type="radio"
                value="Not Uploaded"
                {...register("present_kyc_status")}
              />{" "}
              Have not been Uploaded
            </label>
            <label className="flex items-center gap-1">
              <input
                disabled={isEmployee}
                type="radio"
                value="Uploaded Not Approved"
                {...register("present_kyc_status")}
              />{" "}
              Have been Uploaded but not approved
            </label>
            <label className="flex items-center gap-1">
              <input
                disabled={isEmployee}
                type="radio"
                value="Approved DSC"
                {...register("present_kyc_status")}
              />{" "}
              Have been Uploaded and approved with DSC
            </label>
          </div>
          {errors.present_kyc_status && (
            <p className="text-red-500 text-[10px] mt-1">
              {errors.present_kyc_status.message}
            </p>
          )}
        </li>

        <li>
          In case the person was earlier a member of EPF Scheme, 1952 and EPS
          1995;
          <div
            className={`flex flex-col gap-2 mt-2 p-2 rounded ${
              errors.present_transfer_status
                ? "bg-red-50 border border-red-200"
                : ""
            }`}
          >
            <label className="flex items-start gap-2">
              <input
                disabled={isEmployee}
                type="radio"
                value="Approved DSC Transfer"
                {...register("present_transfer_status")}
                className="mt-1"
              />
              <span>
                The KYC details of the above member in the UAN database have
                been approved with Digital Signature Certificate and transfer
                request has been generated on portal
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                disabled={isEmployee}
                type="radio"
                value="Physical Claim"
                {...register("present_transfer_status")}
                className="mt-1"
              />
              <span>
                As the DSC of establishment are not registered with EPFO, the
                member has been informed to file physical claim (Form-13) for
                transfer of funds from his previous establishment.
              </span>
            </label>
          </div>
          {errors.present_transfer_status && (
            <p className="text-red-500 text-[10px] mt-1">
              {errors.present_transfer_status.message}
            </p>
          )}
        </li>
      </ul>

      <div className="flex justify-between mt-12 items-end">
        <span>Date:</span>
        <div className="text-center">
          <div className="w-48 h-12 mb-1"></div>
          <span>Signature of Employer with Seal of Establishment</span>
        </div>
      </div>
    </div>
  );
};

export default EPFEmployerDeclaration;
