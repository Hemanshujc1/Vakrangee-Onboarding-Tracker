import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import { Mail, Phone, MapPin, Building, Briefcase, Calendar, ArrowLeft, Users, CheckCircle, Clock, Eye, Trash2, Pencil } from 'lucide-react';
import axios from 'axios';

const AdminDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
      location: '',
      jobTitle: '',
      department: ''
  });

  useEffect(() => {
    fetchAdminDetails();
  }, [id]);

  const fetchAdminDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`/api/employees/${id}`, config);
      setAdmin(data);
      setEditForm({
          location: data.location || '',
          jobTitle: data.jobTitle || '',
          department: data.department || ''
      });
    } catch (error) {
      console.error("Error fetching admin details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
      try {
          const token = localStorage.getItem('token');
          const config = { headers: { Authorization: `Bearer ${token}` } };
          
          await axios.put(`/api/employees/${id}`, editForm, config);
          
          // Re-fetch to get updated data cleanly
          fetchAdminDetails(); 
          setIsEditing(false);
      } catch (error) {
          console.error("Error updating admin details:", error);
          alert("Failed to update details.");
      }
  };

  if (loading) return <DashboardLayout><div className="p-10 text-center text-gray-500">Loading profile...</div></DashboardLayout>;
  if (!admin) return <DashboardLayout><div className="p-10 text-center text-gray-500">Admin not found.</div></DashboardLayout>;

    const getStatusBadge = (stage, firstLogin, lastLogin) => {
        let statusText = "Unknown";
        let statusColor = "bg-gray-100 text-gray-600";
    
        if (!firstLogin && !lastLogin) {
            statusText = "Login Pending";
            statusColor = "bg-orange-100 text-orange-600";
        } else {
            switch (stage) {
                case "BASIC_INFO": statusText = "Profile Pending"; statusColor = "bg-yellow-100 text-yellow-600"; break;
                case "PRE_JOINING": statusText = "In Progress"; statusColor = "bg-blue-100 text-blue-600"; break;
                case "PRE_JOINING_VERIFIED": statusText = "Ready to Join"; statusColor = "bg-green-100 text-green-600"; break;
                case "POST_JOINING": statusText = "Joining Formalities"; statusColor = "bg-purple-100 text-purple-600"; break;
                case "ACTIVE": statusText = "Completed"; statusColor = "bg-emerald-100 text-emerald-600"; break;
                default: statusText = stage || "N/A";
            }
        }
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>{statusText}</span>;
    };


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header / Back Button */}
        <div>
           <button 
             onClick={() => navigate(-1)}
             className="flex items-center gap-2 text-gray-500 hover:text-[#2C9DE6] transition-colors mb-4"
           >
             <ArrowLeft size={20} />
             <span>Back to Admins</span>
           </button>
           <h1 className="text-3xl font-bold text-[#4E4E4E]">Admin Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="h-32 bg-linear-to-r from-[#2C9DE6] to-[#205081]"></div>
             <div className="px-8 pb-8">
                 <div className="relative flex justify-between items-end -mt-12 mb-6">
                     <div className="flex items-end gap-6">
                         <div className="relative">
                             {admin.profilePhoto ? (
                                 <img 
                                     src={admin.profilePhoto} 
                                     alt={admin.firstName} 
                                     className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                                 />
                             ) : (
                                 <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center text-4xl font-bold text-[#2C9DE6]">
                                     {admin.firstName?.[0]}
                                 </div>
                             )}
                         </div>
                         <div className="mb-2">
                             <h2 className="text-2xl font-bold text-[#4E4E4E]">{admin.firstName} {admin.lastName}</h2>
                             <div className="text-[#2C9DE6] font-medium flex items-center gap-2">
                                <Briefcase size={16} />
                                {isEditing ? (
                                     <input 
                                         type="text" 
                                         value={editForm.jobTitle} 
                                         onChange={(e) => setEditForm({...editForm, jobTitle: e.target.value})}
                                         className="border border-blue-200 rounded px-2 py-1 text-sm text-[#2C9DE6] font-medium focus:outline-none focus:border-[#2C9DE6] w-full"
                                     />
                                ) : (
                                    <span>{admin.jobTitle || admin.role}</span>
                                )}
                             </div>
                         </div>
                     </div>
                     <button 
                        onClick={() => setIsEditing(!isEditing)} 
                        className="mb-2 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                        title="Edit Details"
                     >
                        <Pencil size={18} />
                     </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="flex items-center gap-3 text-gray-600">
                         <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
                             <Mail size={18} />
                         </div>
                         <div>
                             <p className="text-xs text-gray-400">Company Email</p>
                             <p className="font-medium text-sm">{admin.email}</p>
                         </div>
                     </div>
                     <div className="flex items-center gap-3 text-gray-600">
                         <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
                             <Phone size={18} />
                         </div>
                         <div>
                             <p className="text-xs text-gray-400">Phone</p>
                             <p className="font-medium text-sm">{admin.phone || 'N/A'}</p>
                         </div>
                     </div>
                     <div className="flex items-center gap-3 text-gray-600">
                         <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
                             <Building size={18} />
                         </div>
                         <div>
                             <p className="text-xs text-gray-400">Department</p>
                             {isEditing ? (
                                 <input 
                                     type="text" 
                                     value={editForm.department} 
                                     onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                                     className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-[#2C9DE6]"
                                 />
                             ) : (
                                 <p className="font-medium text-sm">{admin.department || 'N/A'}</p>
                             )}
                         </div>
                     </div>
                      <div className="flex items-center gap-3 text-gray-600">
                         <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
                             <MapPin size={18} />
                         </div>
                         <div>
                             <p className="text-xs text-gray-400">Location</p>
                             {isEditing ? (
                                 <input 
                                     type="text" 
                                     value={editForm.location} 
                                     onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                     className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-[#2C9DE6]"
                                 />
                             ) : (
                                 <p className="font-medium text-sm">{admin.location || 'N/A'}</p>
                             )}
                         </div>
                     </div>
                     {isEditing && (
                         <div className="flex items-center gap-3 col-span-1 md:col-span-3 justify-end mt-4 border-t pt-4">
                             <button 
                                 onClick={() => {
                                     setIsEditing(false);
                                     setEditForm({
                                         location: admin.location || '',
                                         jobTitle: admin.jobTitle || '',
                                         department: admin.department || ''
                                     });
                                 }}
                                 className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                             >
                                 Cancel
                             </button>
                             <button 
                                 onClick={handleSave}
                                 className="px-4 py-2 bg-[#2C9DE6] hover:bg-[#205081] text-white rounded-lg text-sm font-medium"
                             >
                                 Save Changes
                             </button>
                         </div>
                     )}
                     {!isEditing && (
                        <div className="flex items-center gap-3 text-gray-600">
                            <div className="p-2 bg-[#2C9DE6]/10 rounded-lg text-[#2C9DE6]">
                                <Users size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Gender</p>
                                <p className="font-medium text-sm">{admin.gender || 'N/A'}</p>
                            </div>
                        </div>
                     )}
                 </div>
             </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 font-medium">Assigned Employees</h3>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Users size={20} />
                    </div>
                </div>
                <p className="text-3xl font-bold text-[#4E4E4E]">{admin.stats?.totalAssigned || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 font-medium">Onboarding Active</h3>
                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                        <Clock size={20} />
                    </div>
                </div>
                <p className="text-3xl font-bold text-[#4E4E4E]">{admin.stats?.activeOnboarding || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 font-medium">Fully Onboarded</h3>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <CheckCircle size={20} />
                    </div>
                </div>
                <p className="text-3xl font-bold text-[#4E4E4E]">{admin.stats?.completed || 0}</p>
            </div>
        </div>

        {/* Assigned Employees List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100">
                 <h3 className="text-lg font-bold text-[#4E4E4E]">Assigned Employees</h3>
             </div>
             {admin.assignedEmployees && admin.assignedEmployees.length > 0 ? (
                 <div className="overflow-x-auto">
                     <table className="w-full text-left">
                         <thead className="bg-gray-50">
                             <tr>
                                 <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Profile</th>
                                 <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                 <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Job Title</th>
                                 <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                                 <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Joining Date</th>
                                 <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                 <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                             {admin.assignedEmployees.map((emp) => (
                                 <tr 
                                 key={emp.id} 
                                 onClick={() => navigate(`/hr-super-admin/employees/${emp.id}`)}
                                 className="hover:bg-gray-5 cursor-pointer"
                                >
                                     <td className="px-6 py-4">
                                         {emp.profilePhoto ? (
                                             <img src={emp.profilePhoto} alt="" className="w-8 h-8 rounded-full object-cover"/>
                                         ) : (
                                             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                 {emp.name[0]}
                                             </div>
                                         )}
                                     </td>
                                     <td className="px-6 py-4 font-medium text-gray-900">{emp.name}</td>
                                     <td className="px-6 py-4 text-gray-600 text-sm">{emp.jobTitle || '-'}</td>
                                     <td className="px-6 py-4 text-gray-600 text-sm">{emp.department || '-'}</td>
                                     <td className="px-6 py-4 text-gray-600 text-sm">{emp.joiningDate || '-'}</td>
                                     <td className="px-6 py-4">
                                         {getStatusBadge(emp.stage, emp.firstLoginAt, emp.lastLoginAt)}
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                         <div className="flex items-center justify-end gap-2">
                                             <button 
                                                 className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                             >
                                                 <Eye size={18} />
                                             </button>
                                             <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                 <Trash2 size={18} />
                                             </button>
                                         </div>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             ) : (
                 <div className="p-10 text-center text-gray-500">
                     No employees assigned to this admin yet.
                 </div>
             )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDetail;
