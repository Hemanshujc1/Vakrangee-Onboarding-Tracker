import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { PreviewActions } from "../../Components/Forms/Shared";
import { formatDateForAPI } from "../../utils/formUtils";
import useAutoFill from "../../hooks/useAutoFill";
import { useAlert } from "../../context/AlertContext";

const PreviewEPF = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [isHR, setIsHR] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { showAlert, showConfirm } = useAlert();
  const location = useLocation();
  const {
    formData: stateData,
    signaturePreview: stateSig,
    employeeId: stateEmployeeId,
    status: stateStatus,
    rejectionReason: stateRejectionReason,
    fromPreviewSubmit,
  } = location.state || {};
  const componentRef = useRef();

  useEffect(() => {
    const checkUserRole = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (
            user.role === "HR_ADMIN" ||
            user.role === "HR_SUPER_ADMIN" ||
            user.role === "admin"
          ) {
            setIsHR(true);
          }
        }
      } catch (e) {
        console.error("Error parsing user for role check", e);
      }
    };
    checkUserRole();
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const targetId = stateEmployeeId || user.employeeId;

  // 2. Fetch backend data (fallback/robustness)
  const { data: autoFillData, loading: autoFillLoading } =
    useAutoFill(targetId);

  // 3. Derive status: prefer state, fallback to backend
  const derivedStatus = stateStatus || autoFillData?.epfStatus;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3001/api/forms/auto-fill/${employeeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching preview data:", error);
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchData();
    }
  }, [employeeId]);

  if (loading)
    return <div className="text-center p-10">Loading Preview...</div>;
  if (!data)
    return <div className="text-center p-10 text-red-600">No data found.</div>;

  // Helper to safely access nested data
  const epf = stateData || data.epfData || {};
  const app = data.applicationData || {};

  // Combine logic for fields that might be in EPF form data or fallbacks
  const getValue = (key, fallback) => epf[key] || fallback || "";

  // Signature URL helper
  const getSignatureUrl = (path) =>
    path ? `http://localhost:3001/uploads/signatures/${path}` : null;

  // Helper to render Yes/No with checkmark
  const renderYesNo = (val) => {
    const isYes = val === "Yes" || val === true;
    return (
      <div className="flex justify-center items-center gap-1">
        <span className={isYes ? "font-bold" : ""}>
          Yes{isYes ? " \u2713" : ""}
        </span>
        <span>/</span>
        <span className={!isYes ? "font-bold" : ""}>
          No{!isYes ? " \u2713" : ""}
        </span>
      </div>
    );
  };

  // Date formatter
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleFinalSubmit = async () => {
    if (!epf) return;
    setActionLoading(true);
    try {
      const payload = new FormData();

      Object.keys(epf).forEach((key) => {
        if (key === "signature") {
          if (epf.signature instanceof File) {
            payload.append("signature", epf.signature);
          }
        } else if (
          key !== "signature_path" &&
          key !== "sinature_of_employer_path" &&
          key !== "isDraft"
        ) {
          if (epf[key] !== null && epf[key] !== undefined) {
            let value = epf[key];
            // Format dates if they are Date objects
            if (
              [
                "dob",
                "present_joining_date",
                "date_of_exit_prev",
                "passport_valid_from",
                "passport_valid_to",
                "first_epf_enrolled_date",
              ].includes(key)
            ) {
              value = formatDateForAPI(value);
            }
            payload.append(key, value);
          }
        }
      });

      if (epf.signature_path) {
        payload.append("signature_path", epf.signature_path);
      }

      payload.append("isDraft", "false");

      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3001/api/forms/epf", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await showAlert("EPF Form Submitted Successfully!", { type: "success" });
      navigate("/employee/post-joining");
    } catch (e) {
      console.error("Error submitting form:", e);
      await showAlert(
        `Submission failed: ${e.response?.data?.message || e.message}`,
        { type: "error" }
      );
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
      if (!reason) return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3001/api/forms/epf/verify/${employeeId}`,
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
        { type: "success" }
      );
      navigate(-1);
    } catch (error) {
      console.error("Verification Error:", error);
      await showAlert("Failed to update status.", { type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-serif print:p-0 print:m-0">
      <style>
        {`
        @media print {
          @page { margin: 5mm; size: A4; }
          body { -webkit-print-color-adjust: exact; }
          .print-hidden { display: none !important; }
        }
        `}
      </style>

      <div className="max-w-[210mm] mx-auto bg-white p-4 min-h-[297mm] flex flex-col print:w-full print:max-w-full print:min-h-0 print:m-0 print:p-0">
        {/* Actions for Web View */}
        <div className="print-hidden mb-6">
          {(derivedStatus === "REJECTED" ||
            (derivedStatus === "DRAFT" &&
              (stateRejectionReason || autoFillData?.epfRejectionReason))) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 print:hidden">
              <div className="font-bold flex items-center gap-2 mb-1">
                Form Rejected
              </div>
              <p className="text-sm">
                <span className="font-semibold">Reason:</span>{" "}
                {stateRejectionReason || data.epfRejectionReason}
              </p>
              <p className="text-xs mt-2 text-red-600">
                Please review the reason and click "Edit & Resubmit" to make
                necessary changes.
              </p>
            </div>
          )}

          <PreviewActions
            status={derivedStatus}
            isHR={isHR}
            onBack={() => navigate(-1)}
            onPrint={() => window.print()}
            onSubmit={handleFinalSubmit}
            onVerify={handleVerification}
            onEdit={() =>
              navigate(
                `/forms/employees-provident-fund/${employeeId || targetId}`,
                {
                  state: {
                    formData: data || autoFillData?.epfData,
                    isEdit: true,
                    isResubmitting: derivedStatus === "REJECTED",
                  },
                }
              )
            }
            isSubmitting={actionLoading}
            isSubmitHidden={!fromPreviewSubmit && derivedStatus !== "DRAFT"}
          />
        </div>

        {/* Form Content */}
        <div ref={componentRef} className="text-xs text-black leading-tight">
          {/* Header */}
          <div className="relative mb-2">
            <div className="absolute top-0 right-0 text-right">
              <h3 className="font-semibold text-xs">
                New Form : 11 - Declaration Form
              </h3>
              <p className="text-[10px]">
                (To be retained by the employer for future reference)
              </p>
            </div>
            <div className="relative mb-2">
              <div className="w-24 shrink-0 absolute top-4 left-0">
                <img
                  src={`${import.meta.env.BASE_URL}epf form logo.webp`}
                  alt="EPF Logo"
                  className="w-16 h-auto"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            </div>

            <div className="items-center pt-10">
              <div className="text-center flex-1">
                <h2 className="font-bold text-[15px] text-[#0066cc] uppercase">
                  EMPLOYEES' PROVIDENT FUND ORGANISATION
                </h2>
                <p className="">
                  Employees' Provident Fund Scheme, 1952 (Paragraph 34 & 57) and
                </p>
                <p className="">
                  Employees' Pension Scheme, 1995 (Paragraph 24)
                </p>
                <p className="text-[10px] mt-1">
                  (Declaration by a person taking up Employment in any
                  Establishment on which EPF Scheme, 1952 and for EPS, 1995 is
                  applicable)
                </p>
              </div>
              <div className="w-24"></div>{" "}
              {/* Spacer for symmetry if needed, or just let center take space */}
            </div>
          </div>

          {/* Main Table */}
          <table className="w-full border-collapse border border-black text-xs">
            <tbody>
              {/* 1. Name */}
              <tr>
                <td className="border border-black p-1 text-center w-8 text-sm">
                  1.
                </td>
                <td className="border border-black p-1 w-[45%] font-medium">
                  Name of Member{" "}
                  <span className="text-red-600 font-bold">(Aadhar Name)</span>
                </td>
                <td className="border border-black p-1 pl-2 font-bold uppercase">
                  {getValue("member_name_aadhar", data.fullName)}
                </td>
              </tr>

              {/* 2. Father/Spouse Name */}
              <tr>
                <td className="border border-black p-1 text-center text-sm">
                  2.
                </td>
                <td className="border border-black p-1">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Father's Name</span>
                    <div className="border border-black w-4 h-4 flex items-center justify-center mr-4">
                      {getValue("relationship_type") === "Father" && "✓"}
                    </div>
                    <span className="font-medium mr-2">Spouse's Name</span>
                    <div className="border border-black w-4 h-4 flex items-center justify-center">
                      {getValue("relationship_type") === "Husband" && "✓"}
                    </div>
                  </div>
                  <div className="text-[10px] italic mt-1">
                    (Please tick whichever applicable)
                  </div>
                </td>
                <td className="border border-black p-1 pl-2 uppercase font-bold">
                  {getValue("relationship_type") === "Father"
                    ? getValue("father_name")
                    : getValue("spouse_name")}
                </td>
              </tr>

              {/* 3. DOB */}
              <tr>
                <td className="border border-black p-1 text-center text-sm">
                  3.
                </td>
                <td className="border border-black p-1 font-medium">
                  Date of Birth{" "}
                  <span className="font-normal">(dd/mm/yyyy)</span>
                </td>
                <td className="border border-black p-1 pl-2 font-bold">
                  {formatDate(getValue("dob", data.dateOfBirth))}
                </td>
              </tr>

              {/* 4. Gender */}
              <tr>
                <td className="border border-black p-1 text-center text-sm">
                  4.
                </td>
                <td className="border border-black p-1 font-medium">
                  Gender{" "}
                  <span className="font-normal">
                    (Male / Female / Transgender)
                  </span>
                </td>
                <td className="border border-black p-1 pl-2 uppercase font-bold">
                  {getValue("gender", data.gender)}
                </td>
              </tr>

              {/* 5. Marital Status */}
              <tr>
                <td className="border border-black p-1 text-center text-sm">
                  5.
                </td>
                <td className="border border-black p-1 font-medium">
                  Marital Status{" "}
                  <span className="font-normal text-[10px]">
                    (Single/Married/Widow/Widower/Divorcee)
                  </span>
                </td>
                <td className="border border-black p-1 pl-2 uppercase font-bold">
                  {getValue("marital_status")}
                </td>
              </tr>

              {/* 6. Contact Info */}
              <tr>
                <td className="border border-black p-1 text-center text-sm">
                  6.
                </td>
                <td className="border border-black py-1">
                  <div className="font-medium px-1">(a) Email ID</div>
                  <div className="font-medium border-t border-black mt-1 pt-1 px-1">
                    (b) Mobile No{" "}
                    <span className="text-red-600 font-bold">
                      (Aadhar Registered)
                    </span>
                  </div>
                </td>
                <td className="border border-black py-1 font-bold">
                  <div className="px-2">{getValue("email", data.email)}</div>
                  <div className="border-t border-black mt-1 pt-1 px-2">
                    {getValue("mobile", data.phone)}
                  </div>
                </td>
              </tr>

              {/* 7. Previous EPF Member */}
              <tr>
                <td className="border border-black p-1 text-center text-sm">
                  7.
                </td>
                <td className="border border-black p-1 font-medium">
                  Whether earlier member of the Employee's Provident Fund
                  Scheme, 1952 ?
                </td>
                <td className="border border-black p-1 pl-2 font-bold text-center uppercase">
                  {renderYesNo(getValue("prev_epf_member", "No"))}
                </td>
              </tr>

              {/* 8. Previous EPS Member */}
              <tr>
                <td className="border border-black p-1 text-center text-sm">
                  8.
                </td>
                <td className="border border-black p-1 font-medium">
                  Whether earlier member of the Employee's Pension Scheme, 1995
                  ?
                </td>
                <td className="border border-black p-1 pl-2 font-bold text-center uppercase">
                  {renderYesNo(getValue("prev_eps_member", "No"))}
                </td>
              </tr>

              {/* 9. Previous Employment Details */}
              <tr>
                <td
                  className="border border-black p-1 text-center text-sm"
                  rowSpan={6}
                >
                  9.
                </td>
                <td className="border-r border-black p-1 font-bold text-red-600">
                  <span className="text-black">
                    Previous Employment details ?
                  </span>{" "}
                  (If Yes, 7 & 8 details above)
                </td>
                <td className="border font-bold pl-2 border-black" rowSpan={2}>
                  {getValue("uan_number")}
                </td>
              </tr>
              <tr>
                <td className="border-b border-black p-1 pl-1">
                  a) Universal Account Number (UAN)
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 pl-1">
                  b) Previous PF Account Number
                </td>
                <td className="border border-black p-1 pl-2 font-bold">
                  {getValue("prev_pf_number")}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 pl-1">
                  c) Date of Exit from previous Employment ? (dd/mm/yyyy)
                </td>
                <td className="border border-black p-1 pl-2 font-bold">
                  {formatDate(getValue("date_of_exit_prev"))}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 pl-1">
                  d) Scheme Certificate No (If issued)
                </td>
                <td className="border border-black p-1 pl-2 font-bold">
                  {getValue("scheme_cert_no")}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 pl-1">
                  e) Pension Payment Order (PPO) (If issued)
                </td>
                <td className="border border-black p-1 pl-2 font-bold">
                  {getValue("ppo_no")}
                </td>
              </tr>

              {/* 10. International Worker */}
              <tr>
                <td
                  className="border border-black p-1 text-center text-sm"
                  rowSpan={4}
                >
                  10.
                </td>
                <td className="border border-black p-1 pl-1">
                  a) International Worker
                </td>
                <td className="border border-black p-1 pl-2 text-center font-bold uppercase">
                  {renderYesNo(getValue("international_worker", "No"))}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 pl-1">
                  b) If Yes, state country of origin (name of other country)
                </td>
                <td className="border border-black p-1 pl-2 font-bold">
                  {getValue("country_of_origin")}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 pl-1">
                  c) Passport No.
                </td>
                <td className="border border-black p-1 pl-2 font-bold">
                  {getValue("passport_no")}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 pl-1">
                  d) Validity of passport (dd/mm/yyyy) to (dd/mm/yyyy)
                </td>
                <td className="border border-black p-1 pl-2 font-bold">
                  {getValue("passport_valid_from") &&
                  getValue("passport_valid_to")
                    ? `${formatDate(
                        getValue("passport_valid_from")
                      )} to ${formatDate(getValue("passport_valid_to"))}`
                    : ""}
                </td>
              </tr>

              {/* 11. KYC Details */}
              <tr>
                <td
                  className="border border-black p-1 text-center text-sm"
                  rowSpan={4}
                >
                  11.
                </td>
                <td className="border border-black p-1 font-bold">
                  KYC Details :{" "}
                  <span className="font-normal text-[10px]">
                    (attach self attested copies of following KYC's)
                  </span>
                </td>
                <td className="border border-black p-2 italic text-[10px] text-gray-600">
                  Must Enclose Scan copy for the following documents
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 pl-1">
                  a) Bank Account No. & IFS Code
                </td>
                <td className="border border-black p-1 pl-2 font-bold">
                  {getValue("bank_account_no")}{" "}
                  {getValue("ifsc_code") ? `& ${getValue("ifsc_code")}` : ""}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 pl-1">
                  b) AADHAR Number
                </td>
                <td className="border border-black p-1 pl-2 font-bold">
                  {getValue("aadhaar_no", data.aadhaar)}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 pl-1">
                  c) Permanent Account Number (PAN), If available
                </td>
                <td className="border border-black p-1 pl-2 font-bold">
                  {getValue("pan_no", data.panNo)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Section 12 Table */}
          <table className="w-full border border-black border-t-0 text-xs text-center mt-4">
            <tbody>
              <tr className="h-10">
                <td className="border border-black p-1 text-sm w-8" rowSpan={2}>
                  12.
                </td>
                <td className="border border-black p-1 w-30">
                  First EPF Member Enrolled Date
                </td>
                <td className="border border-black p-1 w-30">
                  First Employment EPF Wages
                </td>
                <td className="border border-black p-1 w-30">
                  Are you EPF Member before <br />{" "}
                  <span className="text-red-600 font-bold">01/09/2014</span>
                </td>
                <td className="border border-black p-1 w-30">
                  If <span className="text-red-600 font-bold">Yes, EPF</span>{" "}
                  <br /> Amount Withdrawn?
                </td>
                <td className="border border-black p-1">
                  If{" "}
                  <span className="text-red-600 font-bold">
                    Yes, EPS (Pension)
                  </span>{" "}
                  <br /> Amount Withdrawn?
                </td>
                <td className="border border-black p-1">
                  After Sep 2014 earned{" "}
                  <span className="text-red-600 font-bold">EPS (Pension)</span>{" "}
                  Amount Withdrawn before Join current Employer?
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 font-bold">
                  {formatDate(getValue("first_epf_enrolled_date"))}
                </td>
                <td className="border border-black p-1 font-bold">
                  {getValue("first_epf_wages")}
                </td>
                <td className="border border-black p-1 font-bold">
                  {renderYesNo(getValue("pre_2014_member", "No"))}
                </td>
                <td className="border border-black p-1 font-bold">
                  {renderYesNo(getValue("withdrawn_epf", "No"))}
                </td>
                <td className="border border-black p-1 font-bold">
                  {renderYesNo(getValue("withdrawn_eps", "No"))}
                </td>
                <td className="border border-black p-1 font-bold">
                  {renderYesNo(getValue("post_2014_eps_withdrawn", "No"))}
                </td>
              </tr>
            </tbody>
          </table>

          <div
            className="flex flex-col mt-4"
            style={{ pageBreakBefore: "always" }}
          >
            {/* Undertaking */}
            <div className="text-sm leading-tight">
              <h3 className="font-semibold underline underline-offset-2 mb-1 uppercase text-lg text-center">
                Undertaking
              </h3>
              <div className="px-2 flex flex-col gap-1">
                <p>
                  1) Certified that the particulars are true to the best of my
                  knowledge
                </p>
                <p>
                  2) I authorise EPFO to use my Aadhar for verification /
                  authentication / eKYC purpose for service delivery
                </p>
                <p>
                  3) Kindly transfer the fund and service details, if
                  applicable, from the previous PF account as declared above to
                  the present PF account.
                </p>
                <p className="pl-2">
                  (The transfer would be possible only if the identified KYC
                  details approved by previous employer has been verified by
                  present employer using his Digital Signature)
                </p>
                <p>
                  4) In case of changes in above details, the same will be
                  intimated to employer at the earliest.
                </p>
              </div>
            </div>

            {/* Member Signature Section */}
            <div className="flex justify-between items-end mt-8 mb-2 px-2">
              <div className="text-sm">
                <div className="mb-1">
                  <span>Date :</span> {formatDate(new Date())}
                </div>
                <div>
                  <span>Place :</span> {getValue("place")}
                </div>
              </div>
              <div className="flex flex-col items-center text-sm">
                {stateSig ||
                (epf.signature instanceof File
                  ? URL.createObjectURL(epf.signature)
                  : null) ||
                epf.signature_path ||
                data.signature ? (
                  <img
                    src={
                      stateSig ||
                      (epf.signature instanceof File
                        ? URL.createObjectURL(epf.signature)
                        : null) ||
                      `http://localhost:3001/uploads/signatures/${
                        epf.signature_path || data.signature
                      }`
                    }
                    className="h-14 mb-1"
                    alt="Signature"
                  />
                ) : (
                  <div className="h-10 w-32 border border-gray-300 bg-gray-50 flex items-center justify-center text-sm">
                    No Signature
                  </div>
                )}
                <span className="pt-1 px-4">Signature of Member</span>
              </div>
            </div>

            {/* DECLARATION BY PRESENT EMPLOYER */}
            <div className="mt-6 text-sm">
              <div className="text-center font-semibold  underline-offset-2 underline text-lg mb-1">
                DECLARATION BY PRESENT EMPLOYER
              </div>

              <div className="px-2 mt-4 text-xs flex flex-col gap-4">
                {/* Section A */}
                <div className="flex items-start">
                  <span className="mr-4">A.</span>
                  <div className="w-full">
                    The member Mr./Ms./Mrs.{" "}
                    <span className="inline-block border-b border-black border-dotted px-2 min-w-50 text-center font-bold mx-2">
                      {" "}
                      {getValue("member_name_aadhar", data.fullName)}{" "}
                    </span>
                    Has joined on
                    <span className="inline-block border-b border-black border-dotted px-2 min-w-25 text-center font-bold mx-2">
                      {formatDate(getValue("present_joining_date"))}
                    </span>
                    and has been alloted PF Number
                    <span className="inline-block border-b border-black border-dotted px-2 min-w-37.5 text-center font-bold mx-2">
                      {getValue("present_pf_number")}
                    </span>
                  </div>
                </div>

                {/* Section B */}
                <div className="flex items-start">
                  <span className="mr-4">B.</span>
                  <div className="w-full">
                    <div className="mb-2 text-justify leading-snug">
                      In case the person was earlier not a member of EPF Scheme,
                      1952 and EPS, 1995: ((Post allotment of UAN) The UAN
                      alloted or the member is) Please Tick the Appropriate
                      Option:
                      <span className="ml-12 inline-block">
                        The KYC details of the above member in the UAN database
                      </span>
                    </div>

                    <div className="flex justify-between items-start mt-3 px-2">
                      {/* B1 */}
                      <div className="flex items-center align-middle gap-1 w-[30%]">
                        <div className="w-3 h-3 border border-black shrink-0 flex items-center justify-center relative">
                          {getValue("present_kyc_status") === "Not Uploaded" &&
                            "✓"}
                        </div>
                        <span>Have not been uploaded</span>
                      </div>

                      {/* B2 */}
                      <div className="flex items-center align-middle gap-1 w-[32%]">
                        <div className="w-3 h-3 border border-black shrink-0 flex items-center justify-center relative">
                          {getValue("present_kyc_status") ===
                            "Uploaded Not Approved" && "✓"}
                        </div>
                        <span>Have been uploaded but not approved</span>
                      </div>

                      {/* B3 */}
                      <div className="flex items-center align-middle gap-1 w-[36%]">
                        <div className="w-3 h-3 border border-black shrink-0 flex items-center justify-center relative">
                          {getValue("present_kyc_status") === "Approved DSC" &&
                            "✓"}
                        </div>
                        <span>Have been uploaded and approved with DSC</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section C */}
                <div className="flex items-start">
                  <span className="mr-4">C.</span>
                  <div className="w-full">
                    <p className="mb-3">
                      In case the person was earlier a member of EPF Scheme,
                      1952 and EPS 1995;
                    </p>

                    <div className="flex flex-col gap-4 pl-1">
                      {/* C1 */}
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 border border-black shrink-0 flex items-center justify-center text-lg mt-0.5">
                          {getValue("present_transfer_status") ===
                            "Approved DSC Transfer" && "✓"}
                        </div>
                        <span className="leading-snug text-justify">
                          The KYC details of the above member in the UAN
                          database have been approved with Digital Signature
                          Certificate and transfer request has been generated on
                          portal
                        </span>
                      </div>

                      {/* C2 */}
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 border border-black shrink-0 flex items-center justify-center text-lg mt-0.5">
                          {getValue("present_transfer_status") ===
                            "Physical Claim" && "✓"}
                        </div>
                        <span className="leading-snug text-justify">
                          As the DSC of establishment are not registered with
                          EPFO, the member has been informed to file physical
                          claim (Form-13) for transfer of funds from his
                          previous establishment.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end mt-16 pt-8">
                  <div className="text-base">Date :</div>
                  <div className="flex flex-col items-center w-100">
                    <div className="h-16 w-full flex items-end justify-center mb-1">
                      {getSignatureUrl(epf.sinature_of_employer_path) && (
                        <img
                          src={getSignatureUrl(epf.sinature_of_employer_path)}
                          className="h-full object-contain"
                          alt="Employer Signature"
                        />
                      )}
                    </div>
                    <div className="text-base text-center w-full">
                      Signature of Employer with Seal of Establishment
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewEPF;
