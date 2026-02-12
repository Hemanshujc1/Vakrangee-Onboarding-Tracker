import React from "react";
import {
  PrintText,
  PrintCheckbox,
  PrintSectionHeader,
  PrintDateBlock,
} from "../../../Components/Forms/Shared/PrintComponents";

const PersonalDetails = ({ data }) => {
  return (
    <>
      <PrintSectionHeader title="Personal Details" />

      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full mb-6">
        <div className="min-w-150 print:min-w-0 grid grid-cols-[140px_1fr] gap-y-2 items-center text-xs">
          <span className="font-semibold">First Name</span>
          <PrintText value={data.first_name} />

          <span className="font-semibold">Middle Name</span>
          <PrintText value={data.middle_name} />

          <span className="font-semibold">Last Name</span>
          <PrintText value={data.last_name} />

          <span className="font-semibold">Father's First Name</span>
          <PrintText value={data.father_name} />

          <span className="font-semibold">Middle Name</span>
          <PrintText value={data.father_middle_name} />

          <span className="font-semibold">Last Name</span>
          <PrintText value={data.father_last_name} />

          <span className="font-semibold">Date of Birth</span>
          <div className="flex gap-4">
            <PrintDateBlock date={data.date_of_birth} />
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold whitespace-nowrap">
                Birth City
              </span>
              <PrintText value={data.birth_city} className="flex-1" />
            </div>
          </div>

          <span className="font-semibold">Birth State</span>
          <div className="flex gap-4">
            <PrintText value={data.birth_state} className="w-1/2" />
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold">Country</span>
              <PrintText value={data.country} className="flex-1" />
            </div>
          </div>

          <span className="font-semibold">Blood Group</span>
          <PrintText value={data.blood_group} className="w-24" />

          <span className="font-semibold">Gender (√)</span>
          <div className="flex items-center">
            <PrintCheckbox label="Male" checked={data.gender === "Male"} />
            <PrintCheckbox label="Female" checked={data.gender === "Female"} />
            <PrintCheckbox label="Other" checked={data.gender === "Other"} />

            <div className="flex ml-8 border-l pl-4 border-gray-400 items-center">
              <span className="font-semibold mr-4">Marital Status (√)</span>
              <PrintCheckbox
                label="Married"
                checked={data.marital_status === "Married"}
              />
              <PrintCheckbox
                label="Unmarried"
                checked={data.marital_status === "Unmarried"}
              />
            </div>
          </div>

          <span className="font-semibold">Passport Number</span>
          <PrintText value={data.passport_number} />

          <span className="font-semibold">Issue date</span>
          <div className="flex gap-4">
            <PrintDateBlock date={data.passport_date_of_issue} />
            <div className="flex items-center gap-2">
              <span className="font-semibold">Expiry date</span>
              <PrintDateBlock date={data.passport_expiry_date} />
            </div>
          </div>

          <span className="font-semibold">PAN No.</span>
          <PrintText value={data.pan_number} />

          <span className="font-semibold">Aadhar No.</span>
          <PrintText value={data.aadhar_number} />

          <span className="font-semibold">STD Code</span>
          <div className="flex gap-4 items-center">
            <PrintText value={data.std_code} className="w-20" />
            <span className="font-semibold whitespace-nowrap">
              Alternate No.
            </span>
            <PrintText value={data.alternate_no} className="flex-1" />
          </div>

          <span className="font-semibold">Mobile No.</span>
          <PrintText value={data.mobile_no} />

          <span className="font-semibold">Emergency No.</span>
          <PrintText value={data.emergency_no} />

          <span className="font-semibold">Personal Email</span>
          <PrintText value={data.personal_email} />
        </div>
      </div>
      <div className="print:break-before-page mt-8"></div>
    </>
  );
};

export default PersonalDetails;
