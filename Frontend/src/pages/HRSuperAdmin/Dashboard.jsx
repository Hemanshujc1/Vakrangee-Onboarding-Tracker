import React, { useState, useEffect } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import {
  User,
  Users,
  CheckCircle,
  Activity,
  UserPlus,
  Shield,
  UserCog,
} from "lucide-react";
import axios from "axios";
import { getEmployeeStatus } from "../../utils/employeeUtils";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../Components/Shared/StatusBadge";

const StatCard = ({ title, value, icon: Icon, colorVar }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-(--color-text-dark)">{value}</h3>
      </div>
      <div
        className="p-3 rounded-full opacity-20"
        style={{
          backgroundColor: `var(${colorVar})`,
          color: `var(${colorVar})`,
        }}
      >
        <Icon size={24} style={{ opacity: 1, color: `var(${colorVar})` }} />
      </div>
    </div>
    <div
      className="absolute top-6 right-6 p-3 rounded-full"
      style={{ backgroundColor: `var(${colorVar})`, opacity: 0.1 }}
    ></div>
    <div className="absolute top-6 right-6 p-3 rounded-full text-transparent">
      <Icon
        size={24}
        style={{ fill: `var(${colorVar})`, stroke: `var(${colorVar})` }}
      />
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalAdmins: 0,
    onboardingActive: 0,
    completed: 0,
    profilePending: 0,
  });
  const [recentJoiners, setRecentJoiners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      const token = userInfo
        ? JSON.parse(userInfo).token
        : localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = await axios.get("/api/employees", config);

      const employees = data.filter((e) => e.role === "EMPLOYEE");
      const admins = data.filter((e) =>
        ["HR_ADMIN", "HR_SUPER_ADMIN", "ADMIN"].includes(e.role)
      );

      // Calculate stats
      const activeOnboarding = employees.filter((e) => {
        const status = getEmployeeStatus(e);
        return !["Completed", "Not Joined"].includes(status);
      }).length;

      const completedCount = employees.filter(
        (e) => getEmployeeStatus(e) === "Completed"
      ).length;

      const pendingProfile = employees.filter(
        (e) => getEmployeeStatus(e) === "Profile Pending"
      ).length;

      setStats({
        totalEmployees: employees.length,
        totalAdmins: admins.length,
        onboardingActive: activeOnboarding,
        completed: completedCount,
        profilePending: pendingProfile,
      });

      // Recent joiners (filter employees, sort by creation date or id if no date, take top 5)
      // Assuming higher ID or later created_at means newer. Using ID for simplicity if created_at lacking, but startDate is better if exists.
      // Let's us createdAt if available, else ID reverse.
      const sortedEmployees = [...employees]
        .sort((a, b) => {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        })
        .slice(0, 5);

      setRecentJoiners(sortedEmployees);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-text-dark)">
          HR Super Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          Welcome back! Here's an overview of the onboarding status.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-(--color-primary) hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Total Employees
              </p>
              <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">
                {loading ? "-" : stats.totalEmployees}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-(--color-primary)">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-(--color-accent-orange) hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Active Onboarding
              </p>
              <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">
                {loading ? "-" : stats.onboardingActive}
              </h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-(--color-accent-orange)">
              <Activity size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-(--color-accent-sage) hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Completed</p>
              <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">
                {loading ? "-" : stats.completed}
              </h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-(--color-accent-sage)">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-(--color-accent-green) hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Admins</p>
              <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">
                {loading ? "-" : stats.totalAdmins}
              </h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-(--color-accent-green)">
              <Shield size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-(--color-secondary)">
              New Joiners
            </h2>
            <button
              onClick={() => navigate("/hr-super-admin/employees")}
              className="text-sm text-(--color-primary) hover:underline font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-400 text-sm text-center py-4">
                Loading...
              </p>
            ) : recentJoiners.length > 0 ? (
              recentJoiners.map((employee) => (
                <div
                  key={employee.id}
                  onClick={() =>
                    navigate(`/hr-super-admin/employees/${employee.id}`)
                  }
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {employee.profilePhoto ? (
                      <img
                        src={employee.profilePhoto}
                        alt={employee.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-(--color-secondary) text-white flex items-center justify-center font-bold text-sm">
                        {employee.firstName?.[0]}
                        {employee.lastName?.[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-(--color-text-dark)">
                        {employee.firstName} {employee.lastName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {employee.jobTitle || "No Title"}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium rounded-full">
                    <StatusBadge status={getEmployeeStatus(employee)} />
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">
                No recent employees found.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-h-max">
          <h2 className="text-xl font-bold mb-4 text-(--color-secondary)">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() =>
                navigate("/hr-super-admin/employees")
              } /* Ideally open add modal directly if we could pass state, but nav is safe */
              className="p-4 border border-dashed border-gray-300 rounded-xl hover:border-(--color-text-dark) hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-(--color-primary)"
            >
              <UserPlus size={24} />
              <span className="font-medium">Manage Employees</span>
            </button>
            <button
              onClick={() => navigate("/hr-super-admin/admins")}
              className="p-4 border border-dashed border-gray-300 rounded-xl hover:border-(--color-accent-gold) hover:bg-yellow-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-(--color-accent-gold)"
            >
              <UserCog size={24} />
              <span className="font-medium">Manage Admins</span>
            </button>
            <button
              onClick={() => navigate("/hr-super-admin/myemployees")}
              className="p-4 border border-dashed border-gray-300 rounded-xl hover:border-(--color-accent-gold) hover:bg-green-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-(--color-accent-sage)"
            >
              <Users size={24} />
              <span className="font-medium">Manage Assigned Employees</span>
            </button>
            <button
              onClick={() => navigate("/hr-super-admin/profile")}
              className="p-4 border border-dashed border-gray-300 rounded-xl hover:border-(--color-accent-gold) hover:bg-red-100 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-(--color-accent-orange)"
            >
              <User size={24} />
              <span className="font-medium">My Profile</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
