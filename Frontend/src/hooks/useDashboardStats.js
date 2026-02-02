import { useState, useEffect } from 'react';
import axios from 'axios';
import { getEmployeeStatus } from '../utils/employeeUtils';

const useDashboardStats = ({ role, userId } = {}) => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalAdmins: 0,
    onboardingActive: 0,
    completed: 0,
    pending: 0, // Profile Pending / Reviews
  });
  const [employees, setEmployees] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const userInfoStr = localStorage.getItem("userInfo");
        const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
        let token = userInfo?.token || localStorage.getItem("token");

        if (!token && userInfo) token = userInfo.token;

        if (!token) {
             console.error("No token found");
             return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/employees", config);

        let relevantEmployees = [];
        let admins = [];

        if (role === 'HR_ADMIN') {
             relevantEmployees = data.filter(emp => 
                emp.role === 'EMPLOYEE' && 
                userId && emp.onboardingHrId === userId 
             );
        } else {
             // Super Admin sees ALL
             relevantEmployees = data.filter(emp => emp.role === 'EMPLOYEE');
             admins = data.filter(emp => ['HR_ADMIN', 'HR_SUPER_ADMIN', 'ADMIN'].includes(emp.role));
        }

        // Calculate Stats
        const totalEmployees = relevantEmployees.length;
        const totalAdmins = admins.length;

        const onboardingActive = relevantEmployees.filter(e => {
            const status = getEmployeeStatus(e);
            return !['Completed', 'Not Joined'].includes(status);
        }).length;

        const completed = relevantEmployees.filter(e => getEmployeeStatus(e) === 'Completed').length;
        
        // HR Admin "Pending Reviews" vs Super Admin "Profile Pending"
        const pending = relevantEmployees.filter(e => 
            getEmployeeStatus(e) === 'Profile Pending' || 
            (role === 'HR_ADMIN' && getEmployeeStatus(e) === 'In Progress') // HR Admin might care about In Progress too
        ).length;

        setStats({
            totalEmployees,
            totalAdmins,
            onboardingActive,
            completed,
            pending
        });

        setEmployees(relevantEmployees);

        // Recent / Top List
        // Sort by creation date or ID descending
        const sorted = [...relevantEmployees].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA; 
        }).slice(0, 5);
        
        setRecentEmployees(sorted);

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [role, userId]);

  return { stats, employees, recentEmployees, loading };
};

export default useDashboardStats;
