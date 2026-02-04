import React, { useState } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { Search, Filter } from "lucide-react";
import Pagination from "../../Components/UI/Pagination";
import EmployeeFilters from "./EmployeeFilters";
import PageHeader from "./PageHeader";
import EmployeeTable from "./EmployeeTable";

const EmployeeManagementPage = ({
  // Page Header Props
  title,
  subtitle,
  actionLabel,
  onAction,
  ActionIcon,
  headerChildren,

  // Hook Data (from useEmployeeList)
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

  // Table Props
  onRowClick,
  onDelete,
  onActivate,
  emptyMessage = "No employees found.",
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <DashboardLayout>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actionLabel={actionLabel}
        onAction={onAction}
        ActionIcon={ActionIcon}
      >
        {headerChildren}
      </PageHeader>

      {/* Sidebar Drawer */}
      <EmployeeFilters
        filters={{
          status: filters?.status,
          setStatus: (val) => updateFilter('status', val),
          department: filters?.department,
          setDepartment: (val) => updateFilter('department', val),
          jobTitle: filters?.jobTitle,
          setJobTitle: (val) => updateFilter('jobTitle', val),
          location: filters?.location,
          setLocation: (val) => updateFilter('location', val),
          assignedHR: filters?.assignedHR,
          setAssignedHR: (val) => updateFilter('assignedHR', val),
          resetFilters: resetFilters,
        }}
        options={options}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
      />

      {/* Main Content */}
      <div className="w-full">
        {/* Top Bar: Search & Sort */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-row sm:flex-row gap-4 justify-between items-center">
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
            className="flex items-center gap-2 text-gray-700 font-medium border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 w-fit sm:w-auto justify-center transition-colors"
          >
            <Filter size={18} />
          </button>
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
          <div className="text-center py-10 text-gray-500">Loading employees...</div>
        ) : (
          <EmployeeTable
            employees={currentEmployees}
            onRowClick={onRowClick}
            onActivate={onActivate}
            onDelete={onDelete}
            emptyMessage={emptyMessage}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeManagementPage;
