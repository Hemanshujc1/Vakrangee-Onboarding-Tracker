import React, { useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { DocumentHeader, InstructionBlock, PreviewActions } from "../../Components/Forms/Shared";
import useAutoFill from "../../hooks/useAutoFill";
import { LinedTextArea } from "../../Components/Forms/Shared/PrintComponents";
import { useAlert } from "../../context/AlertContext";

const PreviewApplication = () => {
  const navigate = useNavigate();
  const componentRef = useRef();
  const location = useLocation();
  const { showAlert, showConfirm } = useAlert();
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Get identifiers from state (fallback to user/params)
  const { 
    formData: stateData, 
    status: stateStatus,
    isHR: stateIsHR,
    employeeId: stateEmployeeId,
    rejectionReason: stateRejectionReason,
    fromPreviewSubmit,
    signaturePreview
  } = location.state || {};

  const { employeeId } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const targetId = stateEmployeeId || employeeId || user.employeeId;
  const isHR = stateIsHR || ["HR_ADMIN", "HR_SUPER_ADMIN", "admin"].includes(user.role);

  // 2. Fetch backend data (fallback/robustness)
  const { data: autoFillData, loading, error } = useAutoFill(targetId);

  // 3. Derive form data
  // Prefer state data if available (e.g. just submitted/edited)
  const formData = stateData || autoFillData?.applicationData;
  const status = stateStatus || autoFillData?.applicationStatus || "PENDING";
  const rejectionReason = stateRejectionReason || autoFillData?.applicationRejectionReason;

  if (loading && !formData) return <div className="p-10 text-center">Loading...</div>;

  if (error && !formData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Error Loading Application</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 underline">Retry</button>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Application Not Found</h2>
        <p className="mt-2 text-gray-600">No application form data found for this employee.</p>
        <button
          onClick={() => navigate("/forms/employment-application")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Form
        </button>
      </div>
    );
  }

  const handleVerification = async (newStatus, reason = null) => {
    const isConfirmed = await showConfirm(`Are you sure you want to ${newStatus === "VERIFIED" ? "approve" : "reject"} this form?`);
    if (!isConfirmed) return;

    if (newStatus === "REJECTED" && !reason) {
      reason = prompt("Please enter a reason for rejection:");
      if (!reason) return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3001/api/forms/application/verify/${targetId}`,
        { status: newStatus, remarks: reason },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      await showAlert(`Form ${newStatus === "VERIFIED" ? "Approved" : "Rejected"} Successfully!`, { type: 'success' });
      // Update state/reload or navigate back
      navigate(-1); 
    } catch (error) {
      console.error("Verification Error:", error);
      await showAlert("Failed to update status.", { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to format date consistent with DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr; 
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); 
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) { return dateStr; }
  };

  const parse = (field) => {
    if (Array.isArray(field)) return field;
    try { return JSON.parse(field || "[]"); } catch (e) { return []; }
  };

  const education = parse(formData.education);
  const otherTraining = parse(formData.otherTraining);
  const achievements = parse(formData.achievements);
  const languages = parse(formData.languages);
  const workExperience = parse(formData.workExperience);
  const employmentHistory = parse(formData.employmentHistory);
  const references = parse(formData.references);
  const family = parse(formData.family);

  const bgYellow = "bg-[#ffffcc]";

  const handleFinalSubmit = async () => {
    const isConfirmed = await showConfirm("Are you sure you want to submit? This will lock the form.");
    if (!isConfirmed) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const submissionData = formData; // Use current formData
      const dataToSend = new FormData();

      Object.keys(submissionData).forEach((key) => {
        if (key === "isDraft") return; 
        if (Array.isArray(submissionData[key])) {
          dataToSend.append(key, JSON.stringify(submissionData[key]));
        } else if (key === "signature" && submissionData[key] instanceof File) {
          dataToSend.append("signature", submissionData[key]);
        } else {
          dataToSend.append(key, submissionData[key] === null || submissionData[key] === undefined ? "" : submissionData[key]);
        }
      });
      dataToSend.append("isDraft", false);

      const response = await fetch("http://localhost:3001/api/forms/application", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend,
      });

      if (response.ok) {
        await showAlert("Form Submitted Successfully!", { type: 'success' });
        navigate("/employee/pre-joining");
      } else {
        const err = await response.json();
        await showAlert(`Error: ${err.message}`, { type: 'error' });
      }
    } catch (e) {
      console.error(e);
      await showAlert("Submission failed", { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans print:bg-white print:p-0 print:m-0">
      <style>
        {`
        @media print {
          @page { margin: 0; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-before: always; }
        }
        `}
      </style>

      <div className="max-w-[210mm] mx-auto bg-white shadow-lg flex flex-col print:shadow-none print:w-full print:max-w-full">
        {/* Actions Bar */}
        <div className="p-8 print:hidden">
            <PreviewActions
                status={status}
                isHR={isHR}
                onBack={() => navigate(-1)} // Or specific path
                onSubmit={handleFinalSubmit}
                onVerify={handleVerification}
                onEdit={() => navigate("/forms/employment-application", { state: { formData, isEdit: true, isDraft: true } })}
                isSubmitHidden={!fromPreviewSubmit && status !== "DRAFT"}
                loading={actionLoading}
            />

          {(status === "REJECTED" || (status === "DRAFT" && rejectionReason)) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              <strong>Rejected Reason:</strong> {rejectionReason}
              <p className="text-xs mt-1">Please click "Edit & Resubmit" to make changes.</p>
            </div>
          )}
        </div>

        {/* Printable Content */}
        <div ref={componentRef} className="print:text-black text-xs text-gray-900 leading-tight">
          {/* PAGE 1 */}
          <div className={`p-8 min-h-[297mm] ${bgYellow} relative`}>
            
            <DocumentHeader title="Employment Application Form" className="bg-black" />

            {/* Profile Photo */}
            {autoFillData?.profilePhoto && (
                <div className="absolute top-8 right-8 w-24 h-32 border border-black bg-white p-1 z-10">
                    <img 
                        src={`http://localhost:3001/uploads/profilepic/${autoFillData.profilePhoto}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                </div>
            )}

            {/* Personal Info */}
            <div className="mb-2 mt-4">
              <span className="font-bold underline text-sm">Personal Information: -</span>
              <span className="float-right font-bold text-sm">Date: {new Date().toLocaleDateString("en-GB")}</span>
            </div>

            <table className="w-full mb-4">
              <tbody>
                <tr className="bg-[#e6e6e6]">
                  <td className="p-1 font-bold w-24">Name:</td>
                  <td className="p-1 uppercase">{formData.lastname}</td>
                  <td className="p-1 uppercase">{formData.firstname}</td>
                  <td className="p-1 uppercase">{formData.middlename}</td>
                  <td className="p-1 uppercase">{formData.Maidenname}</td>
                </tr>
                <tr className="text-[10px] font-bold">
                  <td className="px-1"></td>
                  <td className="px-1">Last</td>
                  <td className="px-1">First</td>
                  <td className="px-1">Middle</td>
                  <td className="px-1">Maiden</td>
                </tr>
              </tbody>
            </table>

            <table className="w-full mb-4 bg-[#e6e6e6]">
              <tbody>
                <tr className="">
                  <td className="p-1 font-bold w-48">
                    Address For Communication:
                  </td>
                  <td className="p-1">{formData.currentAddress}</td>
                </tr>
              </tbody>
            </table>

            <table className="w-full mb-4 bg-[#e6e6e6]">
              <tbody>
                <tr className="">
                  <td className="p-1 font-bold w-48">Permanent Address:</td>
                  <td className="p-1">{formData.permanentAddress}</td>
                </tr>
              </tbody>
            </table>

            <table className="w-full mb-4">
              <tbody>
                <tr className="bg-[#e6e6e6]">
                  <td className="p-1 font-bold">Mobile No:</td>
                  <td className="p-1">{formData.mobileNo}</td>
                  <td className="p-1 font-bold">Alternate No:</td>
                  <td className="p-1">{formData.alternateNo}</td>
                  <td className="p-1 font-bold">E-mail ID:</td>
                  <td className="p-1">{formData.email}</td>
                </tr>
              </tbody>
            </table>
            <table className="w-full mb-4">
              <tbody>
                <tr className="bg-[#e6e6e6]">
                  <td className="p-1 font-bold">Emergency No:</td>
                  <td className="p-1">{formData.emergencyNo}</td>
                  <td className="p-1 font-bold">Gender:</td>
                  <td className="p-1 uppercase">{formData.gender}</td>
                  <td className="p-1 font-bold">
                    Age:{" "}
                    <span className="font-normal ml-2">{formData.age}</span>
                  </td>
                  <td className="p-1 font-bold">
                    DOB:{" "}
                    <span className="font-normal ml-2">
                      {formatDate(formData.dob)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex bg-[#e6e6e6] mb-6">
              <div className="p-1 font-bold w-40">Position Applied For:</div>
              <div className="p-1 uppercase w-64">
                {formData.positionApplied}
              </div>
              <div className="p-1 font-bold flex-1 text-right pr-4">
                Currently Employed:{" "}
                <span className="ml-2 font-normal">
                  Yes {formData.currentlyEmployed === "Yes" ? "☑" : "☐"} / No{" "}
                  {formData.currentlyEmployed === "No" ? "☑" : "☐"}
                </span>
              </div>
            </div>

            {/* Education */}
            <div className="mb-2 font-bold text-sm">
              Educational & Professional Qualifications:
            </div>
            <table className="w-full border-collapse border border-black mb-6 text-center">
              <thead className="bg-[#b3b3b3]">
                <tr>
                  <th className="border border-black p-1">Qualification</th>
                  <th className="border border-black p-1">
                    University / Institute
                  </th>
                  <th className="border border-black p-1">Year of Passing</th>
                  <th className="border border-black p-1">
                    Percentage of Marks
                  </th>
                  <th className="border border-black p-1">Location</th>
                </tr>
              </thead>
              <tbody className={bgYellow}>
                {education.map((edu, idx) => (
                  <tr key={idx} className="border-b border-black h-8">
                    <td className="border-r border-black p-1 uppercase text-left">
                      {edu.qualification}
                    </td>
                    <td className="border-r border-black p-1 uppercase text-left">
                      {edu.institute}
                    </td>
                    <td className="border-r border-black p-1">{edu.year}</td>
                    <td className="border-r border-black p-1">
                      {edu.percentage}
                    </td>
                    <td className="p-1 uppercase">{edu.location}</td>
                  </tr>
                ))}
                {/* Fill empty rows to look like sheet */}
                {[...Array(Math.max(0, 5 - education.length))].map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-black h-8">
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Other training */}
            <div className="mb-2 font-bold text-sm">
              Mention if any other IT certifications & qualification acquired or
              training programmes attended:
            </div>
            <table className="w-full border-collapse border border-black text-center">
              <thead className="bg-[#b3b3b3]">
                <tr>
                  <th className="border border-black p-1">
                    Institute / Organization
                  </th>
                  <th className="border border-black p-1">Location</th>
                  <th className="border border-black p-1">Duration</th>
                  <th className="border border-black p-1">
                    Details of Training
                  </th>
                </tr>
              </thead>
              <tbody className={bgYellow}>
                {otherTraining.map((item, idx) => (
                  <tr key={idx} className="border-b border-black h-8">
                    <td className="border-r border-black p-1 uppercase text-left">
                      {item.institute}
                    </td>
                    <td className="border-r border-black p-1 uppercase text-left">
                      {item.location}
                    </td>
                    <td className="border-r border-black p-1">
                      {item.duration}
                    </td>
                    <td className="p-1 uppercase text-left">{item.details}</td>
                  </tr>
                ))}
                {[...Array(Math.max(0, 4 - otherTraining.length))].map(
                  (_, i) => (
                    <tr
                      key={`empty-t-${i}`}
                      className="border-b border-black h-8"
                    >
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td></td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="page-break"></div>

          {/* PAGE 2 */}
          <div className={`p-8 min-h-[297mm] ${bgYellow}`}>
            {/* Achievements */}
            <div className="mb-1 font-bold text-sm">
              Significant Achievements
            </div>
            <div className="mb-2 text-xs">
              Distinction, honors, awards (Academic / extracurricular, Community
              / Welfare activities) received.
            </div>

            <table className="w-full border-collapse border border-black mb-6">
              <thead className="bg-[#b3b3b3] text-center">
                <tr>
                  <th className="border border-black p-1 w-24">Year</th>
                  <th className="border border-black p-1">
                    Distinction / Honors / Awards
                  </th>
                </tr>
              </thead>
              <tbody>
                {achievements.map((item, idx) => (
                  <tr key={idx} className="border-b border-black h-10">
                    <td className="border-r border-black p-1 text-center">
                      {item.year}
                    </td>
                    <td className="p-1 uppercase">{item.details}</td>
                  </tr>
                ))}
                {[...Array(Math.max(0, 4 - achievements.length))].map(
                  (_, i) => (
                    <tr
                      key={`empty-a-${i}`}
                      className="border-b border-black h-10"
                    >
                      <td className="border-r border-black"></td>
                      <td></td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            {/* Personal Docs */}
            <div className="border border-black flex mb-4">
              <div className="w-1/2 border-r border-black p-2">
                <div className="font-bold border-b border-black pb-1 mb-2">
                  Driver's License
                </div>
                <div className="mb-2">
                  Do you have a driver's license? Yes{" "}
                  {formData.hasLicense === "Yes" ? "☑" : "☐"} No{" "}
                  {formData.hasLicense === "No" ? "☑" : "☐"}
                </div>
                <div className="mb-2">
                  Driver's license number: {formData.licenseNo}
                </div>
                <div className="mb-2">
                  Date of Issue: {formatDate(formData.licenseIssueDate)}
                </div>
                <div>Expiry Date: {formatDate(formData.licenseExpiryDate)}</div>
              </div>
              <div className="w-1/2 p-2">
                <div className="font-bold border-b border-black pb-1 mb-2">
                  Passport
                </div>
                <div className="mb-2">
                  Do you have a passport? Yes{" "}
                  {formData.hasPassport === "Yes" ? "☑" : "☐"} No{" "}
                  {formData.hasPassport === "No" ? "☑" : "☐"}
                </div>
                <div className="mb-2">
                  Passport number: {formData.passportNo}
                </div>
                <div className="mb-2">
                  Date of Issue: {formatDate(formData.passportIssueDate)}
                </div>
                <div>
                  Expiry Date: {formatDate(formData.passportExpiryDate)}
                </div>
              </div>
            </div>

            <div className="border border-black p-2 mb-6 flex">
              <div className="w-1/2 border-r border-black pr-2">
                <div className="font-bold border-b border-black pb-1 mb-2">
                  Pan Card
                </div>
                <div className="mb-2">
                  Do you have Pan Card? Yes{" "}
                  {formData.hasPan === "Yes" ? "☑" : "☐"} No{" "}
                  {formData.hasPan === "No" ? "☑" : "☐"}
                </div>
                <div>Pan Card number: {formData.panNo}</div>
              </div>
              <div className="w-1/2"></div>
            </div>

            {/* Family */}
            <div className="mb-2 font-bold text-sm">Family Details</div>
            <table className="w-full border-collapse border border-black mb-6">
              <thead className="bg-[#b3b3b3] text-center">
                <tr>
                  <th className="border border-black p-1 w-32">Relationship</th>
                  <th className="border border-black p-1">Name</th>
                  <th className="border border-black p-1 w-16">Age</th>
                  <th className="border border-black p-1 w-48">
                    Occupation / Study
                  </th>
                </tr>
              </thead>
              <tbody>
                {family.map((item, idx) => (
                  <tr key={idx} className="border-b border-black h-8">
                    <td className="border-r border-black p-1">
                      {item.relationship}
                    </td>
                    <td className="border-r border-black p-1 font-bold uppercase">
                      {item.name}
                    </td>
                    <td className="border-r border-black p-1 font-bold text-center">
                      {item.age}
                    </td>
                    <td className="p-1 font-bold uppercase">
                      {item.occupation}
                    </td>
                  </tr>
                ))}
                {[...Array(Math.max(0, 5 - family.length))].map((_, i) => (
                  <tr
                    key={`empty-fam-${i}`}
                    className="border-b border-black h-8"
                  >
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Habits */}
            <div className="border border-black p-2 mb-6 flex items-center justify-between">
              <div>Do you have following habits:</div>
              <div>
                Smoking:{" "}
                <span className="border border-black px-4 ml-1 inline-block">
                  {formData.smoking}
                </span>
              </div>
              <div>
                Chewing Tobacco:{" "}
                <span className="border border-black px-4 ml-1 inline-block">
                  {formData.tobacco}
                </span>
              </div>
              <div>
                Drinking Liquor:{" "}
                <span className="border border-black px-4 ml-1 inline-block">
                  {formData.liquor}
                </span>
              </div>
            </div>

            {/* Languages */}
            <div className="mb-2 font-bold text-sm">Languages Known</div>
            <table className="w-full border-collapse border border-black mb-6">
              <thead className="bg-[#b3b3b3] text-center">
                <tr>
                  <th className="border border-black p-1">Languages Known</th>
                  <th className="border border-black p-1 w-32">Speak</th>
                  <th className="border border-black p-1 w-32">Read</th>
                  <th className="border border-black p-1 w-32">Write</th>
                </tr>
              </thead>
              <tbody>
                {languages.map((item, idx) => (
                  <tr key={idx} className="border-b border-black h-8">
                    <td className="border-r border-black p-1 font-bold uppercase">
                      {item.language}
                    </td>
                    <td className="border-r border-black p-1 text-center">
                      {item.speak ? "☑" : ""}
                    </td>
                    <td className="border-r border-black p-1 text-center">
                      {item.read ? "☑" : ""}
                    </td>
                    <td className="p-1 text-center">{item.write ? "☑" : ""}</td>
                  </tr>
                ))}
                {[...Array(Math.max(0, 4 - languages.length))].map((_, i) => (
                  <tr
                    key={`empty-lang-${i}`}
                    className="border-b border-black h-8"
                  >
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="page-break"></div>

          {/* PAGE 3 */}
          <div className={`p-8 min-h-[297mm] ${bgYellow}`}>
            {/* Work Experience */}
            <div className="mb-1 font-bold text-sm">Work Experience</div>
            <div className="mb-4 text-xs">
              Please list your work experience beginning with your most recent
              job. If you were self-employed, give firm name.
            </div>

            {workExperience && workExperience[0] ? (
              <div className="border border-black mb-6">
                <div className="flex border-b border-black">
                  <div className="w-1/4 p-1 font-bold border-r border-black">
                    Current Employer
                  </div>
                  <div className="w-1/4 p-1 border-r border-black uppercase">
                    {workExperience[0].employer}
                  </div>
                  <div className="w-1/4 p-1 font-bold border-r border-black">
                    Turnover
                  </div>
                  <div className="w-1/4 p-1">{workExperience[0].turnover}</div>
                </div>
                <div className="flex border-b border-black">
                  <div className="w-1/4 p-1 font-bold border-r border-black">
                    Location
                  </div>
                  <div className="w-1/4 p-1 border-r border-black uppercase">
                    {workExperience[0].location}
                  </div>
                  <div className="w-1/4 p-1 font-bold border-r border-black">
                    No. of Employees
                  </div>
                  <div className="w-1/4 p-1">
                    {workExperience[0].noOfEmployees}
                  </div>
                </div>
                <div className="flex border-b border-black">
                  <div className="w-1/4 p-1 font-bold border-r border-black">
                    Joining Designation
                  </div>
                  <div className="w-1/4 p-1 border-r border-black uppercase">
                    {workExperience[0].designation}
                  </div>
                  <div className="w-1/4 p-1 font-bold border-r border-black">
                    Joining CTC
                  </div>
                  <div className="w-1/4 p-1">
                    {workExperience[0].joiningCTC}
                  </div>
                </div>
                <div className="flex border-b border-black">
                  <div className="w-1/4 p-1 font-bold border-r border-black">
                    Reporting To
                  </div>
                  <div className="w-1/4 p-1 border-r border-black uppercase">
                    {workExperience[0].reportingOfficer}
                  </div>
                  <div className="w-1/4 p-1 font-bold border-r border-black">
                    Joining Date
                  </div>
                  <div className="w-1/4 p-1">
                    {formatDate(workExperience[0].joiningDate)}
                  </div>
                </div>
                <div className="flex border-b border-black">
                  <div className="w-1/4 p-1 font-bold border-r border-black">
                    Current Designation
                  </div>
                  <div className="w-1/4 p-1 border-r border-black uppercase">
                    {workExperience[0].currentDesignation}
                  </div>
                  <div className="w-1/4 p-1 font-bold border-r border-black">
                    Current CTC
                  </div>
                  <div className="w-1/4 p-1">
                    {workExperience[0].currentCTC}
                  </div>
                </div>
                <div className="flex border-b border-black">
                  <div className="w-1/4 p-1 font-bold border-r border-black">
                    Expected Salary
                  </div>
                  <div className="w-1/4 p-1 border-r border-black">
                    {workExperience[0].expectedSalary}
                  </div>
                  <div className="w-1/4 p-1 font-bold border-r border-black">
                    Notice Period
                  </div>
                  <div className="w-1/4 p-1">
                    {workExperience[0].noticePeriod}
                  </div>
                </div>
                <div className="p-1 font-bold border-b border-black">
                  Key Responsibilities
                </div>
                <div className="p-2 h-32 border-b border-black whitespace-pre-wrap">
                  {workExperience[0].responsibilities}
                </div>
                <div className="p-1 font-bold border-b border-black">
                  Reason for wanting to leave
                </div>
                <div className="p-2 h-16 whitespace-pre-wrap">
                  {workExperience[0].reasonLeaving}
                </div>
              </div>
            ) : (
              <div className="border border-black p-4 text-center mb-6">
                No Current Experience Listed
              </div>
            )}

            {/* Employment History */}
            <div className="mb-1 font-bold text-sm">Employment History</div>
            <table className="w-full border-collapse border border-black mb-6">
              <thead className="bg-[#b3b3b3] text-center">
                <tr>
                  <th rowSpan={2} className="border border-black p-1 w-48">
                    Name of Company
                  </th>
                  <th colSpan={2} className="border border-black p-1">
                    Period Worked
                  </th>
                  <th rowSpan={2} className="border border-black p-1">
                    Designation
                  </th>
                  <th rowSpan={2} className="border border-black p-1">
                    CTC Details
                  </th>
                  <th rowSpan={2} className="border border-black p-1">
                    Reporting Officer
                  </th>
                </tr>
                <tr>
                  <th className="border border-black p-1 w-20">From</th>
                  <th className="border border-black p-1 w-20">To</th>
                </tr>
              </thead>
              <tbody>
                {employmentHistory.map((item, idx) => (
                  <tr key={idx} className="border-b border-black h-8">
                    <td className="border-r border-black p-1 uppercase">
                      {item.employer}
                    </td>
                    <td className="border-r border-black p-1 text-center">
                      {formatDate(item.fromDate)}
                    </td>
                    <td className="border-r border-black p-1 text-center">
                      {formatDate(item.toDate)}
                    </td>
                    <td className="border-r border-black p-1 uppercase">
                      {item.designation}
                    </td>
                    <td className="border-r border-black p-1">{item.ctc}</td>
                    <td className="p-1 uppercase">{item.reportingOfficer}</td>
                  </tr>
                ))}
                {[...Array(Math.max(0, 5 - employmentHistory.length))].map(
                  (_, i) => (
                    <tr
                      key={`empty-hist-${i}`}
                      className="border-b border-black h-8 bg-[#ffffcc]"
                    >
                      <td className="border-r border-black bg-[#ffffcc]"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td></td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            {/* References */}
            <div className="border border-black p-4 bg-[whitesmoke]">
              <div className="font-bold mb-2">
                Please list two professional references other than relatives.
              </div>

              {references
                .map((item, idx) => (
                  <div key={idx} className="mb-4 last:mb-0">
                    {/* Implementing simpler stack as per data structure */}
                    <div className="grid grid-cols-2 gap-4 mt-2 border-black pb-2">
                      <div>
                        <div className="bg-[#b3b3b3] font-bold px-2 py-1">
                          Name: {item.name}
                        </div>
                        <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                          Position: {item.position}
                        </div>
                        <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                          Company: {item.company}
                        </div>
                        <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                          Address: {item.address}
                        </div>
                        <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                          Contact Details: {item.contact}
                        </div>
                      </div>
                      {/* If 2nd ref exists in parallel */}
                      {references[idx + 1] && idx % 2 === 0 ? (
                        <div>
                          <div className="bg-[#b3b3b3] font-bold px-2 py-1">
                            Name: {references[idx + 1].name}
                          </div>
                          <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                            Position: {references[idx + 1].position}
                          </div>
                          <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                            Company: {references[idx + 1].company}
                          </div>
                          <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                            Address: {references[idx + 1].address}
                          </div>
                          <div className="bg-[#b3b3b3] font-bold px-2 py-1 mt-2">
                            Contact Details: {references[idx + 1].contact}
                          </div>
                        </div>
                      ) : idx % 2 !== 0 ? null : (
                        <div></div>
                      )}
                    </div>
                  </div>
                ))
                .filter((_, i) => i % 2 === 0)}
            </div>
          </div>

          <div className="page-break"></div>

          {/* PAGE 4 */}
          <div className={`p-8 min-h-[297mm] ${bgYellow}`}>
            <div className="mb-6">
              <div className="font-bold mb-2">
                a) What are your career objectives & personal goals? Ideally,
                how would you like to see them develop over the next 5 Years.
              </div>
              <LinedTextArea value={formData.careerObjectives} minLines={4} />
            </div>

            <div className="mb-6">
              <div className="font-bold mb-2">b) Major achievements...</div>
              <LinedTextArea value={formData.majorAchievements} minLines={3} />
            </div>

            <div className="mb-6">
              <div className="font-bold mb-2">
                c) Physical or mental disability, if any...
              </div>
              <LinedTextArea value={formData.disability} minLines={2} />
            </div>

            <div className="mb-6">
              <div className="font-bold mb-2">
                d) Have you been interviewed in this organization before? If
                yes, Please give details.
              </div>
              <LinedTextArea value={formData.interviewedBefore} minLines={2} />
            </div>

            <div className="mb-6">
              <div className="font-bold mb-2">e) List your hobbies?</div>
              <LinedTextArea value={formData.hobbies} minLines={2} />
            </div>

            <div className="mb-6">
              <div className="font-bold mb-2">
                f) Have you been convicted for any offence? If yes, please give
                details.
              </div>
              <LinedTextArea value={formData.conviction} minLines={2} />
            </div>
          </div>

          <div className="page-break"></div>

          {/* PAGE 5 */}
          <div className={`p-8 min-h-[297mm] ${bgYellow}`}>
            <div className="mb-6">
              <div className="mt-8 text-justify font-bold text-sm">
                I declare that the particulars given above are true & complete
                to the best of my knowledge & belief. I agree to produce any
                documentary evidence in proof of the above statements as may be
                demanded by the company. If found otherwise, my appointment
                shall be liable for termination. I confirm that I do not have
                any criminal record. I will also abide by all rules &
                regulations, Code of Conduct framed by the company from time to
                time.
              </div>
            </div>
            <div className="mb-6">
              <div className="mt-12 flex justify-between items-end">
                <div>
                  <div className="h-16 w-32 border border-gray-300 mb-2">
                    {(signaturePreview || formData?.signature_path || autoFillData?.signature) && (
                      <img
                        src={
                          signaturePreview
                            ? signaturePreview
                            : `http://localhost:3001/uploads/signatures/${
                                formData?.signature_path || autoFillData?.signature
                              }`
                        }
                        alt="Signature"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="font-bold">Signature of the candidate</div>
                </div>
                <div className="font-bold mb-4 mr-20">
                  Date: {new Date().toLocaleDateString("en-GB")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewApplication;
