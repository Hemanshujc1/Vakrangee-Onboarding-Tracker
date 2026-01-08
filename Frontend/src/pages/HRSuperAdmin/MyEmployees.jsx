import DashboardLayout from "../../Components/Layout/DashboardLayout";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {Search, Filter, Eye, Trash2 } from 'lucide-react';
import Pagination from '../../Components/UI/Pagination';
import axios from 'axios';

const MyEmployees = () => {
      const navigate = useNavigate();
      const [employees, setEmployees] = useState([]);
      const [loading, setLoading] = useState(true);
      const [currentPage, setCurrentPage] = useState(1);
      const [searchTerm, setSearchTerm] = useState("");
      const itemsPerPage = 5;


    useEffect(() => {
        fetchEmployees();
      }, []);
    
      const fetchEmployees = async () => {
        try {
          const token = localStorage.getItem('token');
          const userStr = localStorage.getItem('user');
          const config = { headers: { Authorization: `Bearer ${token}` } };
    
          const { data } = await axios.get("/api/employees", config);
          
          let userId = null;
          if (userStr) {
              const parsedUser = JSON.parse(userStr);
              userId = parsedUser.id; 
          }
          
          const strictEmployees = data.filter(emp => {
              const isEmployeeRole = emp.role === 'EMPLOYEE';
              const hrId = emp.onboardingHrId;
              
              const isAssignedToMe = hrId == userId; 
              
              return isEmployeeRole && isAssignedToMe;
          });
          
          setEmployees(strictEmployees);
        } catch (error) {
          console.error("Error fetching employees:", error);
        } finally {
            setLoading(false);
        }
      };
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredEmployees.length;
  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-text-dark)">
          My Employees
        </h1>
        <p className="text-gray-500 mt-2">
          Track and manage onboarding for employees assigned to you. 
          {/* Debug Info */}
          <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
             (Your HR ID: {JSON.parse(localStorage.getItem("user"))?.id || '?'})
          </span>
        </p>
      </header>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search employees by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
          <Filter size={20} />
          <span>Filters</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading employees...
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Profile
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Joining Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentEmployees.length > 0 ? (
                    currentEmployees.map((emp) => {
                      let statusText = "Unknown";
                      let statusColor = "bg-gray-100 text-gray-600";

                      if (!emp.firstLoginAt && !emp.lastLoginAt) {
                        statusText = "Login Pending";
                        statusColor = "bg-orange-100 text-orange-600";
                      } else {
                        switch (emp.onboarding_stage) {
                          case "BASIC_INFO":
                            statusText = "Profile Pending";
                            statusColor = "bg-yellow-100 text-yellow-600";
                            break;
                          case "PRE_JOINING":
                            statusText = "In Progress";
                            statusColor = "bg-blue-100 text-blue-600";
                            break;
                          case "PRE_JOINING_VERIFIED":
                            statusText = "Ready to Join";
                            statusColor = "bg-green-100 text-green-600";
                            break;
                          case "POST_JOINING":
                            statusText = "Joining Formalities";
                            statusColor = "bg-purple-100 text-purple-600";
                            break;
                          case "ACTIVE":
                            statusText = "Completed";
                            statusColor = "bg-emerald-100 text-emerald-600";
                            break;
                          default:
                            statusText = emp.onboarding_stage;
                        }
                      }

                      return (
                        <tr
                          key={emp.id}
                          onClick={() => navigate(`/hr-super-admin/employees/${emp.id}`)}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            {emp.profilePhoto ? (
                              <img
                                src={emp.profilePhoto}
                                alt={emp.firstName}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm uppercase">
                                {emp.firstName?.[0]}
                                {emp.lastName?.[0]}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {emp.firstName} {emp.lastName}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {emp.jobTitle || "-"}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {emp.department || "-"}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {emp.dateOfJoining || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                            >
                              {statusText}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/hr-super-admin/employees/${emp.id}`;
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
                                title="Delete Employee"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                         No employees found assigned to your ID.
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
    </DashboardLayout>
  );
};

export default MyEmployees;
