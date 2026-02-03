import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PreviewActions from "../../Components/Forms/Shared/PreviewActions";
import { ArrowLeft, Printer, CheckCircle } from "lucide-react";
import { useAlert } from "../../context/AlertContext";
import useAutoFill from "../../hooks/useAutoFill";

const PreviewGratuity = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const componentRef = useRef();
  const { employeeId: paramEmployeeId } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { showAlert, showConfirm } = useAlert();

  // Get data passed from the form
  const { 
      formData: stateData, 
      signaturePreview: stateSig, 
      status: stateStatus, 
      isHR: stateIsHR, 
      employeeId: stateEmployeeId, 
      rejectionReason: stateRejectionReason 
  } = location.state || {};

  const targetId = paramEmployeeId || stateEmployeeId || user.employeeId;
  const isHR = stateIsHR || ["HR_ADMIN", "HR_SUPER_ADMIN", "admin"].includes(user.role);

  const { data: autoFillData, loading: autoFillLoading } = useAutoFill(targetId);

  const status = stateStatus || autoFillData?.gratuityStatus;
  const rejectionReason = stateRejectionReason || autoFillData?.gratuityRejectionReason;
  const formData = stateData || autoFillData?.gratuityData;
  const initialSigPreview = stateSig || (formData?.signature_path ? `/uploads/signatures/${formData.signature_path}` : null);

  const [signaturePreview, setSignaturePreview] = useState(initialSigPreview);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formData) {
        if (!initialSigPreview && formData.signature_path) {
            setSignaturePreview(`/uploads/signatures/${formData.signature_path}`);
        } else if (formData.signature instanceof File) {
             setSignaturePreview(URL.createObjectURL(formData.signature));
        } else if (initialSigPreview) {
             setSignaturePreview(initialSigPreview);
        }
    }
  }, [formData, initialSigPreview]);

  if (autoFillLoading && !formData) {
      return <div className="p-10 text-center">Loading Preview...</div>;
  }

  if (!formData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">No Data Found</h2>
        <p className="mt-2 text-gray-600">
          Please go back and fill the form again.
        </p>
        <button
          onClick={() => navigate("/forms/gratuity-form")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Form
        </button>
      </div>
    );
  }

  // Parse nominees if it's a string (from FormData) or use directly if array
  let nominees = [];
  try {
    nominees =
      typeof formData.nominees === "string"
        ? JSON.parse(formData.nominees)
        : formData.nominees;
  } catch (e) {
    nominees = [];
  }

  // Fallback for legacy single fields if array is empty
  if ((!nominees || nominees.length === 0) && formData.nominee_name) {
    nominees = [{
      name: formData.nominee_name,
      address: formData.nominee_address,
      relationship: formData.nominee_relationship,
      age: formData.nominee_age,
      share: formData.nominee_share
    }];
  }

  // Helper to format date to dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Check if valid date
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB");
  };

  const handleVerification = async (verifyStatus) => {
    if (!targetId) return await showAlert("Missing Employee ID", { type: 'error' });

    let reason = null;
    if (verifyStatus === "REJECTED") {
      reason = prompt("Enter Rejection Reason:");
      if (!reason) return;
    }

    const isConfirmed = await showConfirm(
      `Are you sure you want to ${
        verifyStatus === "VERIFIED" ? "Approve" : "Reject"
      } this form?`
    );
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/forms/gratuity/verify/${targetId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: verifyStatus, remarks: reason }),
        }
      );

      if (response.ok) {
        await showAlert(
          `Form ${
            verifyStatus === "VERIFIED" ? "Approved" : "Rejected"
          } Successfully!`,
          { type: 'success' }
        );
        navigate(-1); // Back to Employee Detail
      } else {
        await showAlert("Failed to update status.", { type: 'error' });
      }
    } catch (error) {
      console.error("Verification Error", error);
      await showAlert("Server Error", { type: 'error' });
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const submitData = new FormData();
      // Re-construct FormData from the values passed in state
      Object.keys(formData).forEach((key) => {
        if (key === "nominees" || key === "witnesses") {
          
          const val = formData[key];
          submitData.append(
            key,
            typeof val === "string" ? val : JSON.stringify(val)
          );
        } else if (key === "signature") {
          if (formData.signature instanceof File) {
            submitData.append("signature", formData.signature);
          }
        } else {
          submitData.append(key, formData[key] || "");
        }
      });

      // Ensure isDraft is false
      submitData.append("isDraft", "false");

      const response = await fetch("/api/forms/gratuity", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      if (response.ok) {
        await showAlert("Form Submitted Successfully!", { type: 'success' });
        navigate("/employee/pre-joining");
      } else {
        const err = await response.json();
        await showAlert("Failed to submit form: " + (err.message || "Unknown error"), { type: 'error' });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      await showAlert("Failed to submit form.", { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 print:p-0 print:bg-white print:min-h-0">
      <style>
        {`
          @media print {
            @page {
              margin: 20mm;
              size: auto;
            }
            body {
              margin: 0;
              padding: 10px;
              background: white;
            }
            .page-break {
              page-break-before: always;
              break-before: page;
              margin-top: 2rem;
              display: block;
            }
          }
        `}
      </style>
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg p-8 md:p-12 print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0 flex flex-col">
        {/* Header Actions */}
        <div className="print:hidden mb-8">
            <PreviewActions
              status={status}
              isHR={isHR}
              onBack={() => navigate(-1)}
              onPrint={() => window.print()}
              onVerify={handleVerification}
              onEdit={() => navigate('/forms/gratuity-form', { state: { formData: formData, isEdit: true } })}
              onSubmit={handleFinalSubmit}
              isSubmitting={isSubmitting}
            />
        </div>

        {/* Rejection Alert */}
        {(status === 'REJECTED' || (status === 'DRAFT' && rejectionReason)) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 print:hidden">
                <div className="font-bold flex items-center gap-2 mb-1">
                    <CheckCircle size={20} className="text-red-500" />
                    Form Rejected
                </div>
                <p className="text-sm">
                    <span className="font-semibold">Reason:</span> {rejectionReason}
                </p>
                <p className="text-xs mt-2 text-red-600">Please review the reason and click "Edit & Resubmit" to make necessary changes.</p>
            </div>
        )}

        {/* Form Content - Printable Area */}
        <div
          ref={componentRef}
          className="print:text-black font-serif text-sm leading-relaxed text-justify text-gray-900 bg-white p-8 md:p-12 print:p-0 max-w-[210mm] mx-auto min-h-[297mm]"
        >
          {/* Form Header */}
          <div className="text-center mb-6">
            <h1 className="font-bold uppercase mb-1">
              Payment of Gratuity (Central) Rules
            </h1>
            <h2 className="font-bold uppercase inline-block mb-2">
              FORM 'F'
            </h2>
            <p className="italic text-xs">
              See sub-rule (1) of Rule 6
            </p>
            <h3 className="font-semibold text-sm mt-4">Nomination</h3>
          </div>

          <div className="space-y-6">
            {/* Address */}
            <div>
              <span className="font-bold">To,</span>
              <p className="ml-0 mt-1 mb-1 text-xs ">
                (Give here name or description of the establishment with full
                address)
              </p>
              <div className="ml-2 mt-1 text-xs">
                <p className="font-bold">Vakrangee Limited</p>
                <p>Plot No. 93, Road No-16, M.I.D.C., Marol, Andheri (East), Mumbai - 400093, Maharashtra.</p>
              </div>
            </div>

            {/* Declaration */}
            <div>
              <div className="flex gap-2 text-xs">
                <span className="whitespace-nowrap mt-1">I, Shri/Shrimati/Kumari</span>
                <div className="flex flex-col flex-1">
                  <span className="border-b border-black px-2 font-bold uppercase w-full">
                  {formData.firstname} {formData.middlename || ""}{" "}
                  {formData.lastname}
                  </span>
                  <span className="block mt-1 text-left">
                    (Name in full here)
                  </span>
                </div>
              </div>
              <p className="mt-2">
                whose particulars are given in the statement below, hereby
                nominate the person(s) mentioned below to receive the gratuity
                payable after my death as also the gratuity standing to my
                credit in the event of my death before that amount has become
                payable, or having become payable has not been paid and direct
                that the said amount of gratuity shall be paid in proportion
                indicated against the name(s) of the nominee(s).
              </p>
            </div>

            {/* Clauses */}
            <div className="space-y-1 text-sm">
              <div className="flex gap-2">
                <span>2.</span>
                <p>
                  I hereby certify that the person(s) mentioned is/are a
                  member(s) of my family within the meaning of clause (h) of
                  Section 2 of the Payment of Gratuity Act, 1972.
                </p>
              </div>
              <div className="flex gap-2">
                <span>3.</span>
                <p>
                  I hereby declare that I have no family within the meaning of
                  clause (h) of Section 2 of the said Act.
                </p>
              </div>
              <div className="flex gap-2">
                <span>4</span>
                <div className="space-y-1">
                  <p>
                    (a) My father/mother/parents is/are not dependent on me.
                  </p>
                  <p>
                    (b) My husband's father/mother/parents is/are not dependent
                    on my husband.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <span>5.</span>
                <p>
                  I have excluded my husband from my family by a notice dated
                  the{" "}
                  <span className="border-b border-black inline-block w-24 text-center">
                    {formatDate(formData.notice_date)}
                  </span>{" "}
                  to the controlling authority in terms of the proviso to clause
                  (h) of Section 2 of the said Act.
                </p>
              </div>
              <div className="flex gap-2">
                <span>6.</span>
                <p>
                  Nomination made herein invalidates my previous nomination.
                </p>
              </div>
            </div>

            {/* Nominee Table */}
            <div className="mt-8 page-break">
              <h4 className="font-semibold text-center mb-2">
                Nominee(s)
              </h4>
              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-gray-50 text-center">
                    <th className="border border-black p-2 font-normal w-[40%]">
                      Name in full with full address of nominee(s)
                    </th>
                    <th className="border border-black p-2 w-[20%] font-normal">
                      Relationship with the employee
                    </th>
                    <th className="border border-black p-2 w-[15%] font-normal">
                      Age of nominee
                    </th>
                    <th className="border border-black p-2 w-[25%] font-normal">
                      Proportion by which the gratuity will be shared
                    </th>
                  </tr>
                  <tr className="text-center font-bold">
                    <td className="border border-black p-1">(1)</td>
                    <td className="border border-black p-1">(2)</td>
                    <td className="border border-black p-1">(3)</td>
                    <td className="border border-black p-1">(4)</td>
                  </tr>
                </thead>
                <tbody>
                  {nominees && nominees.length > 0
                    ? nominees.map((nominee, index) => (
                        <tr key={index} className="text-center">
                          <td className="border border-black p-2 text-left h-16 align-top">
                            <div className="font-bold">
                              {index + 1}. {nominee.name}
                            </div>
                            <div className="whitespace-pre-wrap pl-4">
                              {nominee.address}
                            </div>
                          </td>
                          <td className="border border-black p-2 align-top">
                            {nominee.relationship}
                          </td>
                          <td className="border border-black p-2 align-top">
                            {nominee.age}
                          </td>
                          <td className="border border-black p-2 align-top">
                            {nominee.share ? `${nominee.share}%` : ""}
                          </td>
                        </tr>
                      ))
                    : [1, 2, 3].map((i) => (
                        <tr key={i}>
                          <td className="border border-black p-4">&nbsp;</td>
                          <td className="border border-black p-4"></td>
                          <td className="border border-black p-4"></td>
                          <td className="border border-black p-4"></td>
                        </tr>
                      ))}

                  {/* Empty rows to match look if needed */}
                  {(!nominees || nominees.length < 3) &&
                    Array.from({ length: 3 - (nominees?.length || 0) }).map(
                      (_, i) => (
                        <tr key={`empty-${i}`} className="h-10">
                          <td className="border border-black p-2">
                            {(nominees?.length || 0) + i + 1}.
                          </td>
                          <td className="border border-black p-2"></td>
                          <td className="border border-black p-2"></td>
                          <td className="border border-black p-2"></td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>

            {/* Statement */}
            <div className="mt-8">
              <h4 className="font-semibold text-center mb-6">Statement</h4>
              <div className="space-y-3">
                {/*full name */}

                <div className="flex items-end gap-2">
                  <span>1. Name of employee in full</span>
                  <span className="flex-1 border-b border-black px-2 font-bold uppercase">
                    {formData.firstname} {formData.middlename || ""}{" "}
                    {formData.lastname}
                  </span>
                </div>
                {/* Sex */}

                <div className="flex items-end gap-2">
                  <span>2. Sex</span>
                  <span className="flex-1 border-b border-black px-2 uppercase">
                    {formData.gender}
                  </span>
                </div>
                {/* regilion*/}

                <div className="flex items-end gap-2">
                  <span>3. Religion</span>
                  <span className="flex-1 border-b border-black px-2 uppercase">
                    {formData.religion}
                  </span>
                </div>
                {/* marital status */}

                <div className="flex items-end gap-2">
                  <span>4. Whether unmarried/married/widow/widower</span>
                  <span className="flex-1 border-b border-black px-2 uppercase">
                    {formData.marital_status}
                  </span>
                </div>
                {/*department */}

                <div className="flex items-end gap-2">
                  <span>5. Department/Branch/Section where employed</span>
                  <span className="flex-1 border-b border-black px-2 uppercase">
                    {formData.department}
                  </span>
                </div>
                {/*post held */}

                <div className="flex items-end gap-2">
                  <span>
                    6. Post held with Ticket No. or Serial No., if any
                  </span>
                  <span className="flex-1 border-b border-black px-2 uppercase">
                  {formData.ticket_no}
                  </span>
                </div>
                {/* date of appointment */}

                <div className="flex items-end gap-2">
                  <span>7. Date of appointment</span>
                  <span className="flex-1 border-b border-black px-2 uppercase">
                    {formatDate(formData.date_of_appointment)}
                  </span>
                </div>
                {/* Address */}
                <div>
                  <div className="flex items-end gap-2 mb-2">
                    <span>8. Permanent address:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-8 gap-y-2 ml-4">
                    <div className="flex items-end gap-2">
                      <span>Village</span>
                      <span className="flex-1 border-b border-black px-2">
                        {formData.village}
                      </span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span>Thana</span>
                      <span className="flex-1 border-b border-black px-2">
                        {formData.thana}
                      </span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span>Sub-division</span>
                      <span className="flex-1 border-b border-black px-2">
                        {formData.sub_division}
                      </span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span>Post Office</span>
                      <span className="flex-1 border-b border-black px-2">
                        {formData.post_office}
                      </span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span>District</span>
                      <span className="flex-1 border-b border-black px-2">
                        {formData.district}
                      </span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span>State</span>
                      <span className="flex-1 border-b border-black px-2">
                        {formData.state}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-between items-start px-4">
                <div className="text-left w-1/3">
                  <div className="flex items-end gap-2 mb-4">
                    <span>Place:</span>
                    <span className="flex-1 border-b border-black font-bold h-6">
                      {formData.place}
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span>Date:</span>
                    <span className="flex-1 border-b border-black font-bold h-6">
                      {new Date().toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>
                <div className="text-right w-1/3 flex flex-col items-end">
                  <div className="min-h-16 mb-2 flex items-end justify-end">
                    {signaturePreview ? (
                      <img
                        src={signaturePreview}
                        alt="Signature"
                        className="h-16 object-contain"
                      />
                    ) : (
                      <div className="h-12 w-full"></div>
                    )}
                  </div>
                  <p className="border-t border-black w-full pt-1 text-center text-xs font-bold">
                    Signature/Thumb-impression of the Employee
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-black my-8 page-break"></div>

            {/* Witnesses */}
            <div className="page-break-inside-avoid">
              <h4 className="font-semibold text-center mb-6">
                Declaration by Witnesses
              </h4>
              <p className="mb-8 text-sm">
                Nomination signed/thumb-impressed before me
              </p>

              <div className="flex justify-between gap-8 mb-8">
                <div className="w-[45%]">
                  <p className="mb-2 text-sm">
                    Name in full and full address of witnesses.
                  </p>
                  {formData.witnesses &&
                    formData.witnesses.map((witness, index) => (
                      <div key={index} className="flex items-end gap-2 mb-4">
                        <span>{index + 1}.</span>
                        <div className="flex-1 border-b border-black pb-1">
                          <span className="uppercase font-bold">
                            {witness.name}
                          </span>
                          {witness.address && (
                            <span className="text-xs ml-2">
                              ({witness.address})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  {(!formData.witnesses || formData.witnesses.length < 2) && (
                    <>
                      <div className="flex items-end gap-2 mb-4">
                        <span>1.</span>
                        <div className="flex-1 border-b border-black h-6"></div>
                      </div>
                      <div className="flex items-end gap-2 mb-4">
                        <span>2.</span>
                        <div className="flex-1 border-b border-black h-6"></div>
                      </div>
                    </>
                  )}
                </div>
                <div className="w-[45%]">
                  <p className="mb-2 text-sm">Signature of Witnesses.</p>
                  <div className="flex items-end gap-2 mb-4 h-8 mt-6.5">
                    <span>1.</span>
                    <div className="flex-1 border-b border-black h-6"></div>
                  </div>
                  <div className="flex items-end gap-2 mb-4 h-8">
                    <span>2.</span>
                    <div className="flex-1 border-b border-black h-6"></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-1/3 gap-4">
                <div className="flex items-end gap-2">
                  <span>Place:</span>
                  <span className="flex-1 border-b border-black font-bold h-6 relative top-1">
                    {formData.witnesses_place || formData.place}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span>Date:</span>
                  <span className="flex-1 border-b border-black font-bold h-6 relative top-1">
                    {formatDate(formData.witnesses_date || formData.witnesses?.[0]?.date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Certificate by Employer */}
            <div className="mt-12 page-break-inside-avoid">
              <h4 className="font-semibold text-center mb-6">
                Certificate by the Employer
              </h4>
              <p className="mb-6">
                Certified that the particulars of the above nomination have been
                verified and recorded in this establishment.
              </p>

              <div className="flex justify-between items-start gap-12 mt-12">
                <div className="flex-1">
                  <div className="flex items-end gap-2">
                    <span>Employer's Reference No., if any</span>
                    <span className="flex-1 border-b border-black h-6">
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-left">
                  <span className="border-t border-black w-full pt-1 text-xs">
                    Signature of the employer/Officer authorised
                  </span>
                  <span className="text-xs">Designation</span>
                </div>
              </div>

              <div className="flex justify-between items-start gap-12 mt-12">
                <div className="w-1/3">
                  <div className="flex items-end gap-2">
                    <span>Date:</span>
                    <span className="flex-1 border-b border-black h-6">
                      
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-start pl-12">
                  <span className="text-xs mb-8">
                    Name and address of the establishment or rubber stamp
                    thereof.
                  </span>
                </div>
              </div>
            </div>

            {/* Acknowledgement */}
            <div className="page-break p-8 mt-12 border-t-2 border-black pt-12">
              <h4 className="font-bold text-center mb-8">
                Acknowledgement by the Employee
              </h4>
              <p className="mb-12">
                Received the duplicate copy of nomination in Form 'F' filed by
                me and duly certified by the employer.
              </p>
              <div className="flex justify-between items-center mt-24">
                <div className="w-fit">
                  <div className="flex items-end gap-2">
                    <span>Date:</span>
                    <span className="flex-1 border-b border-black h-6">
                      {formatDate(formData.date_of_submit)}
                    </span>
                  </div>
                  <p className="text-[10px] mt-2 font-bold">
                    Note.—Strike out the words/paragraphs not applicable.
                  </p>
                </div>
                <div className="text-center w-fit">
                  <div className="min-h-12 mb-2 flex justify-center">
                    {signaturePreview && (
                      <img
                        src={signaturePreview}
                        alt="Signature"
                        className="h-12 object-contain"
                      />
                    )}
                  </div>
                  <p className="pt-1 text-sm font-bold">
                    Signature of the Employee
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewGratuity;
