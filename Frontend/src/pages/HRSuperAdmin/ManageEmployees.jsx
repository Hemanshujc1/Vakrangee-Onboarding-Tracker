import React, { useState, useEffect } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { UserPlus, Search, Eye, Trash2, Download, Filter } from "lucide-react";
import AddEmployeeModal from "../../Components/Admin/AddEmployeeModal";
import Pagination from "../../Components/UI/Pagination";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getEmployeeStatus, getUniqueOptions } from "../../utils/employeeUtils";
import EmployeeFilters from "../../Components/Shared/EmployeeFilters";
import PageHeader from "../../Components/Shared/PageHeader";
import EmployeeTable from "../../Components/Shared/EmployeeTable";
import ExportModal from "../../Components/Shared/ExportModal";
import { useAlert } from "../../context/AlertContext";

const ManageEmployees = () => {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useAlert();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterJobTitle, setFilterJobTitle] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterAssignedHR, setFilterAssignedHR] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const itemsPerPage = 5;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      const token = userInfo ? JSON.parse(userInfo).token : localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = await axios.get("/api/employees", config);
      const strictEmployees = data.filter((emp) => emp.role === "EMPLOYEE");

      setEmployees(strictEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (formData) => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      const token = userInfo ? JSON.parse(userInfo).token : localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        username: formData.email,
        password: formData.password || "user@123",
        role: formData.role || "EMPLOYEE",
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        jobTitle: formData.jobTitle,
        location: formData.location,
        phone: formData.phone,
        startDate: formData.startDate,
        onboarding_hr_id: formData.onboarding_hr_id,
      };

      await axios.post("/api/auth/register", payload, config);
      await showAlert("Employee added successfully!", { type: 'success' });

      setIsModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error("Error adding employee:", error);
      await showAlert(error.response?.data?.message || "Failed to add employee.", { type: 'error' });
    }
  };

  // Extract Unique Options
  const departments = getUniqueOptions(employees, "department");
  const jobTitles = getUniqueOptions(employees, "jobTitle");
  const locations = getUniqueOptions(employees, "location");
  const uniqueHRs = [
    ...new Set(
      employees
        .map((emp) => emp.assignedHRName)
        .filter((name) => name && name !== "-")
    ),
  ].sort();
  const hasUnassigned = employees.some(
    (emp) => !emp.assignedHRName || emp.assignedHRName === "-"
  );
  const hrOptions = hasUnassigned ? ["Not Assigned", ...uniqueHRs] : uniqueHRs;
  const statuses = [
    "Login Pending",
    "Profile Pending",
    "In Progress",
    "Ready to Join",
    "Joining Formalities",
    "Completed",
    "Not Joined"
  ];

  // Filter & Pagination
  let filteredEmployees = employees.filter((emp) => {
    const statusText = getEmployeeStatus(emp);
    const matchesSearch =
      emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus ? statusText === filterStatus : true;
    const matchesDept = filterDepartment
      ? emp.department === filterDepartment
      : true;
    const matchesJob = filterJobTitle ? emp.jobTitle === filterJobTitle : true;
    const matchesLocation = filterLocation
      ? emp.location === filterLocation
      : true;

    let matchesHR = true;
    if (filterAssignedHR) {
      if (filterAssignedHR === "Not Assigned") {
        matchesHR = !emp.assignedHRName || emp.assignedHRName === "-";
      } else {
        matchesHR = emp.assignedHRName === filterAssignedHR;
      }
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDept &&
      matchesJob &&
      matchesLocation &&
      matchesHR
    );
  });

  // Apply Sorting
  filteredEmployees.sort((a, b) => {
      // 1. Primary Sort: "Not Joined" to bottom
      const statusA = getEmployeeStatus(a);
      const statusB = getEmployeeStatus(b);
      
      if (statusA === 'Not Joined' && statusB !== 'Not Joined') return 1;
      if (statusA !== 'Not Joined' && statusB === 'Not Joined') return -1;

      // 2. Secondary Sort: User Config
      if (sortConfig.key) {
        let aValue, bValue;
        if (sortConfig.key === "dateOfJoining") {
            aValue = new Date(a.dateOfJoining || 0);
            bValue = new Date(b.dateOfJoining || 0);
        } else {
            aValue = a[sortConfig.key] || "";
            bValue = b[sortConfig.key] || "";
        }
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
  });

  const totalItems = filteredEmployees.length;
  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Manage Employees"
        subtitle="View and manage all employees in the system."
        actionLabel="Add New Employee"
        onAction={() => setIsModalOpen(true)}
        ActionIcon={UserPlus}
      >
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-all font-medium cursor-pointer shadow-sm"
        >
          <Download size={20} />
          <span>Export</span>
        </button>
      </PageHeader>

      {/* Sidebar Drawer */}
      <EmployeeFilters
        filters={{
          status: filterStatus,
          setStatus: setFilterStatus,
          department: filterDepartment,
          setDepartment: setFilterDepartment,
          jobTitle: filterJobTitle,
          setJobTitle: setFilterJobTitle,
          location: filterLocation,
          setLocation: setFilterLocation,
          assignedHR: filterAssignedHR,
          setAssignedHR: setFilterAssignedHR,
          resetFilters: () => {
            setFilterStatus("");
            setFilterDepartment("");
            setFilterJobTitle("");
            setFilterLocation("");
            setFilterAssignedHR("");
            setSearchTerm("");
            setSortConfig({ key: null, direction: "asc" });
          },
        }}
        options={{ statuses, departments, jobTitles, locations, hrOptions }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="w-full">
        {/* Top Bar: Search & Sort */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-primary)"
            />
          </div>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 text-gray-700 font-medium border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 w-full sm:w-auto justify-center transition-colors"
          >
            <Filter size={18} />
            {/* <span>Filters</span> */}
          </button>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-500 whitespace-nowrap hidden sm:inline">
              Sort by:
            </span>
            <select
              value={
                sortConfig.key
                  ? `${sortConfig.key}-${sortConfig.direction}`
                  : ""
              }
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  setSortConfig({ key: null, direction: "asc" });
                } else {
                  const [key, direction] = val.split("-");
                  setSortConfig({ key, direction });
                }
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-(--color-primary) bg-white w-full sm:w-48 cursor-pointer"
            >
              <option value="">Default</option>
              <option value="dateOfJoining-asc">
                Joining Date: Oldest First
              </option>
              <option value="dateOfJoining-desc">
                Joining Date: Newest First
              </option>
            </select>
          </div>
        </div>

        {totalItems > 0 && (
          <div className="mb-6">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading employees...
          </div>
        ) : (
          <EmployeeTable
            employees={currentEmployees}
            onRowClick={(emp) =>
              navigate(`/hr-super-admin/employees/${emp.id}`)
            }
            onDelete={async (emp) => {
                const isConfirmed = await showConfirm(`Are you sure you want to remove ${emp.firstName} ${emp.lastName}? This will mark them as 'Not Joined'.`, { type: 'warning' });
                if(isConfirmed) {
                    try {
                        const userInfo = localStorage.getItem("userInfo");
                        const token = userInfo ? JSON.parse(userInfo).token : localStorage.getItem("token");
                        const config = { headers: { Authorization: `Bearer ${token}` } };
                        await axios.delete(`/api/employees/${emp.id}`, config);
                        
                        // Optimistic update
                        setEmployees(prev => prev.map(p => 
                            p.id === emp.id ? { ...p, onboarding_stage: 'Not_joined', accountStatus: 'Inactive' } : p
                        ));
                        await showAlert("Employee removed successfully.", { type: 'success' });
                    } catch (err) {
                        console.error("Delete failed", err);
                        await showAlert("Failed to delete employee", { type: 'error' });
                    }
                }
            }}
          />
        )}
      </div>

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddEmployee}
        type="employee"
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={employees.map((emp) => ({
          ...emp,
          status: getEmployeeStatus(emp),
        }))}
        fileName="Employees_List"
        formatOptions={{
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email",
          phone: "Phone",
          department: "Department",
          jobTitle: "Job Title",
          location: "Location",
          dateOfJoining: "Joining Date",
          status: "Status",
          // role: "Role",
          assignedHRName: "HR Assigned",
        }}
        options={{ hrOptions, statuses }}
      />
    </DashboardLayout>
  );
};

export default ManageEmployees;
