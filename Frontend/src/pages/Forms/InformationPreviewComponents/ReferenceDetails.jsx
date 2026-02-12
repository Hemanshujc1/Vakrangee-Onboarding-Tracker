import React from "react";
import {
  PrintText,
  PrintSectionHeader,
} from "../../../Components/Forms/Shared/PrintComponents";

const ReferenceDetails = ({ data }) => {
  return (
    <>
      <div className="print:break-before-page mt-8"></div>

      <PrintSectionHeader title="Reference Details (Fill in block letters)" />

      {(data.references || [{}, {}]).map((ref, index) => (
        <div
          key={index}
          className="mb-6 border-b border-gray-100 pb-4 break-inside-avoid"
        >
          <h4 className="font-bold mb-2 uppercase">Reference {index + 1}</h4>
          <div className="grid grid-cols-[100px_1fr] gap-2 mb-2 items-center text-xs">
            <span className="font-semibold">Name</span>
            <PrintText value={ref.name} />

            <span className="font-semibold">Address</span>
            <PrintText value={ref.address} />

            <span className="font-semibold">Telephone No</span>
            <PrintText value={ref.tel} />
            <span className="font-semibold">Mobile No</span>
            <PrintText value={ref.mob} />

            <span className="font-semibold">Email</span>
            <PrintText value={ref.email} className="normal-case" />
            <span className="font-semibold">Designation</span>
            <PrintText value={ref.designation} />
          </div>
        </div>
      ))}
    </>
  );
};

export default ReferenceDetails;
