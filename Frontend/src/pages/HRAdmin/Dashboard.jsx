import React, { useMemo } from 'react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import { Users, ListTodo, UserRoundCheck, Activity, FileText, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEmployeeStatus } from '../../utils/employeeUtils';
import StatCard from '../../Components/Shared/StatCard';
import useDashboardStats from '../../hooks/useDashboardStats';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Get User ID for filtering - although hook handles it, we pass it safely
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

  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-text-dark)">HR Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">Manage your assigned employees and track their progress.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-(--color-secondary)">My Assigned Employees</h2>
                <button onClick={() => navigate('/hr-admin/employees')} className="text-sm text-(--color-primary) hover:underline font-medium">View All</button>
            </div>
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-4 text-gray-500">Loading...</div>
                ) : recentEmployees.length > 0 ? (
                    recentEmployees.map((emp) => (
                        <div key={emp.id} 
                             onClick={() => navigate(`/hr-admin/employees/${emp.id}`)}
                             className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="flex items-center gap-4">
                                {emp.profilePhoto ? (
                                    <img src={emp.profilePhoto} alt={emp.firstName} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-(--color-secondary) text-white flex items-center justify-center font-bold text-sm">
                                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-semibold text-(--color-text-dark)">{emp.firstName} {emp.lastName}</h4>
                                    <p className="text-sm text-gray-500">{emp.jobTitle}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full 
                                ${getEmployeeStatus(emp) === 'Completed' ? 'bg-green-100 text-green-800' : 
                                  getEmployeeStatus(emp) === 'Not Joined' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {getEmployeeStatus(emp)}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-gray-500">No employees assigned yet.</div>
                )}
            </div>
        </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold mb-4 text-(--color-secondary)">Quick Actions</h2>
             <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => navigate('/hr-admin/employees')}
                    className="p-4 border border-dashed border-gray-300 rounded-xl hover:border-(--color-primary) hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-(--color-primary)"
                >
                    <FileText size={24} />
                    <span className="font-medium">Verify Forms</span>
                </button>
                <button 
                    onClick={() => navigate('/hr-admin/profile')} 
                    className="p-4 border border-dashed border-gray-300 rounded-xl hover:border-(--color-accent-green) hover:bg-green-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-(--color-accent-green)"
                >
                    <UserPlus size={24} />
                    <span className="font-medium">My Profile</span>
                </button>
             </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
