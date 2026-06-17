import React from "react";
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
} from "lucide-react";
import CollapsibleSection from "../UI/CollapsibleSection";
import InfoField from "../UI/InfoField";
import { useToggleSections } from "../../hooks/useToggleSections";
import { formatDate } from "../../utils/basicInfoHelpers";

const PersonalInfoGrid = ({ employee, isEditing, editForm, setEditForm }) => {
  const [openSections, toggleSection] = useToggleSections({
    personal: true,
    emergency: false,
    academic: false,
  });

  return (
    <div className="py-4 space-y-8">
      {/* Personal & Contact Section */}
      <CollapsibleSection
        title="Personal & Contact Information"
        icon={UserCheck}
        isOpen={openSections.personal}
        onToggle={() => toggleSection("personal")}
        gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        <InfoField
          icon={Mail}
          label="Personal Email Address"
          value={employee.personal_email_id || employee.personalEmail}
          className="break-all"
          isEditing={isEditing}
          editInput={
            <input
              type="email"
              value={editForm.personalEmail}
              onChange={(e) =>
                setEditForm({ ...editForm, personalEmail: e.target.value })
              }
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-(--color-primary)"
              placeholder="Email"
            />
          }
        />
        <InfoField
          icon={Phone}
          label="Phone Number"
          value={employee.phone}
        />
        <InfoField
          icon={Users}
          label="Gender"
          value={employee.gender}
        />
        <InfoField
          icon={CalendarDays}
          label="Date of Birth (as per PAN)"
          value={formatDate(employee.date_of_birth || employee.dateOfBirth)}
        />
        <InfoField
          icon={Activity}
          label="Blood Group"
          value={employee.bloodGroup || employee.blood_group}
        />
        <InfoField
          icon={Building}
          label="PAN Number"
          value={employee.pan_number || employee.panNumber}
          className="break-all"
        />
        <InfoField
          icon={Fingerprint}
          label="Aadhaar Number"
          value={
            employee.adhar_number || employee.adharNumber
              ? "XXXX XXXX " +
                (employee.adhar_number || employee.adharNumber).slice(-4)
              : null
          }
        />
      </CollapsibleSection>

      {/* Emergency Contact Section */}
      <CollapsibleSection
        title="Emergency Contact Details"
        icon={PhoneCall}
        isOpen={openSections.emergency}
        onToggle={() => toggleSection("emergency")}
        gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        <InfoField
          icon={User}
          label="Contact Name"
          value={
            employee.emergencyContactName ||
            employee.emergency_contact_name
          }
        />
        <InfoField
          icon={Users}
          label="Relationship"
          value={
            employee.emergencyContactRelationship ||
            employee.emergency_contact_relationship
          }
        />
        <InfoField
          icon={PhoneCall}
          label="Contact Number"
          value={
            employee.emergencyContactNumber ||
            employee.emergency_contact_number
          }
        />
      </CollapsibleSection>

      {/* Academic Details Section */}
      <CollapsibleSection
        title="Academic Details & Signature"
        icon={GraduationCap}
        isOpen={openSections.academic}
        onToggle={() => toggleSection("academic")}
        gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        <InfoField
          icon={GraduationCap}
          label="10th Percentage"
          value={
            employee.tenth_percentage || employee.tenthPercentage
              ? `${employee.tenth_percentage || employee.tenthPercentage}%`
              : null
          }
        />
        <InfoField
          icon={GraduationCap}
          label="12th Percentage"
          value={
            employee.twelfth_percentage || employee.twelfthPercentage
              ? `${employee.twelfth_percentage || employee.twelfthPercentage}%`
              : null
          }
        />
        <InfoField
          icon={Award}
          label="Degree Name"
          value={employee.degree_name}
        />
        <InfoField
          icon={Percent}
          label="Degree Percentage"
          value={
            employee.degree_percentage !== undefined &&
            employee.degree_percentage !== null
              ? `${employee.degree_percentage}%`
              : null
          }
        />

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
      </CollapsibleSection>
    </div>
  );
};

export default PersonalInfoGrid;
