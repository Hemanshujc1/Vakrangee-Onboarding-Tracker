import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import {
  UserCog,
  Search,
  Download,
  Filter,
} from "lucide-react";
import AddAdminModal from "../../Components/Admin/AddAdminModal";
import PageHeader from "../../Components/Shared/PageHeader";
import Pagination from "../../Components/UI/Pagination";
import EmployeeFilters from "../../Components/Shared/EmployeeFilters";
import ExportModal from "../../Components/Shared/ExportModal";
import AdminTable from "../../Components/Admin/AdminTable";
import { useManageAdmins } from "./hooks/useManageAdmins";

const ManageAdmins = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    admins,
    loading,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    filterJobTitle,
    setFilterJobTitle,
    filterLocation,
    setFilterLocation,
    filterStatus,
    setFilterStatus,
    sortConfig,
    setSortConfig,
    itemsPerPage,
    handleAddAdmin,
    handleActivateAdmin,
    handleDeleteAdmin,
    jobTitles,
    locations,
    statuses,
    totalItems,
    currentAdmins,
  } = useManageAdmins();

  return (
    <DashboardLayout>
      <PageHeader
        title="Manage Admins"
        subtitle="Oversee HR Administrators and their assignments."
        actionLabel="Add HR Admin"
        onAction={() => setIsModalOpen(true)}
        ActionIcon={UserCog}
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
          jobTitle: filterJobTitle,
          setJobTitle: setFilterJobTitle,
          location: filterLocation,
          setLocation: setFilterLocation,
          status: filterStatus,
          setStatus: setFilterStatus,
          resetFilters: () => {
            setFilterJobTitle("");
            setFilterLocation("");
            setFilterStatus("");
            setSearchTerm("");
            setSortConfig({ key: null, direction: "asc" });
          },
        }}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        options={{ jobTitles, locations, statuses }}
        showStatus={true}
        showDepartment={false}
        showSortWithJoinDate={false}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        customSortOptions={[
          { label: "Default", value: "" },
          { label: "Onboarded: Low to High", value: "onboardedCount-asc" },
          { label: "Onboarded: High to Low", value: "onboardedCount-desc" },
          { label: "Assigned: Low to High", value: "assignedCount-asc" },
          { label: "Assigned: High to Low", value: "assignedCount-desc" },
        ]}
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
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-accent-green)"
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
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading admins...
          </div>
        ) : (
          <AdminTable 
            currentAdmins={currentAdmins}
            handleActivateAdmin={handleActivateAdmin}
            handleDeleteAdmin={handleDeleteAdmin}
            navigate={navigate}
          />
        )}
      </div>
      <AddAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(data) => handleAddAdmin(data, setIsModalOpen)}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filterProps={{
          showStatus: true,
          showDepartment: false,
          showSortWithJoinDate: false,
        }}
        options={{ statuses }}
        data={admins}
        fileName="Admins_List"
        formatOptions={{
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email",
          jobTitle: "Job Title",
          location: "Location",
          band: "Band",
          level: "Level",
          onboardedCount: "Onboarded Count",
          assignedCount: "Assigned Count",
          notJoinedCount: "Not Joined Count",
          accountStatus: "Status",
        }}
      />
    </DashboardLayout>
  );
};

export default ManageAdmins;
