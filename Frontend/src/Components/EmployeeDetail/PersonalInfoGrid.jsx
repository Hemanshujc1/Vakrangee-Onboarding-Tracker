import React, { useState } from "react";
import {
  Mail,
  Phone,
  Building,
  Users,
  CalendarDays,
  UserCheck,
  Save,
  GraduationCap,
  Fingerprint,
  Award,
  Percent,
  Activity,
  PhoneCall,
  User,
  ChevronDown,
} from "lucide-react";

const PersonalInfoGrid = ({ employee, isEditing, editForm, setEditForm }) => {
  const [openSections, setOpenSections] = useState({
    personal: true,
    emergency: false,
    academic: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="py-4 space-y-8">
      {/* Personal & Contact Section */}
      <div>
        <button
          onClick={() => toggleSection("personal")}
          className="w-full flex items-center justify-between pb-2 border-b border-gray-100 hover:text-(--color-primary) transition-colors text-left focus:outline-none group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-(--color-primary)/10 text-(--color-primary) rounded-lg group-hover:bg-(--color-primary)/20 transition-colors">
              <UserCheck size={18} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-(--color-text-dark) group-hover:text-(--color-primary) transition-colors">
              Personal & Contact Information
            </h3>
          </div>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-200 group-hover:text-(--color-primary) ${
              openSections.personal ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.personal && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-6 mt-6">
            {/* First Name */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">First Name</p>
                <p className="font-medium text-sm wrap-break-word">
                  {employee.firstName || employee.firstname || "N/A"}
                </p>
              </div>
            </div>
            {/* Middle Name */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Middle Name</p>
                <p className="font-medium text-sm wrap-break-word">
                  {employee.middleName || employee.middlename || "N/A"}
                </p>
              </div>
            </div>
            {/* Last Name */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Last Name</p>
                <p className="font-medium text-sm wrap-break-word">
                  {employee.lastName || employee.lastname || "N/A"}
                </p>
              </div>
            </div>
            {/* Email */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <Mail size={18} />
              </div>
              <div className="min-w-0 w-full">
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
                  <p className="font-medium text-sm break-all">
                    {employee.personal_email_id ||
                      employee.personalEmail ||
                      "N/A"}
                  </p>
                )}
              </div>
            </div>
            {/* Phone */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <Phone size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Phone Number</p>
                <p className="font-medium text-sm wrap-break-word">
                  {employee.phone || "N/A"}
                </p>
              </div>
            </div>
            {/* Gender */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <Users size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Gender</p>
                <p className="font-medium text-sm wrap-break-word">
                  {employee.gender || "N/A"}
                </p>
              </div>
            </div>
            {/* Date of Birth */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <CalendarDays size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">
                  Date of Birth (as per PAN)
                </p>
                <p className="font-medium text-sm wrap-break-word">
                  {employee.date_of_birth || employee.dateOfBirth
                    ? new Date(
                        employee.date_of_birth || employee.dateOfBirth,
                      ).toLocaleDateString("en-GB")
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Blood Group */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <Activity size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Blood Group</p>
                <p className="font-medium text-sm wrap-break-word">
                  {employee.bloodGroup || employee.blood_group || "N/A"}
                </p>
              </div>
            </div>

            {/* PAN Number */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <Building size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">PAN Number</p>
                <p className="font-medium text-sm break-all">
                  {employee.pan_number || employee.panNumber || "N/A"}
                </p>
              </div>
            </div>

            {/* Aadhaar Number */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <Fingerprint size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Aadhaar Number</p>
                <p className="font-medium text-sm wrap-break-word">
                  {employee.adhar_number || employee.adharNumber
                    ? "XXXX XXXX " +
                      (employee.adhar_number || employee.adharNumber).slice(-4)
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contact Section */}
      <div>
        <button
          onClick={() => toggleSection("emergency")}
          className="w-full flex items-center justify-between pb-2 border-b border-gray-100 hover:text-(--color-primary) transition-colors text-left focus:outline-none group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-(--color-primary)/10 text-(--color-primary) rounded-lg group-hover:bg-(--color-primary)/20 transition-colors">
              <PhoneCall size={18} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-(--color-text-dark) group-hover:text-(--color-primary) transition-colors">
              Emergency Contact Details
            </h3>
          </div>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-200 group-hover:text-(--color-primary) ${
              openSections.emergency ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.emergency && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-6 mt-6">
            {/* Emergency Contact Name */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Contact Name</p>
                <p className="font-medium text-sm wrap-break-word">
                  {employee.emergencyContactName ||
                    employee.emergency_contact_name ||
                    "N/A"}
                </p>
              </div>
            </div>

            {/* Emergency Contact Relationship */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <Users size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Relationship</p>
                <p className="font-medium text-sm wrap-break-word">
                  {employee.emergencyContactRelationship ||
                    employee.emergency_contact_relationship ||
                    "N/A"}
                </p>
              </div>
            </div>

            {/* Emergency Contact Number */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <PhoneCall size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Contact Number</p>
                <p className="font-medium text-sm wrap-break-word">
                  {employee.emergencyContactNumber ||
                    employee.emergency_contact_number ||
                    "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Academic Details Section */}
      <div>
        <button
          onClick={() => toggleSection("academic")}
          className="w-full flex items-center justify-between pb-2 border-b border-gray-100 hover:text-(--color-primary) transition-colors text-left focus:outline-none group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-(--color-primary)/10 text-(--color-primary) rounded-lg group-hover:bg-(--color-primary)/20 transition-colors">
              <GraduationCap size={18} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-(--color-text-dark) group-hover:text-(--color-primary) transition-colors">
              Academic Details & Signature
            </h3>
          </div>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-200 group-hover:text-(--color-primary) ${
              openSections.academic ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.academic && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-6 mt-6">
            {/* 10th Percentage */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <GraduationCap size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">10th Percentage</p>
                <p className="font-medium text-sm">
                  {employee.tenth_percentage || employee.tenthPercentage
                    ? `${employee.tenth_percentage || employee.tenthPercentage}%`
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* 12th Percentage */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <GraduationCap size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">12th Percentage</p>
                <p className="font-medium text-sm">
                  {employee.twelfth_percentage || employee.twelfthPercentage
                    ? `${employee.twelfth_percentage || employee.twelfthPercentage}%`
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Degree Name */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <Award size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Degree Name</p>
                <p className="font-medium text-sm wrap-break-word">
                  {employee.degree_name || "N/A"}
                </p>
              </div>
            </div>

            {/* Degree Percentage */}
            <div className="flex items-start gap-3 text-gray-600 min-w-0">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
                <Percent size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Degree Percentage</p>
                <p className="font-medium text-sm">
                  {employee.degree_percentage !== undefined &&
                  employee.degree_percentage !== null
                    ? `${employee.degree_percentage}%`
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Signature */}
            <div className="flex flex-col gap-1 text-gray-600 min-w-0">
              <span className="text-xs text-gray-400">Employee Signature</span>
              <div className="bg-gray-50 rounded-lg border border-dashed border-gray-200 p-2 w-fit min-w-30 max-w-full">
                {employee.signature ? (
                  <img
                    src={`/uploads/signatures/${employee.signature}`}
                    alt="Signature"
                    className="max-h-12 object-contain mix-blend-multiply"
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
        )}
      </div>
    </div>
  );
};

export default PersonalInfoGrid;
