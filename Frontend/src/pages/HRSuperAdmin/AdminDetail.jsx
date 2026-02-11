import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import axios from "axios";
import EmployeeFilters from "../../Components/Shared/EmployeeFilters";
import ExportModal from "../../Components/Shared/ExportModal";
import { getUniqueOptions, getEmployeeStatus } from "../../utils/employeeUtils";
import { useAlert } from "../../context/AlertContext";

// Modular Sections
import AdminProfileHeader from "./AdminDetailSections/AdminProfileHeader";
import AdminProfileCard from "./AdminDetailSections/AdminProfileCard";
import AdminStatsGrid from "./AdminDetailSections/AdminStatsGrid";
import AdminAssignedEmployees from "./AdminDetailSections/AdminAssignedEmployees";

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
        matchesStatus = emp.accountStatus === "Inactive";
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
    const isNotJoinedA = a.accountStatus === "Inactive";
    const isNotJoinedB = b.accountStatus === "Inactive";

    if (isNotJoinedA && !isNotJoinedB) return 1;
    if (!isNotJoinedA && isNotJoinedB) return -1;

    // 2. Secondary Sort: User Selection
    if (sortConfig.key) {
      let valA = a[sortConfig.key] || "";
      let valB = b[sortConfig.key] || "";

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AdminProfileHeader
          navigate={navigate}
          accountStatus={admin.accountStatus}
        />

        <AdminProfileCard
          admin={admin}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          editForm={editForm}
          setEditForm={setEditForm}
          handleSave={handleSave}
        />

        <AdminStatsGrid stats={admin.stats} />

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

        <AdminAssignedEmployees
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setIsSidebarOpen={setIsSidebarOpen}
          setIsExportModalOpen={setIsExportModalOpen}
          filteredEmployees={filteredEmployees}
          assignedEmployeesLength={assignedEmployees.length}
          onRowClick={(emp) => navigate(`/hr-super-admin/employees/${emp.id}`)}
          onActivate={async (emp) => {
            const isConfirmed = await showConfirm(
              `Are you sure you want to activate ${emp.firstName} ${emp.lastName}?`,
              { type: "info" },
            );
            if (!isConfirmed) return;

            const hasLoggedIn = emp.firstLoginAt || emp.lastLoginAt;
            const newStatus = hasLoggedIn ? "ACTIVE" : "INVITED";

            try {
              const token = localStorage.getItem("token");
              const config = {
                headers: { Authorization: `Bearer ${token}` },
              };

              await axios.put(
                `/api/employees/${emp.id}`,
                { accountStatus: newStatus },
                config,
              );

              setAdmin((prev) => ({
                ...prev,
                assignedEmployees: prev.assignedEmployees.map((p) =>
                  p.id === emp.id ? { ...p, accountStatus: newStatus } : p,
                ),
                stats: {
                  ...prev.stats,
                  notJoined: Math.max(0, (prev.stats?.notJoined || 0) - 1),
                  completed:
                    emp.onboarding_stage === "COMPLETED"
                      ? (prev.stats?.completed || 0) + 1
                      : prev.stats?.completed || 0,
                  activeOnboarding:
                    emp.onboarding_stage !== "COMPLETED"
                      ? (prev.stats?.activeOnboarding || 0) + 1
                      : prev.stats?.activeOnboarding || 0,
                },
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
              { type: "warning" },
            );
            if (isConfirmed) {
              try {
                const token = localStorage.getItem("token");
                const config = {
                  headers: { Authorization: `Bearer ${token}` },
                };
                await axios.delete(`/api/employees/${emp.id}`, config);

                setAdmin((prev) => ({
                  ...prev,
                  assignedEmployees: prev.assignedEmployees.map((p) =>
                    p.id === emp.id ? { ...p, accountStatus: "Inactive" } : p,
                  ),
                  stats: {
                    ...prev.stats,
                    notJoined: (prev.stats?.notJoined || 0) + 1,
                    completed:
                      emp.onboarding_stage === "COMPLETED"
                        ? Math.max(0, (prev.stats?.completed || 0) - 1)
                        : prev.stats?.completed || 0,
                    activeOnboarding:
                      emp.onboarding_stage !== "COMPLETED"
                        ? Math.max(0, (prev.stats?.activeOnboarding || 0) - 1)
                        : prev.stats?.activeOnboarding || 0,
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
