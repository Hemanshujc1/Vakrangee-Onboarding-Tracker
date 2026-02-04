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
import StatCard from "../../Components/Shared/StatCard";
import useDashboardStats from "../../hooks/useDashboardStats";
import RecentEmployeesList from "../../Components/Dashboard/RecentEmployeesList";
import QuickActionsGrid from "../../Components/Dashboard/QuickActionsGrid";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { stats, recentEmployees, loading } = useDashboardStats({ role: 'HR_SUPER_ADMIN' });
  const navigate = useNavigate();

  const quickActions = [
    {
        label: "Manage Employees",
        icon: UserPlus,
        link: "/hr-super-admin/employees",
        borderColor: "hover:border-(--color-text-dark)",
        bgColor: "hover:bg-blue-50",
        textColor: "hover:text-(--color-primary)"
    },
    {
        label: "Manage Admins",
        icon: UserCog,
        link: "/hr-super-admin/admins",
        borderColor: "hover:border-(--color-accent-gold)",
        bgColor: "hover:bg-yellow-50",
        textColor: "hover:text-(--color-accent-gold)"
    },
    {
        label: "Manage Assigned",
        icon: Users,
        link: "/hr-super-admin/myemployees",
        borderColor: "hover:border-(--color-accent-gold)",
        bgColor: "hover:bg-green-50",
        textColor: "hover:text-(--color-accent-sage)"
    },
    {
        label: "My Profile",
        icon: User,
        link: "/hr-super-admin/profile",
        borderColor: "hover:border-(--color-accent-gold)",
        bgColor: "hover:bg-red-100",
        textColor: "hover:text-(--color-accent-orange)"
    }
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
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
        <RecentEmployeesList 
            title="New Joiners"
            employees={recentEmployees}
            loading={loading}
            viewAllLink="/hr-super-admin/employees"
            onEmployeeClick={(id) => navigate(`/hr-super-admin/employees/${id}`)}
        />
        
        <QuickActionsGrid actions={quickActions} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
