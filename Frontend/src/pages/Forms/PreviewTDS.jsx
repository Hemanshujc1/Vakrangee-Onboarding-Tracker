import React, { useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import PreviewActions from "../../Components/Forms/Shared/PreviewActions";
import useAutoFill from "../../hooks/useAutoFill";
import { useAlert } from "../../context/AlertContext";

const PreviewTDS = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const componentRef = useRef();
  const { showAlert, showConfirm } = useAlert();
  const [actionLoading, setActionLoading] = useState(false);

  // Get data passed from the form
  const { employeeId: paramEmployeeId } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { 
    formData: stateData, 
    signaturePreview: stateSig, 
    status: stateStatus, 
    isHR: stateIsHR, 
    employeeId: stateEmployeeId, 
    rejectionReason: stateRejectionReason 
  } = location.state || {};

  const targetId = paramEmployeeId || stateEmployeeId || user.employeeId;
  const { data: autoFillData, loading: autoFillLoading } = useAutoFill(targetId);

  const isHR = stateIsHR || ["HR_ADMIN", "HR_SUPER_ADMIN", "admin"].includes(user.role);
  const derivedStatus = stateStatus || autoFillData?.tdsStatus;
  const data = stateData || autoFillData?.tdsData;

  // Map for compatibility
  const formData = data;
  const status = derivedStatus;
  const employeeId = targetId;
  const rejectionReason = stateRejectionReason || autoFillData?.tdsRejectionReason;
  const signaturePreview = stateSig || (data?.signature_path ? `http://localhost:3001/uploads/signatures/${data.signature_path}` : null);

  if (autoFillLoading && !data) return <div className="p-10 text-center">Loading...</div>;


  if (!formData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">No Data Found</h2>
        <p className="mt-2 text-gray-600">
          Please go back and fill the form again.
        </p>
        <button
          onClick={() => navigate("/forms/tds-form")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Form
        </button>
      </div>
    );
  }

  const handleFinalSubmit = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "signature") {
           if (formData.signature instanceof File) {
               data.append("signature", formData.signature);
           }
        } else if (key !== "signature_path" && key !== "signaturePreview") {
           data.append(key, formData[key] == null ? "" : formData[key]);
        }
      });

      if (!formData.signature) {
        const existingPath = formData.signature_path;
        if (existingPath) data.append("signature_path", existingPath);
      }

      data.append("isDraft", "false");

      await axios.post("http://localhost:3001/api/forms/tds", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await showAlert("Form Submitted Successfully!", { type: 'success' });
      navigate("/employee/post-joining");
    } catch (error) {
      console.error("Error submitting form:", error);
      await showAlert(`Submission failed: ${error.response?.data?.message || error.message}`, { type: 'error' });
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
        `http://localhost:3001/api/forms/tds/verify/${employeeId}`,
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
      navigate(-1);
    } catch (error) {
      console.error("Verification Error:", error);
      await showAlert("Failed to update status.", { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-serif print:bg-white print:p-0 print:m-0">
      <style>
        {`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            margin: 0;
            padding: 0;
            background-color: white !important;
          }
          /* Hide headers and footers that browsers might add */
        }
        `}
      </style>
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg p-8 md:p-12 min-h-[297mm] flex flex-col print:shadow-none print:w-full print:max-w-full print:min-h-0 print:m-0 print:p-10">
        <PreviewActions
          status={derivedStatus}
          isHR={isHR}
          onBack={() => navigate(-1)}
          onPrint={() => window.print()}
          onVerify={handleVerification}
          onEdit={() => navigate("/forms/tds-form", { 
            state: { 
              formData: data, 
              isEdit: true, 
              isResubmitting: derivedStatus === 'REJECTED' 
            } 
          })}
          onSubmit={handleFinalSubmit}
          isSubmitting={actionLoading}
        />

        {derivedStatus === 'REJECTED' && (stateRejectionReason || autoFillData?.tdsRejectionReason) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 print:hidden">
                <div className="font-bold flex items-center gap-2 mb-1">
                    Form Rejected
                </div>
                <p className="text-sm px-1">
                    <span className="font-semibold">Reason:</span> {stateRejectionReason || autoFillData?.tdsRejectionReason}
                </p>
                <p className="text-xs mt-2 text-red-600">Please review the reason and click "Edit & Resubmit" to make necessary changes.</p>
            </div>
        )}

        {/* Printable Content */}
        <div ref={componentRef} className="print:text-black text-gray-900">
          <div className="text-center mb-6 border-b-2 border-black pb-4">
            <h1 className="font-bold text-2xl uppercase">Vakrangee Limited</h1>
            <h2 className="font-bold text-xl uppercase mt-2">
              DECLARATION FOR T.D.S. AS PER INCOME TAX ACT
            </h2>
          </div>

          {/* Tax Regime */}
          <div className="border border-black w-full">
            <div className="grid grid-cols-3 text-center">
              {/* Left Text */}
              <div className="border-r border-black p-3 flex items-center justify-center">
                <span className="font-normal uppercase text-sm">
                  OPTION FOR OPTING NEW TAX REGIME OR OLD TAX REGIME
                </span>
              </div>

              {/* New Tax Regime */}
              <div className="border-r border-black p-3">
                <div className="font-normal uppercase mb-2 text-sm">
                  New Tax Regime
                </div>
                <div className="flex justify-center">
                  <div className="w-6 h-6 border border-black flex items-center justify-center">
                    {formData.tax_regime === "new" && (
                      <span className="text-lg font-normal">✔</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Old Tax Regime */}
              <div className="p-3">
                <div className="font-normal uppercase mb-2 text-sm">
                  Old Tax Regime
                </div>
                <div className="flex justify-center">
                  <div className="w-6 h-6 border border-black flex items-center justify-center">
                    {formData.tax_regime === "old" && (
                      <span className="text-lg font-normal">✔</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-0">
            <table className="w-full mt-6 border border-black table-fixed text-center text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="w-[10%] border border-black p-2">SR NO</th>
                  <th className="w-[70%] border border-black p-2 text-left pl-4">
                    PARTICULARS
                  </th>
                  <th className="w-[20%] border border-black p-2">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1">1</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Education Loan (Year in which loan taken -{" "}
                    {formData.education_loan_start_year})
                  </td>
                  <td className="border border-black p-1">
                    {formData.education_loan_amt}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">a)</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Interest Payable on Educational Loan (From April to March{" "}
                    {formData.financial_year})
                  </td>
                  <td className="border border-black p-1">
                    {formData.education_interest}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">2</td>
                  <td className="border border-black p-1 text-left pl-4 font-bold">
                    Housing Loan Details
                  </td>
                  <td className="border border-black p-1"></td>
                </tr>
                <tr>
                  <td className="border border-black p-1">a)</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Principal Amount payable (April to March{" "}
                    {formData.financial_year})
                  </td>
                  <td className="border border-black p-1">
                    {formData.housing_loan_principal}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">b)</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Interest Amount payable (April to March{" "}
                    {formData.financial_year})
                  </td>
                  <td className="border border-black p-1">
                    {formData.housing_loan_interest}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">3</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Contribution to National Pension Scheme
                  </td>
                  <td className="border border-black p-1">
                    {formData.nps_contribution}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">4</td>
                  <td className="border border-black p-1 text-left pl-4">
                    HRA (Rent Per Month Rs.{formData.hra_rent_per_month} X No.
                    of Months {formData.hra_months})
                  </td>
                  <td className="border border-black p-1">
                    {formData.hra_rent_per_month && formData.hra_months
                      ? Number(formData.hra_rent_per_month) *
                        Number(formData.hra_months)
                      : ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1 text-left pl-4">
                    Related:
                    <span className="font-bold ml-2">
                      YES{" "}
                      {formData.hra_is_related_landlord === "yes" ? "✓" : ""}
                    </span>{" "}
                    /
                    <span className="font-bold ml-1">
                      NO {formData.hra_is_related_landlord === "no" ? "✓" : ""}
                    </span>
                  </td>
                  <td className="border border-black p-1"></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1"></td>
                  <td className="p-1 text-left pl-4">
                    Relationship with the landlord (If YES):{" "}
                    <span className="font-bold uppercase">
                      {formData.hra_landlord_relationship}
                    </span>
                    <br />
                    <span className="text-xs italic text-gray-600">
                      In case of Parents, Registered Agreement with parent is
                      compulsory, as per recent ITAT Judgement
                    </span>
                  </td>
                  <td className="border border-black p-1"></td>
                </tr>
                <tr>
                  <td className="border border-black p-1">5</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Contribution to Medical Insurance Premium
                  </td>
                  <td className="border border-black p-1">
                    {formData.medical_total_contribution}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">a)</td>
                  <td className="border border-black p-1 text-left pl-4">
                    For Self &amp; Family (Eq. Self, Wife &amp; Kids)
                  </td>
                  <td className="border border-black p-1">
                    {formData.medical_self_family}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">b)</td>
                  <td className="border border-black p-1 text-left pl-4">
                    For Parents
                  </td>
                  <td className="border border-black p-1">
                    {formData.medical_parents}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">c)</td>
                  <td className="border border-black p-1 text-left pl-4">
                    For Senior Citizen Parents
                  </td>
                  <td className="border border-black p-1">
                    {formData.medical_senior_parents}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">6</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Life Insurance Premium
                  </td>
                  <td className="border border-black p-1">
                    {formData.life_insurance_premium}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">7</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Contribution to Sukanya Samridhi Yojana (Post Office)
                  </td>
                  <td className="border border-black p-1">
                    {formData.ssy_contribution}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">8</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Contribution to Public Provident Fund
                  </td>
                  <td className="border border-black p-1">
                    {formData.ppf_contribution}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">9</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Subscription to N.S.C.
                  </td>
                  <td className="border border-black p-1">
                    {formData.nsc_subscription}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">10</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Subscription to United Link Insurance Plan
                  </td>
                  <td className="border border-black p-1">
                    {formData.united_link_subsciption}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">11</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Subscription to IDBI / ICICI Bonds
                  </td>
                  <td className="border border-black p-1">
                    {formData.banks_bonds}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">12</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Fixed Deposit in the scheduled bank (More than 5 years)
                  </td>
                  <td className="border border-black p-1">
                    {formData.fd_bank}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">13</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Tuition Fees paid for children’s Education
                  </td>
                  <td className="border border-black p-1">
                    {formData.children_tuition_fees}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">14</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Investments in the Mutual Fund ELSS
                  </td>
                  <td className="border border-black p-1">
                    {formData.mf_investment}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1">15</td>
                  <td className="border border-black p-1 text-left pl-4">
                    Any other allowable investment (Mention Details)
                    <br />
                    {formData.other_investment_details && (
                      <span className="font-semibold">
                        {formData.other_investment_details}
                      </span>
                    )}
                  </td>
                  <td className="border border-black p-1">
                    {formData.other_investment_amt}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Declaration Text */}
          <div className="mt-12 pt-3 text-sm text-justify break-inside-avoid print:mt-20 print:pt-20">
            <p className="mb-2">
              I declare that I will contribute to the above tax saving schemes
              during the F.Y. <strong>{formData.financial_year}</strong> for
              A.Y. <strong>{formData.assessment_year}</strong>. The same may be
              taken for my Income Tax computation for TDS purpose.
            </p>
            <p className="mb-2 font-bold">
              Tax Regime once selected cannot be changed during F.Y.{" "}
              {formData.financial_year}. If employee does not select any tax
              regime then New tax regime will be considered.
            </p>
          </div>

          {/* Employee Details & Signature */}
          <div className="mt-8 mb-6 p-6 print:bg-white print:border-black break-inside-avoid">
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <span className="font-bold min-w-37.5 inline-block">Name:</span>
                {formData.employee_name}
              </div>
              <div className="flex items-start">
                <span className="font-bold min-w-37.5 inline-block">
                  Address:
                </span>
                <span className="flex-1">
                  {[
                    formData.address_line1,
                    formData.address_line2,
                    formData.landmark,
                    formData.city,
                    formData.district,
                    formData.state,
                    formData.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
              <div>
                <span className="font-bold min-w-37.5 inline-block">
                  Designation:
                </span>
                {formData.job_title}
              </div>
              <div>
                <span className="font-bold min-w-37.5 inline-block">
                  Employee Code:
                </span>
                {formData.employee_id}
              </div>

              <div>
                <span className="font-bold min-w-37.5 inline-block">
                  PAN No:
                </span>
                {formData.pan_no}
              </div>
              <div>
                <span className="font-bold min-w-37.5 inline-block">Date:</span>
                {new Date().toLocaleDateString()}
              </div>

              {/* Signature Block */}
              <div className="mt-1 border-gray-300 pt-4 flex items-end">
                <span className="font-bold min-w-37.5 inline-block">
                  Signature:
                </span>
                <div>
                  {signaturePreview ? (
                    <img
                      src={signaturePreview}
                      alt="Signature"
                      className="h-16 w-auto border border-gray-300 p-1"
                    />
                  ) : formData.signature_path ? (
                    <img
                      src={`http://localhost:3001/uploads/signatures/${formData.signature_path}`}
                      alt="Signature"
                      className="h-16 w-auto border border-gray-300 p-1"
                    />
                  ) : (
                    <div className="h-16 w-48 border border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-400">
                      No Signature
                    </div>
                  )}
                  <p className="text-xs font-bold mt-1">
                    (Signature of Employee)
                  </p>
                </div>
              </div>
              <div>
                <span className="font-bold min-w-37.5 inline-block">
                  Contact No:
                </span>
                {formData.contact_no}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewTDS;
