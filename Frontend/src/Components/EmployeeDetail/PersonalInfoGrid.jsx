import React from "react";
import {
  Mail,
  Phone,
  Building,
  Users,
  CalendarDays,
  UserCheck,
  ShieldCheck,
  Save,
} from "lucide-react";

const PersonalInfoGrid = ({ employee, isEditing, editForm, setEditForm }) => {
  return (
    <div className="space-y-0">
      {/* Personal & Contact Section */}
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-50">
          <div className="p-1.5 bg-(--color-primary)/10 text-(--color-primary)  rounded-lg">
            <UserCheck size={18} />
          </div>
          <h3 className="text-lg font-bold text-(--color-text-dark)">
            Personal & Contact Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
          {/* Email */}
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary)">
              <Mail size={18} />
            </div>
            <div className="w-full">
              <p className="text-xs text-gray-400">Personal Email Address</p>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.personalEmail}
                  onChange={(e) =>
                    setEditForm({ ...editForm, personalEmail: e.target.value })
                  }
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-(--color-primary)"
                  placeholder="Email"
                />
              ) : (
                <p className="font-medium text-sm">
                  {employee.personalEmail || "N/A"}
                </p>
              )}
            </div>
          </div>
          {/* Phone */}
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary)">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Phone Number</p>
              <p className="font-medium text-sm">{employee.phone || "N/A"}</p>
            </div>
          </div>
          {/* Gender */}
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary)">
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Gender</p>
              <p className="font-medium text-sm">{employee.gender || "N/A"}</p>
            </div>
          </div>
          {/* date of birth */}
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary)">
              <CalendarDays size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">
                Date of Birth (as per PAN)
              </p>
              <p className="font-medium text-sm">
                {employee.dateOfBirth
                  ? new Date(employee.dateOfBirth).toLocaleDateString("en-GB")
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* PAN Number */}
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary)">
              <Building size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">PAN Number</p>
              <p className="font-medium text-sm">
                {employee.panNumber || "N/A"}
              </p>
            </div>
          </div>

          {/* Aadhaar Number */}
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary)">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Aadhaar Number</p>
              <p className="font-medium text-sm">
                {employee.adharNumber
                  ? "XXXX XXXX " + employee.adharNumber.slice(-4)
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* 10th Percentage */}
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary)">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">10th Percentage</p>
              <p className="font-medium text-sm">
                {employee.tenthPercentage
                  ? `${employee.tenthPercentage}%`
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* 12th Percentage */}
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary)">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">12th Percentage</p>
              <p className="font-medium text-sm">
                {employee.twelfthPercentage
                  ? `${employee.twelfthPercentage}%`
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-gray-600">
            <span className="text-xs text-gray-400">Employee Signature</span>
            <div className="bg-gray-50 rounded-lg border border-dashed border-gray-200 p-2 w-fit min-w-[120px]">
              {employee.signature ? (
                <img
                  src={`/uploads/signatures/${employee.signature}`}
                  alt="Signature"
                  className="max-h-12 object-contain mix-blend-multiply transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="text-center py-1">
                  <div className="mx-auto w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-1">
                    <Save size={12} />
                  </div>
                  <p className="text-gray-400 text-[9px] italic">
                    No signature found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoGrid;
