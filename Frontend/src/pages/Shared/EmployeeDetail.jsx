import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import { Mail, Phone, MapPin, Building, Briefcase, Calendar, ArrowLeft, Users, CheckCircle, Clock, ShieldCheck, UserCheck, Pencil, Save, X, CalendarDays } from 'lucide-react';
import axios from 'axios';

const EmployeeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [isEditing, setIsEditing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [hrAdmins, setHrAdmins] = useState([]);
    const [editForm, setEditForm] = useState({
        department: '',
        jobTitle: '',
        location: '',
        dateOfJoining: '',
        personalEmail: '',
        onboardingHrId: ''
    });

    useEffect(() => {
        fetchEmployeeDetails();
        fetchHrAdmins();
    }, [id]);

    const fetchHrAdmins = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/employees', config);
            const hrs = data.filter(emp => emp.role === 'HR_ADMIN' || emp.role === 'HR_SUPER_ADMIN');
            setHrAdmins(hrs);
        } catch (error) {
            console.error("Error fetching HR admins:", error);
        }
    };

    const fetchEmployeeDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`/api/employees/${id}`, config);
            setEmployee(data);
            
            setEditForm({
                department: data.department || '',
                jobTitle: data.jobTitle || '',
                location: data.location || '',
                dateOfJoining: data.dateOfJoining || '',
                personalEmail: data.personalEmail || '',
                email: data.email || '', 
                onboardingHrId: data.assignedHR?.id || ''
            });

        } catch (error) {
            console.error("Error fetching employee details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            await axios.put(`/api/employees/${id}`, editForm, config);
            
            await fetchEmployeeDetails(); 
            setIsEditing(false);
            alert("Details updated successfully!");

        } catch (error) {
            console.error("Error updating details:", error);
            alert("Failed to update details.");
        } finally {
            setActionLoading(false);
        }
    };
    
    const getOnboardingStatusDisplay = (stage) => {
        const stages = {
            'BASIC_INFO': { label: 'Profile Pending', color: 'text-yellow-600 bg-yellow-100', icon: UserCheck },
            'PRE_JOINING': { label: 'In Progress', color: 'text-blue-600 bg-blue-100', icon: Clock },
            'PRE_JOINING_VERIFIED': { label: 'Ready to Join', color: 'text-green-600 bg-green-100', icon: ShieldCheck },
            'POST_JOINING': { label: 'Joining Formalities', color: 'text-purple-600 bg-purple-100', icon: Building },
            'ACTIVE': { label: 'Completed', color: 'text-emerald-600 bg-emerald-100', icon: CheckCircle }
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

    if (loading) return <DashboardLayout><div className="p-10 text-center text-gray-500">Loading profile...</div></DashboardLayout>;
    if (!employee) return <DashboardLayout><div className="p-10 text-center text-gray-500">Employee not found.</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-500 hover:text-[#2C9DE6] transition-colors mb-4"
                        >
                            <ArrowLeft size={20} />
                            <span>Back to List</span>
                        </button>
                        <h1 className="text-3xl font-bold text-[#4E4E4E]">Employee Profile</h1>
                    </div>
                    
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 bg-[#2C9DE6] text-white px-5 py-2.5 rounded-lg hover:bg-[#205081] transition-all font-medium shadow-sm"
                        >
                            <Pencil size={18} />
                            <span>Edit Details</span>
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditForm({
                                        department: employee.department || '',
                                        jobTitle: employee.jobTitle || '',
                                        location: employee.location || '',
                                        dateOfJoining: employee.dateOfJoining || '',
                                        personalEmail: employee.personalEmail || '',
                                        onboardingHrId: employee.assignedHR?.id || ''
                                    });
                                }}
                                disabled={actionLoading}
                                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-all font-medium"
                            >
                                <X size={18} />
                                <span>Cancel</span>
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={actionLoading}
                                className="flex items-center gap-2 bg-[#2C9DE6] text-white px-5 py-2.5 rounded-lg hover:bg-[#205081] transition-all font-medium shadow-sm disabled:opacity-70"
                            >
                                <Save size={18} />
                                <span>{actionLoading ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-32 bg-linear-to-r from-[#2C9DE6] to-[#205081]"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="flex items-end gap-6">
                                <div className="relative">
                                    {employee.profilePhoto ? (
                                        <img 
                                            src={employee.profilePhoto} 
                                            alt={employee.firstName} 
                                            className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center text-4xl font-bold text-[#2C9DE6]">
                                            {employee.firstName?.[0]}
                                        </div>
                                    )}
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
                             <div className="flex items-center gap-3 text-gray-600">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Personal Email</p>
                                    {isEditing ? (
                                        <input 
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-[#2C9DE6]"
                                            placeholder="Email"
                                        />
                                    ) : (
                                        <p className="font-medium text-sm">{employee.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Phone</p>
                                    <p className="font-medium text-sm">{employee.phone || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
                                    <Building size={18} />
                                </div>
                                <div className="w-full">
                                    <p className="text-xs text-gray-400">Department</p>
                                    {isEditing ? (
                                        <input 
                                            type="text"
                                            value={editForm.department}
                                            onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-[#2C9DE6]"
                                            placeholder="Department"
                                        />
                                    ) : (
                                        <p className="font-medium text-sm">{employee.department || 'N/A'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
                                    <MapPin size={18} />
                                </div>
                                <div className="w-full">
                                    <p className="text-xs text-gray-400">Work Location</p>
                                    {isEditing ? (
                                        <input 
                                            type="text"
                                            value={editForm.location}
                                            onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-[#2C9DE6]"
                                            placeholder="Work Location"
                                        />
                                    ) : (
                                        <p className="font-medium text-sm">{employee.location || 'N/A'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
                                    <Users size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Gender</p>
                                    <p className="font-medium text-sm">{employee.gender || 'N/A'}</p>
                                </div>
                            </div>

                             <div className="flex items-center gap-3 text-gray-600">
                                <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
                                    <CalendarDays size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Date of Birth</p>
                                    <p className="font-medium text-sm">{employee.dateOfBirth || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
                                    <Calendar size={18} />
                                </div>
                                <div className="w-full">
                                    <p className="text-xs text-gray-400">Joining Date</p>
                                    {isEditing ? (
                                        <input 
                                            type="date"
                                            value={editForm.dateOfJoining}
                                            onChange={(e) => setEditForm({...editForm, dateOfJoining: e.target.value})}
                                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-[#2C9DE6]"
                                        />
                                    ) : (
                                        <p className="font-medium text-sm">{employee.dateOfJoining || 'N/A'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[#4E4E4E]">Assigned HR Manager</h3>
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <Users size={20} />
                            </div>
                        </div>
                        
                        {isEditing ? (
                            <div className="mt-2">
                                <label className="block text-xs text-gray-400 mb-1">Select HR Manager</label>
                                <select
                                    value={editForm.onboardingHrId}
                                    onChange={(e) => setEditForm({...editForm, onboardingHrId: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2C9DE6] bg-white"
                                >
                                    <option value="">-- No HR Assigned --</option>
                                    {hrAdmins.map(hr => (
                                        <option key={hr.id} value={hr.userId || hr.id}>
                                             {hr.firstName} {hr.lastName} ({hr.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            employee.assignedHR ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
                                        {employee.assignedHR.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{employee.assignedHR.name}</p>
                                        <p className="text-sm text-gray-500">{employee.assignedHR.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No HR Manager assigned.</p>
                            )
                        )}
                    </div>


             <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-bold text-[#4E4E4E]">Onboarding Progress</h3>
                     <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                         <CheckCircle size={20} /> 
                     </div>
                 </div>
                 <div className="text-gray-500 text-sm">
                     Current Stage: <span className="font-medium text-gray-800">{employee.onboardingStage || 'Not Started'}</span>
                     <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '40%' }}></div> {/* Dummy Progress */}
                    </div>
                    <p className="mt-2 text-xs">Steps completed: 2/5 (Estimated)</p>
                 </div>
             </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDetail;
