import React from "react";
import { MapPin } from "lucide-react";

const AddressCard = ({ employee }) => {
  const perm = employee.permanent_address || {};
  const comm = employee.communication_address || {};

  const isSame = comm.is_same_as_permanent || false;
  const effectiveComm = isSame ? perm : comm;

  const renderAddressSection = (title, addr, showSameBadge = false) => {
    const fullLine = [addr.address_line1, addr.address_line2, addr.landmark]
      .filter(Boolean)
      .join(", ");

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-1.5 uppercase tracking-wider flex items-center justify-between">
          <span>{title}</span>
          {showSameBadge && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm normal-case border border-blue-100">
              Same as Permanent Address
            </span>
          )}
        </h4>
        <div>
          <p className="text-xs text-gray-400">Address</p>
          <p className="text-sm text-gray-800 font-medium leading-relaxed">
            {fullLine || "N/A"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p className="text-xs text-gray-400">Post Office</p>
            <p className="text-sm text-gray-800 font-medium truncate">
              {addr.post_office || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">City</p>
            <p className="text-sm text-gray-800 font-medium truncate">
              {addr.city || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">District</p>
            <p className="text-sm text-gray-800 font-medium truncate">
              {addr.district || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">State</p>
            <p className="text-sm text-gray-800 font-medium truncate">
              {addr.state || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Pincode</p>
            <p className="text-sm text-gray-800 font-medium truncate">
              {addr.pincode || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Country</p>
            <p className="text-sm text-gray-800 font-medium truncate">
              {addr.country || "N/A"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full font-inter">
      <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-50">
        <div className="p-1.5 bg-(--color-secondary)/10 text-(--color-secondary) rounded-lg">
          <MapPin size={18} />
        </div>
        <h3 className="text-lg font-bold text-(--color-text-dark)">Address Details</h3>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {renderAddressSection("Permanent Address", perm)}
        {renderAddressSection("Communication Address", effectiveComm, isSame)}
      </div>
    </div>
  );
};

export default AddressCard;
