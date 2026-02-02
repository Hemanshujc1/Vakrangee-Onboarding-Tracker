import React, { useState, useEffect } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import {
  UserCog,
  Search,
  Trash2,
  Download,
  Filter,
  RotateCcw,
} from "lucide-react";
import AddAdminModal from "../../Components/Admin/AddAdminModal";
import PageHeader from "../../Components/Shared/PageHeader";
import Pagination from "../../Components/UI/Pagination";
import axios from "axios";
import { getUniqueOptions } from "../../utils/employeeUtils";
import EmployeeFilters from "../../Components/Shared/EmployeeFilters";
import ExportModal from "../../Components/Shared/ExportModal";
import { useAlert } from "../../context/AlertContext";

const ManageAdmins = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showAlert, showConfirm } = useAlert();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJobTitle, setFilterJobTitle] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      const token = userInfo
        ? JSON.parse(userInfo).token
        : localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = await axios.get("/api/employees", config);

      const strictAdmins = data.filter((emp) =>
        ["HR_ADMIN", "HR_SUPER_ADMIN", "ADMIN"].includes(emp.role)
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
      const token = userInfo
        ? JSON.parse(userInfo).token
        : localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        username: formData.email,
        password: formData.password || "admin@123",
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        jobTitle: formData.jobTitle,
        location: formData.location,
        phone: formData.phone,
        startDate: formData.startDate,
      };

      await axios.post("/api/auth/register", payload, config);
      await showAlert("Admin added successfully!", { type: 'success' });
      setIsModalOpen(false);
      fetchAdmins();
    } catch (error) {
      console.error("Error adding admin:", error);
      await showAlert(error.response?.data?.message || "Failed to add admin", { type: 'error' });
    }
  };

  const handleActivateAdmin = async (id) => {
    const isConfirmed = await showConfirm(
      "Are you sure you want to activate this admin?",
      { type: 'info' }
    );
    if (!isConfirmed) return;

    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const token = userInfoStr
        ? JSON.parse(userInfoStr).token
        : localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.put(
        `/api/employees/${id}`,
        {
          accountStatus: "INVITED",
          onboarding_stage: "BASIC_INFO",
          firstLoginAt: null,
          lastLoginAt: null,
        },
        config
      );

      // Optimistic update
      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id === id
            ? {
                ...admin,
                accountStatus: "INVITED",
                onboarding_stage: "BASIC_INFO",
                firstLoginAt: null,
                lastLoginAt: null,
              }
            : admin
        )
      );

      await showAlert("Admin activated successfully!", { type: 'success' });
    } catch (error) {
      console.error("Error activating admin:", error);
      await showAlert("Failed to activate admin", { type: 'error' });
    }
  };

  const handleDeleteAdmin = async (id) => {
    const isConfirmed = await showConfirm("Are you sure you want to deactivate this admin?", { type: 'warning' });
    if (!isConfirmed) return;

    try {
      const userInfoStr = localStorage.getItem("userInfo");
      let token = userInfoStr
        ? JSON.parse(userInfoStr).token
        : localStorage.getItem("token");

      if (!token) {
        await showAlert("Authentication error: No token found. Please login again.", { type: 'error' });
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.delete(`/api/employees/${id}`, config);

      // Optimistic update
      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id === id ? { ...admin, accountStatus: "Inactive" } : admin
        )
      );

      await showAlert("Admin deactivated successfully", { type: 'success' });
    } catch (error) {
      console.error("Error deleting admin:", error);
      if (error.response && error.response.status === 403) {
        await showAlert(error.response.data.message || "Unauthorized action.", { type: 'error' });
      } else {
        await showAlert("Failed to delete admin. See console for details.", { type: 'error' });
      }
    }
  };

  // Extract Unique Options
  const jobTitles = getUniqueOptions(admins, "jobTitle");
  const locations = getUniqueOptions(admins, "location");
  const statuses = ["ACTIVE", "Inactive", "INVITED"];

  // Filter & Pagination
  let filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesJob = filterJobTitle
      ? admin.jobTitle === filterJobTitle
      : true;
    const matchesLocation = filterLocation
      ? admin.location === filterLocation
      : true;
    const matchesStatus = filterStatus
      ? (admin.accountStatus || "ACTIVE") === filterStatus
      : true;

    return matchesSearch && matchesJob && matchesLocation && matchesStatus;
  });

  // Apply Sorting - Inactive Last by default, unless specific sort overrides
  filteredAdmins.sort((a, b) => {
    // 1. Primary Sort: Inactive to bottom
    const statusA = a.accountStatus || "ACTIVE";
    const statusB = b.accountStatus || "ACTIVE";

    if (statusA === "Inactive" && statusB !== "Inactive") return 1;
    if (statusA !== "Inactive" && statusB === "Inactive") return -1;

    // 2. Secondary Sort: User Selected Config
    if (sortConfig.key) {
      let aValue, bValue;
      if (sortConfig.key === "onboardedCount") {
        aValue = a.onboardedCount || 0;
        bValue = b.onboardedCount || 0;
      } else if (sortConfig.key === "assignedCount") {
        aValue = a.assignedCount || 0;
        bValue = b.assignedCount || 0;
      } else {
        aValue = a[sortConfig.key] || "";
        bValue = b[sortConfig.key] || "";
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const totalItems = filteredAdmins.length;
  const currentAdmins = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          sortConfig,
          setSortConfig,
          resetFilters: () => {
            setFilterJobTitle("");
            setFilterLocation("");
            setFilterStatus("");
            setSearchTerm("");
            setSortConfig({ key: null, direction: "asc" });
          },
        }}
        options={{ jobTitles, locations, statuses }}
        showStatus={true}
        showDepartment={false}
        showSortWithJoinDate={false}
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
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-(--color-accent-green)"
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
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-(--color-accent-green) bg-white w-full sm:w-48 cursor-pointer"
            >
              <option value="">Default</option>
              <option value="onboardedCount-asc">Onboarded: Low to High</option>
              <option value="onboardedCount-desc">
                Onboarded: High to Low
              </option>
              <option value="assignedCount-asc">Assigned: Low to High</option>
              <option value="assignedCount-desc">Assigned: High to Low</option>
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
            Loading admins...
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-center text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Admins
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                        Assigned
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                        Onboarded
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                        Not Joined
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentAdmins.length > 0 ? (
                      currentAdmins.map((admin) => (
                        <tr
                          key={admin.id}
                          onClick={() =>
                            (window.location.href = `/hr-super-admin/admins/${admin.id}`)
                          }
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-2 flex flex-col items-center gap-1">
                            {admin.profilePhoto ? (
                              <img
                                src={admin.profilePhoto}
                                alt={admin.firstName}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-(--color-secondary) text-white flex items-center justify-center font-bold text-sm uppercase">
                                {admin.firstName?.[0]}
                                {admin.lastName?.[0]}
                              </div>
                            )}{" "}
                            <div className="font-normal text-gray-900">
                              {admin.firstName} {admin.lastName}
                              <div className="text-xs text-gray-400 font-normal">
                                {admin.email}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {admin.jobTitle || admin.role}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {admin.location || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                admin.accountStatus === "Inactive"
                                  ? "bg-red-100 text-red-800"
                                  : admin.accountStatus === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {admin.accountStatus || "ACTIVE"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-s font-medium bg-blue-100 text-blue-800">
                              {admin.assignedCount || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-s font-medium bg-green-100 text-green-800">
                              {admin.onboardedCount || 0}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-s font-medium bg-gray-600 text-gray-100">
                              {admin.notJoinedCount || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                {(admin.accountStatus === 'Inactive' || admin.accountStatus === 'Not Joined') ? (
                                <button
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    handleActivateAdmin(admin.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Activate Admin"
                                >
                                    <RotateCcw size={18} />
                                </button>
                                ) : (
                                    <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteAdmin(admin.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Deactivate Admin"
                                    >
                                    <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No admins found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <AddAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddAdmin}
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
          onboardedCount: "Onboarded Count",
          assignedCount: "Assigned Count",
          notJoinedCount: "Not Joined Count",
          accountStatus: "Status",

          // role: "Role"
        }}
      />
    </DashboardLayout>
  );
};

export default ManageAdmins;
