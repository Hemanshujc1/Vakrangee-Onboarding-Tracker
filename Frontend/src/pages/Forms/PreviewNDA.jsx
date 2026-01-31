import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import useAutoFill from "../../hooks/useAutoFill";
import DocumentHeader from "../../Components/Forms/Shared/DocumentHeader";
import PreviewActions from "../../Components/Forms/Shared/PreviewActions";
import { useAlert } from "../../context/AlertContext";

const PreviewNDA = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useAlert();
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
    const derivedStatus = stateStatus || autoFillData?.ndaStatus;
    const data = stateData || autoFillData?.ndaData;
    const [actionLoading, setActionLoading] = useState(false);

    // Map for compatibility with existing JSX
    const formData = data;
    const status = derivedStatus;
    const employeeId = targetId;
    const rejectionReason = stateRejectionReason || autoFillData?.ndaRejectionReason;
    const signaturePreview = stateSig;

    // If accessed directly without state AND still loading backend
    if (autoFillLoading && !data) {
        return <div className="p-10 text-center">Loading Preview...</div>;
    }

    if (!data) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-gray-800">No Data to Preview</h2>
                <button
                    onClick={() => navigate("/forms/non-disclosure-agreement")}
                    className="mt-4 text-blue-600 hover:underline"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Derive signature URL if not provided in state (e.g. from Dashboard)
    const finalSignature = signaturePreview || (formData.signature_path 
        ? `http://localhost:3001/uploads/signatures/${formData.signature_path}` 
        : null);

    const handleFinalSubmit = async () => {
        setActionLoading(true);
        try {
            const payload = new FormData();
            Object.keys(formData).forEach((key) => {
                if (key === "signature") {
                    if (formData.signature instanceof File) {
                        payload.append("signature", formData.signature);
                    }
                } else {
                    payload.append(key, formData[key] || "");
                }
            });
            payload.append("isDraft", "false");

            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3001/api/forms/nda", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: payload,
            });

            if (response.ok) {
                await showAlert("NDA Submitted Successfully!", { type: 'success' });
                navigate("/employee/post-joining");
            } else {
                const error = await response.json();
                await showAlert(`Error: ${error.message}`, { type: 'error' });
            }
        } catch (e) {
            console.error(e);
            await showAlert("Submission failed.", { type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerification = async (newStatus, reason = null) => {
        const isConfirmed = await showConfirm(`Are you sure you want to ${newStatus === 'VERIFIED' ? 'approve' : 'reject'} this form?`);
        if (!isConfirmed) return;

        if (newStatus === 'REJECTED' && !reason) {
            reason = prompt("Please enter a reason for rejection:");
            if (!reason) return; 
        }
        
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3001/api/forms/nda/verify/${employeeId}`, {
                status: newStatus,
                remarks: reason
            }, { headers: { Authorization: `Bearer ${token}` } });

            await showAlert(`Form ${newStatus === 'VERIFIED' ? 'Approved' : 'Rejected'} Successfully!`, { type: 'success' });
            navigate(-1); 
        } catch (error) {
            console.error("Verification Error:", error);
            await showAlert("Failed to update status.", { type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <PreviewActions
                    status={derivedStatus}
                    isHR={isHR}
                    onBack={() => navigate(-1)}
                    onSubmit={handleFinalSubmit}
                    onVerify={handleVerification}
                    onEdit={() => navigate("/forms/non-disclosure-agreement")}
                    isSubmitting={actionLoading}
                    loading={actionLoading}
                />

                {derivedStatus === 'REJECTED' && (stateRejectionReason || autoFillData?.ndaRejectionReason) && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 print:hidden">
                        <div className="font-bold flex items-center gap-2 mb-1">
                            Form Rejected
                        </div>
                        <p className="text-sm">
                            <span className="font-semibold">Reason:</span> {stateRejectionReason || autoFillData.ndaRejectionReason}
                        </p>
                        <p className="text-xs mt-2 text-red-600">Please review the reason and click "Edit & Resubmit" to make necessary changes.</p>
                    </div>
                )}

                {/* Document Content */}
                <div
                    className="bg-white p-12 md:p-16 shadow-md rounded-sm print:shadow-none print:p-0 min-h-[29.7cm] print:min-h-0 print:h-auto flex flex-col print:block relative w-full max-w-[21cm] mx-auto text-gray-900 font-serif leading-relaxed"
                >
                    <DocumentHeader title="Non-Disclosure Agreement" subtitle="Confidentiality Agreement" />
                    
                    <hr className="border-t-2 border-gray-800 mb-8" />

                    {/* 3. Effective Date */}
                    <div className="mb-6 text-sm">
                        <p className="mb-1">The "Agreement" is made effective from:</p>
                        <p>Date: {new Date().toLocaleDateString()}</p>
                    </div>

                    {/* 4. Parties */}
                    <div className="space-y-6 mb-8 text-sm">
                        {/* Between */}
                        <div className="grid grid-cols-[100px_1fr]">
                            <div className="font-bold">Between:</div>
                            <div>
                                <div className="flex items-end">
                                    <div className="flex-1 border-b border-black px-2 pb-0.5 font-bold uppercase">
                                        {formData.employee_full_name}
                                    </div>
                                    <div className="ml-2 whitespace-nowrap">(the "Employee")</div>
                                </div>
                                <div className="mt-2 text-sm text-gray-800">
                                    An individual with its main address at:
                                </div>
                                <div className="border-b border-black mt-1 px-2 pb-0.5">
                                    {formData.address_line1}, {formData.address_line2}, {formData.post_office}
                                </div>
                                <div className="border-b border-black mt-1 px-2 pb-0.5">
                                    {formData.city}, {formData.district}, Pincode - {formData.pincode}
                                </div>
                            </div>
                        </div>

                        {/* And */}
                        <div className="grid grid-cols-[100px_1fr]">
                            <div className="font-bold">And:</div>
                            <div className="text-justify">
                                <span className="font-bold">Vakrangee Limited</span> a
                                corporation organized and existing under 'Companies Act, 1956'
                                and having its Head office located at:
                                <div className="mt-2 underline text-gray-800">
                                    Plot No. 93, Road No-16, M.I.D.C., Marol, Andheri (East),
                                    Mumbai: - 400093, Maharashtra.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Preamble */}
                    <p className="text-justify mb-6 text-sm">
                        In consideration of employment by company and disclosure by company
                        of confidential data and trade secret information, the undersigned
                        employee hereby covenants and agrees as follows:
                    </p>

                    <div className="break-inside-avoid mt-10">
                        {/* 6. Terms */}
                        <div className="space-y-6 text-justify text-sm">
                            <div>
                                <h3 className="font-bold mb-2 uppercase">1. Confidentiality:</h3>
                                <p className="mb-2">
                                    Employee acknowledges that in the course of employee's
                                    employment by company employee will be exposed to company's
                                    confidential data/ trade secret information or any other data
                                    which is crucial to company. Employee agrees to treat all such
                                    information or data confidential and to take all necessary
                                    precautions against disclosure of such information to
                                    unauthorized persons or any third party during and after terms
                                    of this agreement.
                                </p>
                                <p className="mb-2">
                                    Employee acknowledges that trade secret or any crucial
                                    information of company will consist but may not be limited to:
                                </p>
                                <div className="pl-6 md:pl-10 space-y-1">
                                    <div className="flex gap-2">
                                        <span>a{")"}</span>
                                        <div>
                                            <span className="font-bold">Technical Information:</span>{" "}
                                            Methods, processes, formulae, composition, techniques,
                                            systems, computer programs, inventions, machines, research
                                            projects etc.
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span>b{")"}</span>
                                        <div>
                                            <span className="font-bold">Business Information:</span>{" "}
                                            Customer lists, pricing data, sources of supply, financial
                                            data, marketing or production.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold mb-2 uppercase">2. Use</h3>
                                <p>
                                    Employee shall not use company's confidential and trade secret
                                    information, except to the extent necessary to provide services
                                    or goods requested by company.
                                </p>
                            </div>
                        </div>

                        {/* 7. Signatures */}
                        <div className="mt-16 pt-8 flex gap-8 justify-between items-end text-sm">
                            {/* Left: Company */}
                            <div className="flex-1">
                                <div className="font-bold uppercase mb-16">
                                    For Vakrangee Ltd.
                                </div>

                                <div className="border-t border-dashed border-black pt-2 w-full max-w-62.5">
                                    Authorised Signatory
                                </div>

                                <div className="mt-6 flex items-end gap-2">
                                    <span className="uppercase">Date:</span>
                                    <span className="border-b border-dashed border-black w-32 inline-block"></span>
                                </div>
                            </div>

                            {/* Right: Employee (Accepted) */}
                            <div className="flex-1 flex flex-col items-end text-right">
                                <div className="font-bold uppercase mb-4 text-left w-full pl-8">
                                    Accepted 
                                    <span className="font-normal border-b border-black w-32 inline-block mx-3">
                                        {/* Signature Image */}
                                        <div className="mb-2 pr-8 w-full flex justify-end">
                                            {finalSignature ? (
                                                <img
                                                    src={finalSignature}
                                                    alt="Signature"
                                                    className="h-12 object-contain"
                                                />
                                            ) : (
                                                <div className="h-12 w-32"></div>
                                            )}
                                        </div>
                                    </span>
                                </div>


                                <div className="flex items-end gap-2 w-full pl-8 justify-between">
                                    <span className="uppercase font-bold">Name</span>
                                    <span className="border-b border-black flex-1 text-center font-bold uppercase text-sm px-2 pb-0.5">
                                        {formData.employee_full_name}
                                    </span>
                                </div>

                                <div className="mt-6 flex items-end gap-2 w-full pl-8 justify-between">
                                    <span className="uppercase">Date:</span>
                                    <span className="border-b border-black flex-1 text-center text-sm px-2 pb-0.5">
                                        {new Date().toLocaleDateString("en-GB")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewNDA;
