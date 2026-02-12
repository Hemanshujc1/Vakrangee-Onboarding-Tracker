import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useEmployeeList from "../../hooks/useEmployeeList";
import EmployeeManagementPage from "../../Components/Shared/EmployeeManagementPage";

const OtherEmployees = () => {
  const navigate = useNavigate();
  const [currentUserLocation, setCurrentUserLocation] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // Hook initialization
  const employeeListProps = useEmployeeList({
    filterPredicate: (emp, user) => {
      if (!currentUserLocation) return false;

      const isEmployee = emp.role === "EMPLOYEE";

      const matchesLocation = emp.assignedHRLocation === currentUserLocation;
      const isNotAssignedToMe = emp.onboardingHrId !== user.id;

      return isEmployee && matchesLocation && isNotAssignedToMe;
    },
    itemsPerPage: 5,
  });

  const { fetchEmployees, loading: hookLoading } = employeeListProps;

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
    <EmployeeManagementPage
      title="Other Employees"
      subtitle="View employees in your location managed by other HRs."
      loading={loading}
      onRowClick={(emp) => navigate(`/hr-admin/employees/${emp.id}`)}
      emptyMessage="No other employees found in your location."
      {...employeeListProps}
    />
  );
};

export default OtherEmployees;
