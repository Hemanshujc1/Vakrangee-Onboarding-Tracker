import React, { useState } from 'react';
import { 
    Filter, Building2, Briefcase, MapPin, User, CheckCircle2, 
    X, ChevronDown, ChevronRight, Check
} from 'lucide-react';

const EmployeeFilters = ({
    filters,
    options,
    showStatus = true,
    showDepartment = true,
    isOpen, // for mobile visibility control
    onClose, // for mobile close
    variant = 'sidebar'
}) => {
    const {
        status, setStatus,
        department, setDepartment,
        jobTitle, setJobTitle,
        location, setLocation,
        resetFilters
    } = filters;

    const {
        statuses = [],
        departments = [],
        jobTitles = [],
        locations = []
    } = options;

    const FilterSection = ({ title, icon: Icon, options, value, onChange, placeholder = "All" }) => {
        const [isExpanded, setIsExpanded] = useState(true);

        return (
            <div className="py-4 border-b border-gray-100 last:border-0">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full text-left mb-2 group"
                >
                    <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                        <Icon size={16} className="text-(--color-primary)" />
                        <span>{title}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                </button>
                
                {isExpanded && (
                    <div className="space-y-1 mt-2 pl-1">
                        <label className={`flex items-center gap-2 cursor-pointer py-1 px-2 rounded-md transition-colors text-sm ${!value ? 'bg-(--color-primary)/10 text-(--color-primary) font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <input 
                                type="radio" 
                                name={title} 
                                checked={!value} 
                                onChange={() => onChange("")}
                                className="hidden"
                            />
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${!value ? 'border-(--color-primary) bg-(--color-primary)' : 'border-gray-300'}`}>
                                {!value && <Check size={10} className="text-white" />}
                            </span>
                            <span>{placeholder}</span>
                        </label>
                        {options.map((opt) => (
                            <label key={opt} className={`flex items-center gap-2 cursor-pointer py-1 px-2 rounded-md transition-colors text-sm ${value === opt ? 'bg-(--color-primary)/10 text-(--color-primary) font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <input 
                                    type="radio" 
                                    name={title} 
                                    value={opt} 
                                    checked={value === opt} 
                                    onChange={() => onChange(opt)}
                                    className="hidden"
                                />
                                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${value === opt ? 'border-(--color-primary) bg-(--color-primary)' : 'border-gray-300'}`}>
                                    {value === opt && <Check size={10} className="text-white" />}
                                </span>
                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const hasActiveFilters = status || department || jobTitle || location || filters.assignedHR;

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 shrink-0
                        ${variant === 'sidebar' 
                            ? (isOpen ? 'fixed inset-y-0 right-0 z-50 w-80 m-0 rounded-none shadow-2xl overflow-y-auto' : 'hidden')
                            : 'w-full block'
                        }
                        transition-all duration-300 ease-in-out
                        `}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-(--color-primary)" />
                    <h3 className="font-bold text-gray-900">Filters</h3>
                </div>
                {variant === 'sidebar' && (
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="p-4 pt-0">
                {hasActiveFilters && (
                    <div className="py-3 flex justify-end">
                         <button 
                            onClick={resetFilters}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}

                {/* Status */}
                {showStatus && (
                    <FilterSection 
                        title="Status" 
                        icon={CheckCircle2} 
                        options={statuses} 
                        value={status} 
                        onChange={setStatus} 
                    />
                )}

                {/* Department */}
                {showDepartment && (
                    <FilterSection 
                        title="Department" 
                        icon={Building2} 
                        options={departments} 
                        value={department} 
                        onChange={setDepartment} 
                    />
                )}

                {/* Job Title */}
                <FilterSection 
                    title="Job Title" 
                    icon={Briefcase} 
                    options={jobTitles} 
                    value={jobTitle} 
                    onChange={setJobTitle} 
                    placeholder="All Roles"
                />

                {/* Location */}
                <FilterSection 
                    title="Location" 
                    icon={MapPin} 
                    options={locations} 
                    value={location} 
                    onChange={setLocation} 
                />

                {/* Assigned HR */}
                {options.hrOptions && options.hrOptions.length > 0 && (
                    <FilterSection 
                        title="Assigned HR" 
                        icon={User} 
                        options={options.hrOptions} 
                        value={filters.assignedHR} 
                        onChange={filters.setAssignedHR} 
                    />
                )}
            </div>
        </div>
    );
};

export default EmployeeFilters;
