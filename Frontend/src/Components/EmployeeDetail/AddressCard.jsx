import React from "react";
import { MapPin } from "lucide-react";

const AddressCard = ({ employee }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#4E4E4E]">Employee Address</h3>
        <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
          <MapPin size={20} />
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-400">Address</p>
          <p className="text-sm text-gray-800 font-medium">
            {[employee.addressLine1, employee.addressLine2, employee.landmark]
              .filter(Boolean)
              .join(", ") || "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-400">Post Office</p>
            <p className="text-sm text-gray-800 font-medium">
              {employee.postOffice || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">City</p>
            <p className="text-sm text-gray-800 font-medium">
              {employee.city || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">District</p>
            <p className="text-sm text-gray-800 font-medium">
              {employee.district || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">State</p>
            <p className="text-sm text-gray-800 font-medium">
              {employee.state || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Pincode</p>
            <p className="text-sm text-gray-800 font-medium">
              {employee.pincode || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Country</p>
            <p className="text-sm text-gray-800 font-medium">
              {employee.country || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
