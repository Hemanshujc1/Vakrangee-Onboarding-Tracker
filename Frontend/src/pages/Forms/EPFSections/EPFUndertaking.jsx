import React from "react";

const EPFUndertaking = ({ register, errors }) => {
  return (
    <div className="mt-8 pt-4">
      <h1 className="font-bold underline underline-offset-4 text-center mb-4">
        Undertaking
      </h1>
      <ul className="list-decimal list-inside text-sm space-y-1 mb-6">
        <li>
          Certified that the particulars are true to the best of my knowledge
        </li>
        <li>
          I authorise EPFO to use my Aadhar for verification / authentication /
          eKYC purpose for service delivery
        </li>
        <li>
          Kindly transfer the fund and service details, if applicable, from the
          previous PF account as declared above to the present PF account.
        </li>
        <li>
          In case of changes in above details, the same will be intimated to
          employer at the earliest.
        </li>
      </ul>

      <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
        <div className="text-sm flex flex-col gap-3">
          <p>Date: {new Date().toLocaleDateString("en-GB")}</p>
          <p>
            Place:{" "}
            <input
              type="text"
              placeholder="Enter Place"
              {...register("place")}
              className={`border-b outline-none px-1 ${
                errors.place ? "border-red-500" : "border-gray-400"
              }`}
            />
          </p>
          {errors.place && (
            <p className="text-red-500 text-[10px]">{errors.place.message}</p>
          )}
        </div>

        <div>
          <p className="text-center text-xs mt-1 text-gray-500 italic">
            Signature of the Employee
          </p>
        </div>
      </div>
    </div>
  );
};

export default EPFUndertaking;
