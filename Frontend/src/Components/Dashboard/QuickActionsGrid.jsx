import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickActionsGrid = ({ title = "Quick Actions", actions = [] }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold mb-4 text-(--color-secondary)">
                {title}
            </h2>
            <div className="grid grid-cols-2 gap-4">
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    // Default colors if not provided
                    const borderColorClass = action.borderColor || "hover:border-(--color-primary)";
                    const textColorClass = action.textColor || "hover:text-(--color-primary)";
                    const bgColorClass = action.bgColor || "hover:bg-blue-50";

                    return (
                        <button
                            key={index}
                            onClick={() => {
                                if (action.link) navigate(action.link);
                                if (action.onClick) action.onClick();
                            }}
                            className={`p-4 border border-dashed border-gray-300 rounded-xl transition-all flex flex-col items-center justify-center gap-2 text-gray-600 ${borderColorClass} ${bgColorClass} ${textColorClass}`}
                        >
                            {Icon && <Icon size={24} />}
                            <span className="font-medium text-center">{action.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickActionsGrid;
