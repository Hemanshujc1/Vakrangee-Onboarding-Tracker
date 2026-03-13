import React from 'react';
import { Briefcase } from 'lucide-react';

const FormSection = ({ title, children, icon: Icon = Briefcase }) => {
    return (
        <div className="bg-white p-4 sm:p-5 md:p-6 flex-1 rounded-xl border border-gray-100 shadow-sm">
            
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-(--color-text-dark)">
                    {title}
                </h3>

                <div className="p-2 bg-(--color-primary)/10 text-(--color-primary) rounded-lg shrink-0">
                    <Icon size={18} className="sm:w-5 sm:h-5" />
                </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
                {children}
            </div>
        </div>
    );
};

export default FormSection;
