import React, { useState } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { Search, Download, Filter } from "lucide-react";
import Pagination from "../../Components/UI/Pagination";
import { useNavigate } from "react-router-dom";
import { getEmployeeStatus } from "../../utils/employeeUtils";
import EmployeeFilters from "../../Components/Shared/EmployeeFilters";
import PageHeader from "../../Components/Shared/PageHeader";
import EmployeeTable from "../../Components/Shared/EmployeeTable";
import ExportModal from "../../Components/Shared/ExportModal";
import useEmployeeList from "../../hooks/useEmployeeList";

const MyEmployees = () => {
  const navigate = useNavigate();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
      employees,
      currentEmployees,
      totalItems,
      loading,
      options,
      searchTerm,
      setSearchTerm,
      currentPage,
      setCurrentPage,
      sortConfig,
      setSortConfig,
      filters,
      updateFilter,
      resetFilters,
      handleDelete,
      handleActivate
  } = useEmployeeList({
      filterPredicate: (emp, user) => {
        return emp.role === "EMPLOYEE" && emp.onboardingHrId == user.id;
      },
      itemsPerPage: 5
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="My Employees"
        subtitle={
          <>
            Track and manage onboarding for employees assigned to you.
            <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
              (Your HR ID: {JSON.parse(localStorage.getItem("user"))?.id || "?"}
              )
            </span>
          </>
        }
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
          status: filters.status,
          setStatus: (val) => updateFilter('status', val),
          department: filters.department,
          setDepartment: (val) => updateFilter('department', val),
          jobTitle: filters.jobTitle,
          setJobTitle: (val) => updateFilter('jobTitle', val),
          location: filters.location,
          setLocation: (val) => updateFilter('location', val),
          assignedHR: filters.assignedHR,
          setAssignedHR: (val) => updateFilter('assignedHR', val),
          resetFilters: resetFilters,
        }}
        options={options}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="w-full">
        {/* Top Bar */}
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
              itemsPerPage={5}
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
            onDelete={handleDelete}
            onActivate={handleActivate}
            emptyMessage="No employees found assigned to your ID."
          />
        )}
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={employees.map((emp) => ({
          ...emp,
          status: getEmployeeStatus(emp),
        }))}
        fileName="My_Employees_List"
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
          // role: "Role"
        }}
        options={options}
      />
    </DashboardLayout>
  );
};

export default MyEmployees;
