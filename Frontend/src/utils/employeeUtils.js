export const getEmployeeStatus = (emp) => {
    if (emp.onboarding_stage === 'Not_joined') return "Not Joined";
    if (!emp.firstLoginAt && !emp.lastLoginAt) return "Login Pending";
    switch (emp.onboarding_stage) {
        case 'BASIC_INFO': return "Profile Pending";
        case 'PRE_JOINING': return "In Progress";
        case 'PRE_JOINING_VERIFIED': return "Ready to Join";
        case 'POST_JOINING': return "Joining Formalities";
        case 'ONBOARDED': return "Completed";
        default: return emp.onboarding_stage;
    }
};
export const getStatusColor = (statusText) => {
    switch (statusText) {
        case "Login Pending": return "bg-orange-100 text-orange-600";
        case "Profile Pending": return "bg-yellow-100 text-yellow-600";
        case "In Progress": return "bg-blue-100 text-blue-600";
        case "Ready to Join": return "bg-green-100 text-green-600";
        case "Joining Formalities": return "bg-purple-100 text-purple-600";
        case 'Joining Formalities': return "bg-purple-100 text-purple-600";
        case "Completed": return "text-green-600 bg-green-100";
        case "Not Joined": return "bg-gray-100 text-gray-500 border border-gray-200";
        default: return "bg-gray-100 text-gray-600";
    }
};

export const getUniqueOptions = (data, field) => {
    return [...new Set(data.map(item => item[field]).filter(Boolean))];
};
