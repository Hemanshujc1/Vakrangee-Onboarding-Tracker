import { useState, useEffect } from "react";
import axios from "axios";
import { getUniqueOptions } from "../../../utils/employeeUtils";
import { useAlert } from "../../../context/AlertContext";

export const useManageAdmins = () => {
  const { showAlert, showConfirm } = useAlert();
  
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering
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
        ["HR_ADMIN", "HR_SUPER_ADMIN"].includes(emp.role),
      );
      setAdmins(strictAdmins);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (formData, setIsModalOpen) => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      const token = userInfo
        ? JSON.parse(userInfo).token
        : localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        username: formData.email,
        password: formData.password || "Admin@123",
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department_name,
        department_id: formData.department_id,
        jobTitle: formData.job_title,
        designation_id: formData.designation_id,
        work_location: formData.work_location,
        location: formData.location,
        phone: formData.phone,
        startDate: formData.startDate,
        employee_id: formData.employee_id,
      };

      await axios.post("/api/auth/register", payload, config);
      await showAlert("Admin added successfully!", { type: "success" });
      setIsModalOpen(false);
      fetchAdmins();
    } catch (error) {
      console.error("Error adding admin:", error);
      await showAlert(error.response?.data?.message || "Failed to add admin", {
        type: "error",
      });
      throw error;
    }
  };

  const handleActivateAdmin = async (id) => {
    const isConfirmed = await showConfirm(
      "Are you sure you want to activate this admin?",
      { type: "info" },
    );
    if (!isConfirmed) return;

    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const token = userInfoStr
        ? JSON.parse(userInfoStr).token
        : localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const hasLoggedIn =
        admins.find((a) => a.id === id)?.firstLoginAt ||
        admins.find((a) => a.id === id)?.lastLoginAt;
      const newStatus = hasLoggedIn ? "ACTIVE" : "INVITED";

      await axios.put(
        `/api/employees/${id}`,
        {
          accountStatus: newStatus,
        },
        config,
      );

      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id === id
            ? {
                ...admin,
                accountStatus: newStatus,
              }
            : admin,
        ),
      );

      await showAlert("Admin activated successfully!", { type: "success" });
    } catch (error) {
      console.error("Error activating admin:", error);
      await showAlert("Failed to activate admin", { type: "error" });
    }
  };

  const handleDeleteAdmin = async (id) => {
    const isConfirmed = await showConfirm(
      "Are you sure you want to deactivate this admin?",
      { type: "warning" },
    );
    if (!isConfirmed) return;
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      let token = userInfoStr
        ? JSON.parse(userInfoStr).token
        : localStorage.getItem("token");

      if (!token) {
        await showAlert(
          "Authentication error: No token found. Please login again.",
          { type: "error" },
        );
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.delete(`/api/employees/${id}`, config);

      // Optimistic update
      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id === id ? { ...admin, accountStatus: "Inactive" } : admin,
        ),
      );

      await showAlert("Admin deactivated successfully", { type: "success" });
    } catch (error) {
      console.error("Error deleting admin:", error);
      if (error.response && error.response.status === 403) {
        await showAlert(error.response.data.message || "Unauthorized action.", {
          type: "error",
        });
      } else {
        await showAlert("Failed to delete admin. See console for details.", {
          type: "error",
        });
      }
    }
  };

  const jobTitles = getUniqueOptions(admins, "jobTitle");
  const locations = getUniqueOptions(admins, "location");
  const statuses = ["ACTIVE", "Inactive", "INVITED"];

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
    currentPage * itemsPerPage,
  );

  return {
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
    fetchAdmins,
    handleAddAdmin,
    handleActivateAdmin,
    handleDeleteAdmin,
    jobTitles,
    locations,
    statuses,
    totalItems,
    currentAdmins,
  };
};
