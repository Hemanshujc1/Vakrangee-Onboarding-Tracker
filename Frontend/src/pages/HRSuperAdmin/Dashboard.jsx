import React from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import {
  User,
  Users,
  UserRoundCheck,
  Activity,
  UserPlus,
  Shield,
  UserCog,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getEmployeeStatus } from "../../utils/employeeUtils";
import StatusBadge from "../../Components/Shared/StatusBadge";
import StatCard from "../../Components/Shared/StatCard";
import useDashboardStats from "../../hooks/useDashboardStats";

const Dashboard = () => {
  const navigate = useNavigate();
  const { stats, recentEmployees, loading } = useDashboardStats({ role: 'HR_SUPER_ADMIN' });

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
        <StatCard 
            title="Total Employees"
            value={loading ? "-" : stats.totalEmployees}
            icon={Users}
            colorVar="--color-primary"
        />
        <StatCard 
            title="Active Onboarding"
            value={loading ? "-" : stats.onboardingActive}
            icon={Activity}
            colorVar="--color-accent-orange"
        />
        <StatCard 
            title="Completed"
            value={loading ? "-" : stats.completed}
            icon={UserRoundCheck}
            colorVar="--color-accent-sage"
        />
        <StatCard 
            title="Admins"
            value={loading ? "-" : stats.totalAdmins}
            icon={Shield}
            colorVar="--color-accent-green"
        />
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
            ) : recentEmployees.length > 0 ? (
              recentEmployees.map((employee) => (
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
              } 
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
