import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

const VerificationActionCard = ({ employee, handleVerificationAction, actionLoading }) => {
    if (employee.basicInfoStatus === 'VERIFIED') {
        return (
            <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm mb-6">
                 <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-green-800">Basic Information Verified</h3>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <ShieldCheck size={20} /> 
                    </div>
                </div>
                <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                    Verified by: <span className="font-semibold">{employee.basicInfoVerifiedByName || 'HR Admin'}</span>
                </p>
            </div>
        );
    }

    if (employee.basicInfoStatus === 'REJECTED') {
        return (
            <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm">
                 <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-red-800">Verification Rejected</h3>
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                        <X size={20} /> 
                    </div>
                </div>
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                    Reason: {employee.basicInfoRejectionReason}
                </p>
            </div>
        );
    }

    if (employee.basicInfoStatus === 'SUBMITTED') {
        return (
            <div className="p-6 rounded-xl border border-orange-200 shadow-sm bg-orange-50 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-orange-800">Pending Verification</h3>
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <ShieldCheck size={20} /> 
                    </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    Employee has submitted their basic details for verification. Please review and take action.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleVerificationAction('VERIFIED')}
                        disabled={actionLoading}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm disabled:opacity-70"
                    >
                        Approve
                    </button>
                    <button
                        onClick={() => handleVerificationAction('REJECTED')}
                        disabled={actionLoading}
                        className="flex-1 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-70"
                    >
                        Reject
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default VerificationActionCard;
