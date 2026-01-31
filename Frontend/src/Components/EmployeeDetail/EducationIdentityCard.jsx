import React from 'react';
import { ShieldCheck } from 'lucide-react';

const EducationIdentityCard = ({ employee }) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#4E4E4E]">Education & Identity</h3>
                    <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
                        <ShieldCheck size={20} /> 
                    </div>
                </div>
                <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-400">10th Percentage</p>
                        <p className="text-sm text-gray-800 font-medium">
                            {employee.tenthPercentage ? `${employee.tenthPercentage}%` : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">12th Percentage</p>
                        <p className="text-sm text-gray-800 font-medium">
                            {employee.twelfthPercentage ? `${employee.twelfthPercentage}%` : 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-400">Aadhar Number</p>
                        <p className="text-sm text-gray-800 font-medium tracking-wide">
                            {employee.adharNumber || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">PAN Number</p>
                        <p className="text-sm text-gray-800 font-medium tracking-wide">
                            {employee.panNumber || 'N/A'}
                        </p>
                    </div>
                </div>
                </div>
        </div>
    );
};

export default EducationIdentityCard;
