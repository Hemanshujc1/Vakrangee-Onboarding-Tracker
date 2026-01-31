import React from 'react';
import { Briefcase } from 'lucide-react';

const FormSection = ({ title, children, icon: Icon = Briefcase }) => {
    return (
        <div className="bg-white p-6 flex-1 rounded-xl border border-gray-100 shadow-sm max-h-max">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#4E4E4E]">{title}</h3>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Icon size={20} /> 
                </div>
            </div>              
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
};

export default FormSection;
