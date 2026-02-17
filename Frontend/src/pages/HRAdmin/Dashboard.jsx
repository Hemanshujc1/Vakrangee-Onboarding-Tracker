import React, { useMemo } from 'react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import { Users, ListTodo, UserRoundCheck, Activity, FileText, UserPlus } from 'lucide-react';
import StatCard from '../../Components/Shared/StatCard';
import useDashboardStats from '../../hooks/useDashboardStats';
import RecentEmployeesList from '../../Components/Dashboard/RecentEmployeesList';
import QuickActionsGrid from '../../Components/Dashboard/QuickActionsGrid';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Get User ID for filtering
  const user = useMemo(() => {
      const userStr = localStorage.getItem('user');
      if (userStr) return JSON.parse(userStr);
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) return JSON.parse(userInfo).user;
      return null;
  }, []);

  const { stats, recentEmployees, loading } = useDashboardStats({ 
      role: 'HR_ADMIN', 
      userId: user?.id 
  });

  const quickActions = [
      {
          label: "Assigned Employees",
          icon: FileText,
          link: "/hr-admin/employees",
          borderColor: "hover:border-(--color-primary)",
          bgColor: "hover:bg-blue-50",
          textColor: "hover:text-(--color-primary)"
      },
      {
          label: "My Profile",
          icon: UserPlus,
          link: "/hr-admin/profile",
          borderColor: "hover:border-(--color-accent-green)",
          bgColor: "hover:bg-green-50",
          textColor: "hover:text-(--color-accent-green)"
      }
  ];

  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-text-dark)">HR Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">Manage your assigned employees and track their progress.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
        <StatCard 
            title="Assigned Employees"
            value={loading ? '-' : stats.totalEmployees}
            icon={Users}
            colorVar="--color-primary"
        />
        <StatCard 
            title="Pending Reviews"
            value={loading ? '-' : stats.pending}
            icon={ListTodo}
            colorVar="--color-accent-orange"
        />
        <StatCard 
            title="Onboarding Active"
            value={loading ? '-' : stats.onboardingActive}
            icon={Activity}
            colorVar="--color-accent-sage"
        />
        <StatCard 
            title="Fully Onboarded"
            value={loading ? '-' : stats.completed}
            icon={UserRoundCheck}
            colorVar="--color-accent-green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentEmployeesList 
            title="My Assigned Employees"
            employees={recentEmployees}
            loading={loading}
            viewAllLink="/hr-admin/employees"
            emptyMessage="No employees assigned yet."
            onEmployeeClick={(id) => navigate(`/hr-admin/employees/${id}`)}
        />
        <QuickActionsGrid actions={quickActions} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
