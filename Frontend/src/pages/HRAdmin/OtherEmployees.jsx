import React, { useState, useEffect } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { Search, Filter } from "lucide-react";
import Pagination from "../../Components/UI/Pagination";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EmployeeFilters from "../../Components/Shared/EmployeeFilters";
import PageHeader from "../../Components/Shared/PageHeader";
import EmployeeTable from "../../Components/Shared/EmployeeTable";
import useEmployeeList from "../../hooks/useEmployeeList";

const OtherEmployees = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // Hook initialization
  const {
      currentEmployees,
      totalItems,
      loading: hookLoading,
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
      fetchEmployees
  } = useEmployeeList({
      filterPredicate: (emp, user) => {
        if (!currentUserLocation) return false;
        
        const isEmployee = emp.role === "EMPLOYEE";
        // Logic from original file: 
        // matchesLocation = emp.assignedHRLocation === myLocation
        // isNotAssignedToMe = emp.onboardingHrId !== user.id
        
        const matchesLocation = emp.assignedHRLocation === currentUserLocation;
        // User id is available in the 'user' object passed to predicate (fetched from regex/localStorage inside hook)
        // But hook passes 'user' object which is { ... } from localStorage.
        // Let's assume user.id is correct.
        const isNotAssignedToMe = emp.onboardingHrId !== user.id;

        return isEmployee && matchesLocation && isNotAssignedToMe;
      },
      itemsPerPage: 5
  });

  // Fetch Current User Location
  useEffect(() => {
      const fetchLocation = async () => {
          try {
              const userInfoStr = localStorage.getItem("userInfo");
              const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
              const token = userInfo?.token || localStorage.getItem("token");
              const user = userInfo?.user || JSON.parse(localStorage.getItem("user"));
              
              if (!user || !user.employeeId) {
                  console.error("User ID missing");
                  setIsLocationLoading(false);
                  return;
              }

              const config = { headers: { Authorization: `Bearer ${token}` } };
              const myProfileRes = await axios.get(
                  `/api/employees/${user.employeeId}`,
                  config
              );
              setCurrentUserLocation(myProfileRes.data.location);
          } catch (error) {
              console.error("Error fetching user location:", error);
          } finally {
              setIsLocationLoading(false);
          }
      };

      fetchLocation();
  }, []);

  // Re-fetch employees when location is available
  useEffect(() => {
      if (currentUserLocation) {
          fetchEmployees();
      }
  }, [currentUserLocation]);

  const loading = isLocationLoading || hookLoading;

  return (
    <DashboardLayout>
      <PageHeader
        title="Other Employees"
        subtitle="View employees in your location managed by other HRs."
      />

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
              itemsPerPage={5} // inherited from hook default or explicit
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading...
          </div>
        ) : (
          <EmployeeTable
            employees={currentEmployees}
            onRowClick={(emp) =>
              navigate(`/hr-admin/employees/${emp.id}`)
            }
            emptyMessage="No other employees found in your location."
            // No actions for Other Employees
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default OtherEmployees;
