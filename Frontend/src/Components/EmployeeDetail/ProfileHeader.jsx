import React from 'react';
import { Briefcase, UserCheck, Clock, ShieldCheck, Building, CheckCircle } from 'lucide-react';

const ProfileHeader = ({ employee, isEditing, editForm, setEditForm, children }) => {
    
    const getOnboardingStatusDisplay = (stage) => {
        // Check if user has logged in at least once
        if (stage === 'BASIC_INFO' && !employee.firstLoginAt) {
             return (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm w-fit text-red-600 bg-red-100">
                    <Clock size={18} />
                    <span>Login Pending</span>
                </div>
            );
        }

        const stages = {
            'BASIC_INFO': { label: 'Profile Pending', color: 'text-yellow-600 bg-yellow-100', icon: UserCheck },
            'PRE_JOINING': { label: 'In Progress', color: 'text-blue-600 bg-blue-100', icon: Clock },
            'PRE_JOINING_VERIFIED': { label: 'Ready to Join', color: 'text-green-600 bg-green-100', icon: ShieldCheck },
            'POST_JOINING': { label: 'Joining Formalities', color: 'text-yellow-600 bg-yellow-100', icon: Building },
            'ACTIVE': { label: 'Completed', color: 'text-green-600 bg-green-100', icon: CheckCircle }
        };

        const status = stages[stage] || { label: stage || 'Unknown', color: 'text-gray-600 bg-gray-100', icon: Clock };
        const Icon = status.icon;

        return (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm w-fit ${status.color}`}>
                <Icon size={18} />
                <span>{status.label}</span>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-32 bg-linear-to-r from-[#2C9DE6] to-[#205081]"></div>
            <div className="px-8 pb-8">
                <div className="relative flex flex-col md:flex-row justify-between items-center md:items-end -mt-12 mb-6 gap-4">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                        <div className="relative">
                            {(employee.profilePhoto || employee.profilePhotoFile) ? (
                                <img 
                                    src={employee.profilePhotoFile 
                                        ? `http://localhost:3001/uploads/profilepic/${employee.profilePhotoFile}`
                                        : employee.profilePhoto} 
                                    alt={employee.firstName} 
                                    className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                                    onError={(e) => {
                                        e.target.style.display = 'none'; // Back to fallback
                                        e.target.parentElement.querySelector('.fallback-initial').style.display = 'flex';
                                    }}
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center text-4xl font-bold text-[#2C9DE6]">
                                    {employee.firstName?.[0]}
                                </div>
                            )}
                            {/* Fallback Initial (Hidden by default) */}
                            <div className="fallback-initial hidden absolute inset-0 w-32 h-32 rounded-full border-4 border-white shadow-md bg-white items-center justify-center text-4xl font-bold text-[#2C9DE6]">
                                    {employee.firstName?.[0]}
                            </div>
                        </div>
                        <div className="mb-2">
                            <h2 className="text-2xl font-bold text-[#4E4E4E]">{employee.firstName} {employee.lastName}</h2>
                            <div className="text-[#2C9DE6] font-medium flex items-center gap-2">
                                <Briefcase size={16} />
                                {isEditing ? (
                                        <input 
                                            type="text"
                                            value={editForm.jobTitle}
                                            onChange={(e) => setEditForm({...editForm, jobTitle: e.target.value})}
                                            className="border border-blue-200 rounded px-2 py-1 text-sm text-[#2C9DE6] font-medium focus:outline-none focus:border-[#2C9DE6] w-full"
                                            placeholder="Job Title"
                                        />
                                ) : (
                                    <span>{employee.jobTitle || 'Employee'}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mb-4">
                        {getOnboardingStatusDisplay(employee.onboardingStage)}
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
};

export default ProfileHeader;
