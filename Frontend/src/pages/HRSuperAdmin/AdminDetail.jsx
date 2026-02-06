import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import {
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  ArrowLeft,
  Users,
  CheckCircle,
  Clock,
  Pencil,
  Filter,
  Download,
  Search,
} from "lucide-react";
import axios from "axios";
import EmployeeTable from "../../Components/Shared/EmployeeTable";
import EmployeeFilters from "../../Components/Shared/EmployeeFilters";

import ExportModal from "../../Components/Shared/ExportModal";
import { getUniqueOptions, getEmployeeStatus } from "../../utils/employeeUtils";
import { useAlert } from "../../context/AlertContext";

const AdminDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useAlert();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterJobTitle, setFilterJobTitle] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    location: "",
    jobTitle: "",
    department: "",
  });

  useEffect(() => {
    fetchAdminDetails();
  }, [id]);

  const fetchAdminDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`/api/employees/${id}`, config);
      setAdmin(data);
      setEditForm({
        location: data.location || "",
        jobTitle: data.jobTitle || "",
        department: data.department || "",
      });
    } catch (error) {
      console.error("Error fetching admin details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.put(`/api/employees/${id}`, editForm, config);

      // Re-fetch to get updated data cleanly
      fetchAdminDetails();
      setIsEditing(false);
      await showAlert("Details updated successfully.", { type: "success" });
    } catch (error) {
      console.error("Error updating admin details:", error);
      await showAlert("Failed to update details.", { type: "error" });
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="p-10 text-center text-gray-500">Loading profile...</div>
      </DashboardLayout>
    );
  if (!admin)
    return (
      <DashboardLayout>
        <div className="p-10 text-center text-gray-500">Admin not found.</div>
      </DashboardLayout>
    );

  // --- Filtering Logic ---
  const assignedEmployees = admin.assignedEmployees || [];

  const departments = getUniqueOptions(assignedEmployees, "department");
  const jobTitles = getUniqueOptions(assignedEmployees, "jobTitle");
  const locations = getUniqueOptions(assignedEmployees, "location");
  const statuses = [
    "Login Pending",
    "Profile Pending",
    "In Progress",
    "Ready to Join",
    "Joining Formalities",
    "Completed",
    "Not Joined",
  ];

  let filteredEmployees = assignedEmployees.filter((emp) => {
    const matchesSearch =
      emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = filterDepartment
      ? emp.department === filterDepartment
      : true;
    const matchesJob = filterJobTitle ? emp.jobTitle === filterJobTitle : true;
    const matchesLocation = filterLocation
      ? emp.location === filterLocation
      : true;

    // Status Filter (Custom Logic to match diverse statuses)
    let matchesStatus = true;
    if (filterStatus) {
      if (filterStatus === "Not Joined") {
        matchesStatus =
          emp.onboarding_stage === "Not_joined" ||
          emp.accountStatus === "Inactive";
      } else {
        const currentStatus = getEmployeeStatus(emp);
        matchesStatus = currentStatus === filterStatus;
      }
    }

    return (
      matchesSearch &&
      matchesDept &&
      matchesJob &&
      matchesLocation &&
      matchesStatus
    );
  });

  // Sorting
  filteredEmployees.sort((a, b) => {
    // 1. Primary Sort: "Not Joined" / Inactive always at bottom
    const isNotJoinedA =
      a.onboarding_stage === "Not_joined" || a.accountStatus === "Inactive";
    const isNotJoinedB =
      b.onboarding_stage === "Not_joined" || b.accountStatus === "Inactive";

    if (isNotJoinedA && !isNotJoinedB) return 1;
    if (!isNotJoinedA && isNotJoinedB) return -1;

    // 2. Secondary Sort: User Selection
    if (sortConfig.key) {
      let valA = a[sortConfig.key] || "";
      let valB = b[sortConfig.key] || "";

      // Date handling if needed, though mostly strings
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header / Back Button */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Admins</span>
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Admin Profile</h1>
            {/* Account Status Badge */}
            <div
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
                admin.accountStatus === "Inactive"
                  ? "bg-red-50 text-red-600 border-red-500"
                  : admin.accountStatus === "INVITED"
                  ? "bg-yellow-50 text-yellow-600 border-yellow-500"
                  : "bg-green-50 text-green-600 border-green-500"
              }`}
            >
              {admin.accountStatus || "ACTIVE"}
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-32 bg-linear-to-r from-blue-600 to-blue-800"></div>
          <div className="px-4 md:px-8 pb-8">
            <div className="relative flex flex-col md:flex-row justify-between items-center md:items-end -mt-12 mb-6 gap-4">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 w-full md:w-auto">
                <div className="relative shrink-0">
                  {admin.profilePhoto ? (
                    <img
                      src={admin.profilePhoto}
                      alt={admin.firstName}
                      className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center text-4xl font-bold text-blue-600">
                      {admin.firstName?.[0]}
                    </div>
                  )}
                </div>
                <div className="mb-2 text-center md:text-left mt-2 md:mt-0">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {admin.firstName} {admin.lastName}
                  </h2>
                  <div className="text-blue-600 font-medium flex items-center justify-center md:justify-start gap-2">
                    <Briefcase size={16} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.jobTitle}
                        onChange={(e) =>
                          setEditForm({ ...editForm, jobTitle: e.target.value })
                        }
                        className="border border-blue-200 rounded px-2 py-1 text-sm text-blue-600 font-medium focus:outline-none focus:border-blue-600 w-full"
                      />
                    ) : (
                      <span>{admin.jobTitle || admin.role}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="mb-2 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors self-center md:self-end"
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
                  <p className="font-medium text-sm">{admin.phone || "N/A"}</p>
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
                      onChange={(e) =>
                        setEditForm({ ...editForm, department: e.target.value })
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-[#2C9DE6]"
                    />
                  ) : (
                    <p className="font-medium text-sm">
                      {admin.department || "N/A"}
                    </p>
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
                      onChange={(e) =>
                        setEditForm({ ...editForm, location: e.target.value })
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-full mt-1 focus:outline-none focus:border-[#2C9DE6]"
                    />
                  ) : (
                    <p className="font-medium text-sm">
                      {admin.location || "N/A"}
                    </p>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="flex items-center gap-3 col-span-1 md:col-span-3 justify-end mt-4 border-t pt-4">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        location: admin.location || "",
                        jobTitle: admin.jobTitle || "",
                        department: admin.department || "",
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
                    <p className="font-medium text-sm">
                      {admin.gender || "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium text-sm">Assigned Employees</h3>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#4E4E4E]">
              {admin.stats?.totalAssigned || 0}
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium text-sm">Onboarding Active</h3>
              <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                <Clock size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#4E4E4E]">
              {admin.stats?.activeOnboarding || 0}
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium text-sm">Fully Onboarded</h3>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <CheckCircle size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#4E4E4E]">
              {admin.stats?.completed || 0}
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium text-sm">Not Joined</h3>
              <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                <Users size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#4E4E4E]">
              {admin.stats?.notJoined || 0}
            </p>
          </div>
        </div>

        <EmployeeFilters
          filters={{
            department: filterDepartment,
            setDepartment: setFilterDepartment,
            jobTitle: filterJobTitle,
            setJobTitle: setFilterJobTitle,
            location: filterLocation,
            setLocation: setFilterLocation,
            status: filterStatus,
            setStatus: setFilterStatus,
            resetFilters: () => {
              setFilterDepartment("");
              setFilterJobTitle("");
              setFilterLocation("");
              setFilterStatus("");
            setSearchTerm("");
              setSortConfig({ key: null, direction: "asc" });
            },
          }}
          options={{ departments, jobTitles, locations, statuses }}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Assigned Employees List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 mb-4">
            <h3 className="text-lg font-bold text-[#4E4E4E]">
              Assigned Employees
            </h3>

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
            onRowClick={(emp) =>
              navigate(`/hr-super-admin/employees/${emp.id}`)
            }
            showAssignedDate={true}
            emptyMessage={
              assignedEmployees.length === 0
                ? "No employees assigned to this admin yet."
                : "No employees match your search."
            }
            onActivate={async (emp) => {
              const isConfirmed = await showConfirm(
                `Are you sure you want to activate ${emp.firstName} ${emp.lastName}?`,
                { type: "info" }
              );
              if (!isConfirmed) return;

              try {
                const token = localStorage.getItem("token");
                const config = {
                  headers: { Authorization: `Bearer ${token}` },
                };

                await axios.put(
                  `/api/employees/${emp.id}`,
                  {
                    accountStatus: "INVITED",
                    onboarding_stage: "BASIC_INFO",
                    firstLoginAt: null,
                    lastLoginAt: null,
                  },
                  config
                );

                // Optimistic update
                setAdmin((prev) => ({
                  ...prev,
                  assignedEmployees: prev.assignedEmployees.map((p) =>
                    p.id === emp.id
                      ? {
                          ...p,
                          accountStatus: "INVITED",
                          onboarding_stage: "BASIC_INFO",
                          firstLoginAt: null,
                          lastLoginAt: null,
                        }
                      : p
                  ),
                }));
                await showAlert("Employee activated successfully!", {
                  type: "success",
                });
              } catch (err) {
                console.error("Activation failed", err);
                await showAlert("Failed to activate employee", {
                  type: "error",
                });
              }
            }}
            onDelete={async (emp) => {
              const isConfirmed = await showConfirm(
                `Are you sure you want to remove ${emp.firstName} ${emp.lastName}? This will mark them as 'Not Joined'.`,
                { type: "warning" }
              );
              if (isConfirmed) {
                try {
                  const token = localStorage.getItem("token");
                  const config = {
                    headers: { Authorization: `Bearer ${token}` },
                  };
                  await axios.delete(`/api/employees/${emp.id}`, config);

                  // Optimistic update
                  setAdmin((prev) => ({
                    ...prev,
                    assignedEmployees: prev.assignedEmployees.map((p) =>
                      p.id === emp.id
                        ? {
                            ...p,
                            onboarding_stage: "Not_joined",
                            accountStatus: "Inactive",
                          }
                        : p
                    ),
                    // Also update stats nicely if possible
                    stats: {
                      ...prev.stats,
                      notJoined: prev.stats.notJoined + 1,
                    },
                  }));
                  await showAlert("Employee removed successfully.", {
                    type: "success",
                  });
                } catch (err) {
                  console.error("Delete failed", err);
                  await showAlert("Failed to delete employee", {
                    type: "error",
                  });
                }
              }
            }}
          />
        </div>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filterProps={{ showStatus: true }}
        options={{ statuses, departments, jobTitles, locations }}
        data={assignedEmployees.map((emp) => ({
          ...emp,
          joiningDate: emp.dateOfJoining
            ? new Date(emp.dateOfJoining).toLocaleDateString("en-GB")
            : "-",
          status: getEmployeeStatus(emp),
          assignedDate: emp.assignedDate
            ? new Date(emp.assignedDate).toLocaleDateString("en-GB")
            : "-",
        }))}
        fileName={`Assigned_Employees_${admin.firstName}_${admin.lastName}`}
        formatOptions={{
          firstName: "First Name",
          lastName: "Last Name",
          jobTitle: "Job Title",
          department: "Department",
          location: "Location",
          joiningDate: "Joining Date",
          status: "Status",
          assignedDate: "Assigned Date",
        }}
      />
    </DashboardLayout>
  );
};

export default AdminDetail;
