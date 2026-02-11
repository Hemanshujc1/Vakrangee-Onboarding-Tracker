import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAlert } from "../context/AlertContext";
import { getEmployeeStatus, getUniqueOptions } from "../utils/employeeUtils";

const useEmployeeList = ({
  initialFilters = {},
  filterPredicate = null, // Function to filter raw data (e.g. (emp, user) => boolean)
  fetchEndpoint = "/api/employees",
  itemsPerPage = 5,
} = {}) => {
  const { showAlert, showConfirm } = useAlert();
  
  // Data State
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Filter State
  const [filters, setFilters] = useState({
    status: "",
    department: "",
    jobTitle: "",
    location: "",
    assignedHR: "",
    ...initialFilters
  });

  // Fetch Data
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const token = userInfo?.token || localStorage.getItem("token");
      const user = userInfo?.user || JSON.parse(localStorage.getItem("user"));
      
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(fetchEndpoint, config);

      let processedData = data;
      
      // Apply pre-filter if provided (e.g., for specific roles or assignments)
      if (filterPredicate && user) {
        processedData = data.filter(emp => filterPredicate(emp, user));
      } else {
         processedData = data.filter(emp => emp.role === "EMPLOYEE");
      }

      setEmployees(processedData);
    } catch (error) {
      console.error("Error fetching employees:", error);
      showAlert("Failed to fetch employees", { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Actions
  const handleActivate = async (emp) => {
    const isConfirmed = await showConfirm(`Are you sure you want to activate ${emp.firstName} ${emp.lastName}?`, { type: 'info' });
    if(!isConfirmed) return;

    // Check for previous login activity
    const hasLoggedIn = emp.firstLoginAt || emp.lastLoginAt;
    const newStatus = hasLoggedIn ? "ACTIVE" : "INVITED";

    try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        await axios.put(`/api/employees/${emp.id}`, { 
           accountStatus: newStatus,
           // Do NOT reset firstLoginAt/lastLoginAt
         }, config);

        // Optimistic update
        setEmployees(prev => prev.map(p => 
           p.id === emp.id ? { 
               ...p, 
               accountStatus: newStatus,
               // Maintain existing dates
           } : p
        ));
        await showAlert("Employee activated successfully!", { type: 'success' });
    } catch (err) {
        console.error("Activation failed", err);
        await showAlert("Failed to activate employee", { type: 'error' });
    }
  };

  const handleDelete = async (emp) => {
    const isConfirmed = await showConfirm(`Are you sure you want to remove ${emp.firstName} ${emp.lastName}? This will mark them as 'Not Joined'.`, { type: 'warning' });
    if(isConfirmed) {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`/api/employees/${emp.id}`, config);
            
            // Optimistic update
            setEmployees(prev => prev.map(p => 
                p.id === emp.id ? { ...p, accountStatus: 'Inactive' } : p
            ));
            await showAlert("Employee removed successfully.", { type: 'success' });
        } catch (err) {
            console.error("Delete failed", err);
            await showAlert("Failed to delete employee", { type: 'error' });
        }
    }
  };

  // Derived Data
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const statusText = getEmployeeStatus(emp);
      const matchesSearch =
        (emp.firstName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (emp.lastName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (emp.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
  
      const matchesStatus = filters.status ? statusText === filters.status : true;
      const matchesDept = filters.department ? emp.department === filters.department : true;
      const matchesJob = filters.jobTitle ? emp.jobTitle === filters.jobTitle : true;
      const matchesLocation = filters.location ? emp.location === filters.location : true;
      
      let matchesHR = true;
      if (filters.assignedHR) {
        if (filters.assignedHR === "Not Assigned") {
          matchesHR = !emp.assignedHRName || emp.assignedHRName === "-";
        } else {
          matchesHR = emp.assignedHRName === filters.assignedHR;
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
  }, [employees, searchTerm, filters]);

  // Sorting
  const sortedEmployees = useMemo(() => {
    const data = [...filteredEmployees];
    data.sort((a, b) => {
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
    return data;
  }, [filteredEmployees, sortConfig]);

  // Pagination
  const totalItems = sortedEmployees.length;
  const currentEmployees = sortedEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Options
  const options = useMemo(() => {
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

      return {
          departments: getUniqueOptions(employees, "department"),
          jobTitles: getUniqueOptions(employees, "jobTitle"),
          locations: getUniqueOptions(employees, "location"),
          statuses: [
            "Login Pending",
            "Profile Pending",
            "In Progress",
            "Ready to Join",
            "Joining Formalities",
            "Completed",
            "Not Joined"
          ],
          hrOptions: hasUnassigned ? ["Not Assigned", ...uniqueHRs] : uniqueHRs
      };
  }, [employees]);

  // Actions for Filters
  const resetFilters = () => {
    setFilters({
        status: "",
        department: "",
        jobTitle: "",
        location: "",
        assignedHR: "", 
        ...initialFilters // Respect initial overrides if any
    });
    setSearchTerm("");
    setSortConfig({ key: null, direction: "asc" });
    setCurrentPage(1);
  };
  
  const updateFilter = (key, value) => {
      setFilters(prev => ({ ...prev, [key]: value }));
      setCurrentPage(1); // Reset page on filter change
  };

  return {
    // Data
    employees,
    currentEmployees,
    filteredEmployees: sortedEmployees,
    totalItems,
    loading,
    options,
    
    // State
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    sortConfig,
    setSortConfig,
    filters,
    updateFilter,
    resetFilters,
    
    // Actions
    fetchEmployees,
    handleActivate,
    handleDelete
  };
};

export default useEmployeeList;
