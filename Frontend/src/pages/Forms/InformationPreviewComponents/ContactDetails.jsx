import React from "react";
import {
  PrintText,
  PrintCheckbox,
  PrintSectionHeader,
} from "../../../Components/Forms/Shared/PrintComponents";

const ContactDetails = ({ data }) => {
  return (
    <>
      <PrintSectionHeader title="Contact Details (Fill In Block Letters)" />

      {/* Current Address */}
      <div className="mb-4 text-xs">
        <h3 className="text-center font-bold bg-gray-100 text-black tracking-wider italic border-x border-t border-gray-800 text-sm py-1">
          Current Address
        </h3>
        <div className="border border-gray-800 p-2 space-y-2">
          <div className="flex items-center">
            <span className="font-semibold w-24">Residence (√)</span>
            <div className="flex gap-4 flex-wrap">
              {[
                "Owned",
                "Parental",
                "Rental",
                "Hostel/ PG",
                "With Relative",
              ].map((opt) => (
                <PrintCheckbox
                  key={opt}
                  label={opt}
                  checked={data.current_residence_type === opt}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
            <span className="font-semibold">Building Name</span>
            <PrintText value={data.current_building_name} />
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
            <span className="font-semibold">Landlord's Name</span>
            <PrintText value={data.current_landlord_name} />
          </div>

          <div className="flex flex-col md:flex-row print:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold">Flat/House No</span>
              <PrintText
                value={data.current_flat_house_no}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold">Block No/Street No</span>
              <PrintText
                value={data.current_block_street_no}
                className="flex-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
            <span className="font-semibold">Street name</span>
            <PrintText value={data.current_street_name} />
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
            <span className="font-semibold">City</span>
            <PrintText value={data.current_city} />
          </div>

          <div className="flex flex-col md:flex-row print:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold w-20">District</span>
              <PrintText value={data.current_district} className="flex-1" />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold">Post Office</span>
              <PrintText value={data.current_post_office} className="flex-1" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row print:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold w-20">State</span>
              <PrintText value={data.current_state} className="flex-1" />
            </div>
            <div className="flex items-center gap-2 md:w-40 w-full print:w-40">
              <span className="font-semibold">Pin Code</span>
              <PrintText value={data.current_pin_code} className="flex-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Permanent Address */}
      <div className="mb-6 text-xs">
        <h3 className="text-center font-bold italic bg-gray-100 text-black tracking-wider border-x border-t border-gray-800 text-sm py-1">
          Permanent Address
        </h3>
        <div className="border border-gray-800 p-2 space-y-2">
          <div className="flex items-center">
            <span className="font-semibold w-24">Residence (√)</span>
            <div className="flex gap-4 flex-wrap">
              {[
                "Owned",
                "Parental",
                "Rental",
                "Hostel/ PG",
                "With Relative",
              ].map((opt) => (
                <PrintCheckbox
                  key={opt}
                  label={opt}
                  checked={data.permanent_residence_type === opt}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
            <span className="font-semibold">Bldg Name</span>
            <PrintText value={data.permanent_building_name} />
          </div>

          <div className="flex flex-col md:flex-row print:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold">Flat/House No</span>
              <PrintText
                value={data.permanent_flat_house_no}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold">Block No/Street No</span>
              <PrintText
                value={data.permanent_block_street_no}
                className="flex-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
            <span className="font-semibold">Street name</span>
            <PrintText value={data.permanent_street_name} />
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
            <span className="font-semibold">City</span>
            <PrintText value={data.permanent_city} />
          </div>

          <div className="flex flex-col md:flex-row print:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold w-20">District</span>
              <PrintText value={data.permanent_district} className="flex-1" />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold">Post Office</span>
              <PrintText
                value={data.permanent_post_office}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row print:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold w-20">State</span>
              <PrintText value={data.permanent_state} className="flex-1" />
            </div>
            <div className="flex items-center gap-2 md:w-40 w-full print:w-40">
              <span className="font-semibold">Pin Code</span>
              <PrintText value={data.permanent_pin_code} className="flex-1" />
            </div>
          </div>
        </div>
      </div>
      <div className="print:break-before-page mt-8"></div>
    </>
  );
};

export default ContactDetails;
