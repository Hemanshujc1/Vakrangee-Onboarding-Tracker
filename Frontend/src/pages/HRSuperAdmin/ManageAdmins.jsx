import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import { UserCog, Search, Eye, Trash2, MoreVertical } from 'lucide-react';
import AddAdminModal from '../../Components/Admin/AddAdminModal';
import Pagination from '../../Components/UI/Pagination';
import axios from 'axios';

const ManageAdmins = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      const token = userInfo ? JSON.parse(userInfo).token : null;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const { data } = await axios.get("/api/employees", config);
      const adminRoles = ['admin', 'HR_ADMIN', 'HR_SUPER_ADMIN'];
      const filteredAdmins = data.filter(emp => adminRoles.includes(emp.role) || adminRoles.includes(emp.jobTitle)); // jobTitle fallback?

      const strictAdmins = data.filter(emp => 
          ['HR_ADMIN', 'HR_SUPER_ADMIN', 'ADMIN'].includes(emp.role)
      );
      
      setAdmins(strictAdmins);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleAddAdmin = async (formData) => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      const token = userInfo ? JSON.parse(userInfo).token : null;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        username: formData.email,
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        jobTitle: formData.jobTitle,
        location: formData.location,
        phone: formData.phone,
        startDate: formData.startDate
      };

      await axios.post('/api/auth/register', payload, config);
      alert('Admin added successfully!');
      setIsModalOpen(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      alert(error.response?.data?.message || 'Failed to add admin');
    }
  };

  const filteredAdmins = admins.filter(admin => 
    admin.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredAdmins.length;
  const currentAdmins = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <DashboardLayout>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-(--color-text-dark)">Manage HR Admins</h1>
          <p className="text-gray-500 mt-2">Oversee HR Administrators and their assignments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-(--color-secondary) text-white px-5 py-2.5 rounded-lg hover:brightness-110 transition-all font-medium cursor-pointer shadow-sm"
        >
          <UserCog size={20} />
          <span>Add HR Admin</span>
        </button>
      </header>

       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Search admins by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-accent-green)"
            />
        </div>
      </div>

      {loading ? (
          <div className="text-center py-10 text-gray-500">Loading admins...</div>
      ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Profile</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Title</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Onboarded</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Assigned</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentAdmins.length > 0 ? (
                      currentAdmins.map((admin) => (
                          <tr 
                            key={admin.id} 
                            onClick={() => window.location.href = `/hr-super-admin/admins/${admin.id}`}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-4">
                              {admin.profilePhoto ? (
                                <img 
                                  src={admin.profilePhoto} 
                                  alt={admin.firstName} 
                                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-(--color-secondary) text-white flex items-center justify-center font-bold text-sm uppercase">
                                  {admin.firstName?.[0]}{admin.lastName?.[0]}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {admin.firstName} {admin.lastName}
                              <div className="text-xs text-gray-400 font-normal">{admin.email}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{admin.jobTitle || admin.role}</td>
                            <td className="px-6 py-4 text-gray-600">{admin.department || 'N/A'}</td>
                            <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-s font-medium bg-green-100 text-green-800">
                                    {admin.onboardedCount || 0}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-s font-medium bg-blue-100 text-blue-800">
                                    {admin.assignedCount || 0}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.location.href = `/hr-super-admin/admins/${admin.id}`;
                                        }}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                        title="View Details"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            //  delete logic 
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                        title="Delete Admin"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                          </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          No admins found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalItems > 0 && (
                <div className="mt-6">
                    <Pagination 
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
          </>
      )}

      <AddAdminModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddAdmin} 
      />
    </DashboardLayout>
  );
};

export default ManageAdmins;
