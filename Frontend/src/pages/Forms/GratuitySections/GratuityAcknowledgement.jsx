import React from "react";
import { formatToday } from "../../../utils/basicInfoHelpers";

const GratuityAcknowledgement = () => (
  <div className="mt-12 mb-5 pt-6 border-t-4 border-gray-900 page-break-inside-avoid">
    <h4 className="font-bold text-lg text-center mb-6">
      Acknowledgement by the Employee
    </h4>
    <p>
      Received the duplicate copy of nomination in Form 'F' filed by me and duly
      certified by the employer.
    </p>
    <div className="flex justify-between items-end mt-12">
      <div>
        <p>Date: {formatToday()}</p>
      </div>
    </div>
  </div>
);

export default GratuityAcknowledgement;
