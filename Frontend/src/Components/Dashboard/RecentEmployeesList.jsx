import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../Shared/StatusBadge';
import { getEmployeeStatus } from '../../utils/employeeUtils';

const RecentEmployeesList = ({ 
    title = "Recent Employees", 
    viewAllLink, 
    employees = [], 
    loading = false,
    emptyMessage = "No recent employees found.",
    onEmployeeClick 
}) => {
    const navigate = useNavigate();

    const handleEmployeeClick = (id) => {
        if (onEmployeeClick) {
            onEmployeeClick(id);
        } else if (viewAllLink) {
             // Default behavior if viewAllLink base is provided, though explicit handler is safer
             // This fallback might need adjustment depending on exact route structure
             navigate(`${viewAllLink}/${id}`);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-(--color-secondary)">
                    {title}
                </h2>
                {viewAllLink && (
                    <button
                        onClick={() => navigate(viewAllLink)}
                        className="text-xs text-(--color-primary) hover:underline font-medium"
                    >
                        View All
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {loading ? (
                    <p className="text-gray-400 text-sm text-center py-4">
                        Loading...
                    </p>
                ) : employees.length > 0 ? (
                    employees.map((employee) => (
                        <div
                            key={employee.id}
                            onClick={() => handleEmployeeClick(employee.id)}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                {employee.profilePhoto ? (
                                    <img
                                        src={employee.profilePhoto}
                                        alt={employee.firstName}
                                        className="w-10 h-10 rounded-full object-cover shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-(--color-secondary) text-white flex items-center justify-center font-bold text-sm shrink-0">
                                        {employee.firstName?.[0]}
                                        {employee.lastName?.[0]}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-(--color-text-dark) truncate">
                                        {employee.firstName} {employee.lastName}
                                    </h4>
                                    <p className="text-sm text-gray-500 truncate">
                                        {employee.jobTitle || "No Title"}
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0 ml-2">
                                <StatusBadge status={getEmployeeStatus(employee)} />
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-sm text-center py-4">
                        {emptyMessage}
                    </p>
                )}
            </div>
        </div>
    );
};

export default RecentEmployeesList;
