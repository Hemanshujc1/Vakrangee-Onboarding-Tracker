import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useAutoFill from "../../hooks/useAutoFill";
import PreviewActions from "../../Components/Forms/Shared/PreviewActions";
import { PrintText, PrintCheckbox, PrintSectionHeader, PrintDateBlock, LinedTextArea } from "../../Components/Forms/Shared/PrintComponents";
import { useAlert } from "../../context/AlertContext";



const PreviewInformation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useAlert();
  const [actionLoading, setActionLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId = id || user.id;

  const { data: autoFillData, loading } = useAutoFill(employeeId);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Variables for PreviewActions
  const status = autoFillData?.employeeInfoStatus || "PENDING";
  const rejectionReason = autoFillData?.employeeInfoRejectionReason;
  const isHR = ["HR_ADMIN", "HR_SUPER_ADMIN", "admin"].includes(user.role);

  if (loading)
    return <div className="p-10 text-center">Loading Preview...</div>;

  const data = autoFillData?.employeeInfoData || {};
  const record = autoFillData || {}; // Fallback for some fields if needed

  const handleSubmit = async () => {
      const isConfirmed = await showConfirm("Are you sure you want to submit? You won't be able to edit afterwards.");
      if(!isConfirmed) return;
      
      setActionLoading(true);
      try {
          const token = localStorage.getItem('token');
          const payload = { ...data, isDraft: false }; 
          
          await axios.post("/api/forms/save-employee-info", payload, {
             headers: { Authorization: `Bearer ${token}` }
          });
          
          await showAlert("Form Submitted Successfully!", { type: 'success' });
          window.location.reload();
      } catch(err) {
          console.error(err);
          await showAlert("Submission failed", { type: 'error' });
      } finally {
          setActionLoading(false);
      }
  };

  const handleVerification = async (newStatus, reason = null) => {
    const isConfirmed = await showConfirm(
      `Are you sure you want to ${
        newStatus === "VERIFIED" ? "approve" : "reject"
      } this form?`
    );
    if (!isConfirmed) return;

    if (newStatus === "REJECTED" && !reason) {
      reason = prompt("Please enter a reason for rejection:");
      if (!reason) return; // Cancelled if no reason provided
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/forms/verify-employee-info/${employeeId}`,
        {
          status: newStatus,
          remarks: reason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await showAlert(
        `Form ${
          newStatus === "VERIFIED" ? "Approved" : "Rejected"
        } Successfully!`,
        { type: 'success' }
      );
      window.location.reload();
    } catch (error) {
      console.error("Verification Error:", error);
      await showAlert("Failed to update status.", { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };


  return (
    <div className="max-w-[210mm] mx-auto bg-white p-8 print:p-0 font-sans text-xs">
    
      {/* Actions Bar */}
      <div className="mb-6 print:hidden">
        <PreviewActions
            status={status}
            isHR={isHR}
            onBack={() => navigate(-1)}
            onPrint={() => window.print()}
            onSubmit={handleSubmit}
            onVerify={handleVerification}
            onEdit={() => navigate("/forms/employment-info")}
            isSubmitting={actionLoading}
        />
         {status === 'REJECTED' && rejectionReason && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                <strong>Rejected Reason:</strong> {rejectionReason}
            </div>
        )}
      </div>

      {/* Header */}
      <div className="text-center mb-6 relative">
        <img
          src="/Vakrangee Logo.svg"
          alt="Vakrangee"
          className="h-20 mx-auto mb-2"
        />
        {(data.profile_photo_path ||
          record.profile_photo_path ||
          record.profile_photo ||
          record.profilePhoto) && (
          <img
            src={`http://localhost:3001/uploads/profilepic/${(
              data.profile_photo_path ||
              record.profile_photo_path ||
              record.profile_photo ||
              record.profilePhoto
            ).replace(/^.*[\\\/]/, "")}`}
            alt="Profile"
            className="absolute top-30 right-0 w-32 h-32 object-cover border border-black"
          />
        )}
        <h1 className="text-2xl font-bold uppercase text-gray-800">
          Vakrangee
        </h1>
        <h2 className="text-xl font-bold inline-block pb-1 mb-2">
          Employee Information Form
        </h2>
        <p className="font-bold">Personal and Confidential</p>
      </div>

      <div className="p-0.5 mb-6 text-sm">
        <div className="p-2">
          <p className="font-bold mb-1">Instructions:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              All fields are Mandatory, where Not Applicable Please specify
              (NA).
            </li>
            <li>
              Kindly furnish all details correctly; the verification will be
              conducted on the basis of antecedents stated.
            </li>
            <li>
              After completing the form please ensure that you have attached all
              necessary documents.
            </li>
          </ul>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <span className="font-bold w-24 uppercase">Designation</span>
        <div className="border-b border-gray-800 flex-1 px-2 font-mono uppercase">
          {data.designation || record.job_title}
        </div>
      </div>

      {/* Personal Details */}
      <PrintSectionHeader title="Personal Details" />

      <div className="grid grid-cols-[140px_1fr] gap-y-2 mb-6 items-center">
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
            <span className="font-semibold whitespace-nowrap">Birth City</span>
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
          <span className="font-semibold whitespace-nowrap">Alternate No.</span>
          <PrintText value={data.alternate_no} className="flex-1" />
        </div>

        <span className="font-semibold">Mobile No.</span>
        <PrintText value={data.mobile_no} />

        <span className="font-semibold">Emergency No.</span>
        <PrintText value={data.emergency_no} />

        <span className="font-semibold">Email id</span>
        <PrintText value={data.personal_email} />
      </div>

      {/* Contact Details */}
      <PrintSectionHeader title="Contact Details (Fill In Block Letters)" />

      {/* Current Address */}
      <div className="mb-4">
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

          <div className="flex gap-4">
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

          <div className="flex gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold w-20">District</span>
              <PrintText value={data.current_district} className="flex-1" />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold">Post Office</span>
              <PrintText value={data.current_post_office} className="flex-1" />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold w-20">State</span>
              <PrintText value={data.current_state} className="flex-1" />
            </div>
            <div className="flex items-center gap-2 w-40">
              <span className="font-semibold">Pin Code</span>
              <PrintText value={data.current_pin_code} className="flex-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Permanent Address */}
      <div className="mb-6">
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

          <div className="flex gap-4">
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

          <div className="flex gap-4">
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

          <div className="flex gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold w-20">State</span>
              <PrintText value={data.permanent_state} className="flex-1" />
            </div>
            <div className="flex items-center gap-2 w-40">
              <span className="font-semibold">Pin Code</span>
              <PrintText value={data.permanent_pin_code} className="flex-1" />
            </div>
          </div>
        </div>
      </div>

      <div className="print:break-before-page mt-8"></div>

      {/* Educational Details */}
      <h3
        className="
      bg-gray-100 italic tracking-wider font-bold text-black border border-gray-800 p-1 text-center text-sm mb-2 mt-4"
      >
        Educational Details (Fill in block letters)
      </h3>

      {(data.educational_details || []).map((edu, index) => (
        <div
          key={index}
          className="border-x border-b border-gray-800 mb-4 text-xs break-inside-avoid"
        >
          {/* Course Name Selection Row */}
          <div className="flex border-b border-t border-gray-800">
            <div className="w-37.5 p-1 font-semibold border-r border-gray-800 flex items-center">
              Course Name
            </div>
            <div className="flex-1 flex items-center justify-around p-1">
              {["10th", "12th", "Graduation", "Post Graduation", "Others"].map(
                (c) => (
                  <PrintCheckbox key={c} label={c} checked={edu.course === c} />
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-[150px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center text-xs">
              Degree(Specialization)
            </div>
            <div className="p-1 uppercase">{edu.degree}</div>
          </div>

          <div className="grid grid-cols-[128px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center">
              Institute/College
            </div>
            <div className="p-1 uppercase">{edu.institute}</div>
          </div>

          <div className="grid grid-cols-[128px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center">
              Address
            </div>
            <div className="p-1 uppercase">{edu.address}</div>
          </div>

          <div className="flex border-b border-gray-800">
            <div className="w-32 p-1 font-semibold border-r border-gray-800 flex items-center">
              State
            </div>
            <div className="flex-1 p-1 uppercase border-r border-gray-800">
              {edu.state}
            </div>
            <div className="w-24 p-1 font-semibold border-r border-gray-800 flex items-center justify-center">
              Pin Code
            </div>
            <div className="w-32 p-1 uppercase">{edu.pin}</div>
          </div>

          <div className="grid grid-cols-[128px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center">
              University/Board
            </div>
            <div className="p-1 uppercase">{edu.university}</div>
          </div>

          <div className="grid grid-cols-[128px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center">
              Address
            </div>
            <div className="p-1 uppercase">{edu.universityAddress}</div>
          </div>

          <div className="flex border-b border-gray-800">
            <div className="w-32 p-1 font-semibold border-r border-gray-800 flex items-center">
              State
            </div>
            <div className="flex-1 p-1 uppercase border-r border-gray-800">
            {edu.universitystate}
            </div>
            <div className="w-24 p-1 font-semibold border-r border-gray-800 flex items-center justify-center">
              Pin Code
            </div>
            <div className="w-32 p-1 uppercase">
            {edu.universitypin}
            </div>
          </div>

          <div className="grid grid-cols-[128px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center">
              Roll No:
            </div>
            <div className="p-1 uppercase">{edu.rollNo}</div>
          </div>

          <div className="grid grid-cols-[128px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center">
              Enrollment No.
            </div>
            <div className="p-1 uppercase">{edu.enrollmentNo}</div>
          </div>

          <div className="flex border-b border-gray-800">
            <div className="w-32 p-1 font-semibold border-r border-gray-800 flex items-center">
              Duration
            </div>
            <div className="flex-1 flex">
              <div className="flex-1 flex items-center p-1 border-r border-gray-800">
                <span className="mr-2">Start:</span> {formatDate(edu.startDate)}
              </div>
              <div className="flex-1 flex items-center p-1">
                <span className="mr-2">End:</span> {formatDate(edu.endDate)}
              </div>
            </div>
          </div>

          <div className="flex border-b border-gray-800">
            <div className="w-32 p-1 font-semibold border-r border-gray-800 flex items-center">
              Status (√)
            </div>
            <div className="flex-1 flex items-center justify-around border-r border-gray-800">
              {["Completed", "Pursuing", "Dropped"].map((s) => (
                <PrintCheckbox key={s} label={s} checked={edu.status === s} />
              ))}
            </div>
            <div className="w-32 p-1 font-semibold border-r border-gray-800 flex items-center text-[10px] leading-tight">
              Total Marks %/CPA Obtained
            </div>
            <div className="w-32 p-1 uppercase flex items-center justify-center">
              {edu.marks}
            </div>
          </div>

          <div className="flex border-b border-gray-800">
            <div className="w-32 p-1 font-semibold border-r border-gray-800 flex items-center">
              Education Type (√)
            </div>
            <div className="flex-1 flex items-center justify-around">
              {["Regular", "Correspondence", "Part Time"].map((t) => (
                <PrintCheckbox key={t} label={t} checked={edu.educationType === t} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[128px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center text-[10px]">
              Any Other( Hall Ticket No etc)
            </div>
            <div className="p-1 uppercase">{edu.anyOther}</div>
          </div>

          <div className="grid grid-cols-[128px_1fr]">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center">
              Documents Attached
            </div>
            <div className="p-1 uppercase">{edu.documentsAttached}</div>
          </div>
        </div>
      ))}

      <div className="mb-8 relative break-inside-avoid">
        <h4 className="font-bold mb-4 uppercase text-sm">
          SIGNIFICANT ACHIEVEMENTS / OTHER COURSES / DIPLOMA COMPLETED: (Please
          mention Institute name / Year of completion / Duration)
        </h4>

        <LinedTextArea 
          value={(data.educational_details || [])
            .filter((edu) => edu.achievements)
            .map((edu) => `${edu.degree}: ${edu.achievements}`)
            .join('\n')} 
          minLines={8} 
        />
      </div>

      <div className="print:break-before-page mt-8"></div>

      <PrintSectionHeader title="Employment Details (Fill in block letters)" />

      {(data.employment_details || []).map((emp, index) => (
        <div
          key={index}
          className="border-x border-gray-800 mb-6 text-xs break-inside-avoid shadow-sm"
        >
          <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Company Name
            </div>
            <div className="p-1 uppercase flex items-center text-sm">
              {emp.companyName}
            </div>
          </div>

          <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Address
            </div>
            <div className="p-1 uppercase flex items-center text-sm">
              {emp.address}
            </div>
          </div>

          <div className="flex border-b border-gray-800">
            <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Employment Type
            </div>
            <div className="flex-1 flex items-center justify-around">
              {["Full Time", "Consultants", "Contractual", "Temporary"].map(
                (type) => (
                  <div
                    key={type}
                    className="flex items-center gap-1 border-r border-gray-800 last:border-0 h-full px-2 flex-1 justify-center"
                  >
                    <span className="font-semibold mr-1">{type}</span>
                    <div className="w-4 h-4 border border-gray-800 flex items-center justify-center">
                      {emp.empType === type && "✓"}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Employee Code
            </div>
            <div className="p-1 uppercase flex items-center">{emp.empCode}</div>
          </div>

          <div className="flex border-b border-gray-800">
            <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Tenure
            </div>
            <div className="flex-1 flex">
              <div className="flex flex-1 items-center border-r border-gray-800">
                <span className="px-2 font-semibold bg-gray-50 h-full flex items-center border-r border-gray-800">
                  Start Date
                </span>
                <span className="px-2 flex-1 text-center font-mono">
                  {formatDate(emp.startDate)}
                </span>
              </div>
              <div className="flex flex-1 items-center">
                <span className="px-2 font-semibold bg-gray-50 h-full flex items-center border-r border-gray-800">
                  End Date
                </span>
                <span className="px-2 flex-1 text-center font-mono">
                  {formatDate(emp.endDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Position Held
            </div>
            <div className="p-1 uppercase flex items-center">
              {emp.position}
            </div>
          </div>

          <div className="flex border-b border-gray-800">
            <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Compensation
            </div>
            <div className="flex-1 flex items-center p-1">
              <span className="font-semibold mr-2">INR (Rupees)</span>
              <span className="flex-1 border-b border-dotted border-gray-800 uppercase px-1">
                {emp.compensation}
              </span>
              <span className="font-semibold ml-2">Per Annum</span>
            </div>
          </div>

          <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              City Last Worked
            </div>
            <div className="p-1 uppercase flex items-center">{emp.city}</div>
          </div>

          <div className="grid grid-cols-[140px_1fr] border-b border-gray-800 bg-gray-100">
            <div className="p-1 font-bold border-r border-gray-800 flex items-center">
              HR Representative
            </div>
            <div className="p-1 uppercase font-bold">{emp.hrRep}</div>
          </div>

          <div className="flex border-b border-gray-800">
            <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Telephone No.
            </div>
            <div className="flex-1 flex text-xs">
              <div className="flex-1 border-r border-gray-800 p-1 uppercase">
                {emp.hrTel}
              </div>
              <div className="w-20 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50 justify-center">
                Mobile
              </div>
              <div className="flex-1 p-1 uppercase">{emp.hrMob}</div>
            </div>
          </div>
          <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Email
            </div>
            <div className="p-1 lowercase flex items-center">{emp.hrEmail}</div>
          </div>

          <div className="grid grid-cols-[140px_1fr] border-b border-gray-800 bg-gray-100">
            <div className="p-1 font-bold border-r border-gray-800 flex items-center">
              Supervisor Name
            </div>
            <div className="p-1 uppercase font-bold">{emp.supervisorName}</div>
          </div>

          <div className="flex border-b border-gray-800">
            <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Telephone No.
            </div>
            <div className="flex-1 flex text-xs">
              <div className="flex-1 border-r border-gray-800 p-1 uppercase">
                {emp.supTel}
              </div>
              <div className="w-20 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50 justify-center">
                Mobile
              </div>
              <div className="flex-1 p-1 uppercase">{emp.supMob}</div>
            </div>
          </div>
          <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Email
            </div>
            <div className="p-1 lowercase flex items-center">
              {emp.supEmail}
            </div>
          </div>
          <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Designation
            </div>
            <div className="p-1 uppercase flex items-center">
              {emp.designation}
            </div>
          </div>

          <div className="flex border-b border-gray-800">
            <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Reporting Period
            </div>
            <div className="flex-1 flex">
              <div className="flex flex-1 items-center border-r border-gray-800 text-[10px]">
                <span className="px-2 font-semibold bg-gray-50 h-full flex items-center border-r border-gray-800">
                  Start Date
                </span>
                <span className="px-2 flex-1 text-center font-mono">
                  {formatDate(emp.reportStartDate || emp.startDate)}
                </span>
              </div>
              <div className="flex flex-1 items-center text-[10px]">
                <span className="px-2 font-semibold bg-gray-50 h-full flex items-center border-r border-gray-800">
                  End Date
                </span>
                <span className="px-2 flex-1 text-center font-mono">
                  {formatDate(emp.reportEndDate || emp.endDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-800 p-1 text-[9px] italic text-left">
            In case the reporting period to the above Referee is less than 9
            months or any other Supervisor in the above stated tenure, Kindly
            give details of the next reporting Supervisor.
          </div>

          <div className="grid grid-cols-[140px_1fr] border-b border-gray-800 bg-gray-100">
            <div className="p-1 font-bold border-r border-gray-800 flex items-center">
              Supervisor Name
            </div>
            <div className="p-1 uppercase font-bold">{emp.supervisorName2}</div>
          </div>

          <div className="flex border-b border-gray-800">
            <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Telephone No.
            </div>
            <div className="flex-1 flex text-xs">
              <div className="flex-1 border-r border-gray-800 p-1 uppercase">
                {emp.supTel2}
              </div>
              <div className="w-20 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50 justify-center">
                Mobile
              </div>
              <div className="flex-1 p-1 uppercase">{emp.supMob2}</div>
            </div>
          </div>
          <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Email
            </div>
            <div className="p-1 lowercase flex items-center">
              {emp.supEmail2}
            </div>
          </div>
          <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Designation
            </div>
            <div className="p-1 uppercase flex items-center">
              {emp.designation2}
            </div>
          </div>

          <div className="flex border-b border-gray-800">
            <div className="w-35 p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50">
              Reporting Period
            </div>
            <div className="flex-1 flex">
              <div className="flex flex-1 items-center border-r border-gray-800 text-[10px]">
                <span className="px-2 font-semibold bg-gray-50 h-full flex items-center border-r border-gray-800">
                  Start Date
                </span>
                <span className="px-2 flex-1 text-center font-mono">
                  {formatDate(emp.reportStartDate2)}
                </span>
              </div>
              <div className="flex flex-1 items-center text-[10px]">
                <span className="px-2 font-semibold bg-gray-50 h-full flex items-center border-r border-gray-800">
                  End Date
                </span>
                <span className="px-2 flex-1 text-center font-mono">
                  {formatDate(emp.reportEndDate2)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50 h-24">
              Nature of Responsibilities (In Brief)
            </div>
            <div className="p-1 whitespace-pre-wrap">
              {emp.duties}
            </div>
          </div>

          <div className="grid grid-cols-[140px_1fr] border-b border-gray-800">
            <div className="p-1 font-semibold border-r border-gray-800 flex items-center bg-gray-50 h-16">
              Reasons for Leaving
            </div>
            <div className="p-1 whitespace-pre-wrap">
              {emp.reasonLeaving}
            </div>
          </div>
        </div>
      ))}
      

      <div className="print:break-before-page mt-8"></div>

      {/* References */}
      <PrintSectionHeader title="Reference Details (Fill in block letters)" />

      {(data.references || [{}, {}]).map((ref, index) => (
        <div key={index} className="mb-6 border-b border-gray-100 pb-4">
          <h4 className="font-bold mb-2 uppercase">Reference {index + 1}</h4>
          <div className="grid grid-cols-[100px_1fr] gap-2 mb-2 items-center">
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

      <div className="mt-8 border-t-2 border-gray-800 pt-4">
        <p className="font-bold mb-4 text-justify">
          I have no objection, the Management of Vakrangee Ltd. to verify the
          information such as personal details, contact details, education
          details, criminal verification and previous employment details
          wherever applicable prior to my appointment. If the information given
          to you is not found correct as per my declaration, then the company
          can take disciplinary action against me.
        </p>

        <div className="flex justify-end mt-16">
          <div className="text-center">
            {(data.signature_path ||
              record.signature_path ||
              record.signature) && (
              <img
                src={`http://localhost:3001/uploads/signatures/${
                  data.signature_path ||
                  record.signature_path ||
                  record.signature
                }`}
                alt="Signature"
                className="h-12 mx-auto mb-2"
              />
            )}
            <span className="border-t border-black px-8 pt-1 font-bold">
              Signature of the candidate
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewInformation;
