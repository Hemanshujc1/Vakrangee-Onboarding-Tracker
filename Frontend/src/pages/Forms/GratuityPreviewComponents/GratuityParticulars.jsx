import React from "react";

const GratuityParticulars = ({ formData, formatDate }) => {
  return (
    <div className="space-y-6">
      {/* Address */}
      <div>
        <span className="font-bold">To,</span>
        <p className="ml-0 mt-1 mb-1 text-xs ">
          (Give here name or description of the establishment with full address)
        </p>
        <div className="ml-2 mt-1 text-xs">
          <p className="font-bold">Vakrangee Limited</p>
          <p>
            Plot No. 93, Road No-16, M.I.D.C., Marol, Andheri (East), Mumbai -
            400093, Maharashtra.
          </p>
        </div>
      </div>

      {/* Declaration */}
      <div>
        <div className="flex flex-col md:flex-row print:flex-row gap-2 text-xs">
          <span className="whitespace-nowrap mt-1">
            I, Shri/Shrimati/Kumari
          </span>
          <div className="flex flex-col flex-1">
            <span className="border-b border-black px-2 font-bold uppercase w-full">
              {formData.firstname} {formData.middlename || ""}{" "}
              {formData.lastname}
            </span>
            <span className="block mt-1 text-left">(Name in full here)</span>
          </div>
        </div>
        <p className="mt-2">
          whose particulars are given in the statement below, hereby nominate
          the person(s) mentioned below to receive the gratuity payable after my
          death as also the gratuity standing to my credit in the event of my
          death before that amount has become payable, or having become payable
          has not been paid and direct that the said amount of gratuity shall be
          paid in proportion indicated against the name(s) of the nominee(s).
        </p>
      </div>

      {/* Clauses */}
      <div className="space-y-1 text-sm">
        <div className="flex gap-2">
          <span>2.</span>
          <p>
            I hereby certify that the person(s) mentioned is/are a member(s) of
            my family within the meaning of clause (h) of Section 2 of the
            Payment of Gratuity Act, 1972.
          </p>
        </div>
        <div className="flex gap-2">
          <span>3.</span>
          <p>
            I hereby declare that I have no family within the meaning of clause
            (h) of Section 2 of the said Act.
          </p>
        </div>
        <div className="flex gap-2">
          <span>4</span>
          <div className="space-y-1">
            <p>(a) My father/mother/parents is/are not dependent on me.</p>
            <p>
              (b) My husband's father/mother/parents is/are not dependent on my
              husband.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span>5.</span>
          <p>
            I have excluded my husband from my family by a notice dated the{" "}
            <span className="border-b border-black inline-block w-24 text-center">
              {formatDate(formData.notice_date)}
            </span>{" "}
            to the controlling authority in terms of the proviso to clause (h)
            of Section 2 of the said Act.
          </p>
        </div>
        <div className="flex gap-2">
          <span>6.</span>
          <p>Nomination made herein invalidates my previous nomination.</p>
        </div>
      </div>
    </div>
  );
};

export default GratuityParticulars;
