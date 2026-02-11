import React from "react";
import { Search, Filter, Download } from "lucide-react";
import EmployeeTable from "../../../Components/Shared/EmployeeTable";

const AdminAssignedEmployees = ({
  searchTerm,
  setSearchTerm,
  setIsSidebarOpen,
  setIsExportModalOpen,
  filteredEmployees,
  assignedEmployeesLength,
  onRowClick,
  onActivate,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 mb-4">
        <h3 className="text-lg font-bold text-[#4E4E4E]">Assigned Employees</h3>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2C9DE6]"
            />
          </div>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-[#2C9DE6] bg-white border border-gray-200 hover:border-[#2C9DE6] rounded-lg transition-all"
            title="Filter"
          >
            <Filter size={18} />
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="p-2 text-gray-600 hover:text-[#2C9DE6] bg-white border border-gray-200 hover:border-[#2C9DE6] rounded-lg transition-all"
            title="Export"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <EmployeeTable
        employees={filteredEmployees}
        onRowClick={onRowClick}
        showAssignedDate={true}
        emptyMessage={
          assignedEmployeesLength === 0
            ? "No employees assigned to this admin yet."
            : "No employees match your search."
        }
        onActivate={onActivate}
        onDelete={onDelete}
      />
    </div>
  );
};

export default AdminAssignedEmployees;
