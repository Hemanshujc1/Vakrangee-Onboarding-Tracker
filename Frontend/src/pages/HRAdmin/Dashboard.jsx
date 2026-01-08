import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import { Users, Clock, CheckCircle, Activity, FileText } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignedEmployees();
  }, []);

  const fetchAssignedEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      let userId = null;
      if (userStr) {
          const parsedUser = JSON.parse(userStr);
          userId = parsedUser.id; 
      }

      if (!token || !userId) return;

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get("/api/employees", config);

      const myEmployees = data.filter(emp => 
        emp.role === 'EMPLOYEE' && emp.onboardingHrId == userId
      );

      setAssignedEmployees(myEmployees);

      const total = myEmployees.length;
      const pending = myEmployees.filter(e => e.onboarding_stage === 'BASIC_INFO' || e.onboarding_stage === 'PRE_JOINING').length; // Approx "Pending Reviews" + "In Progress"
      const active = myEmployees.filter(e => e.onboarding_stage === 'PRE_JOINING' || e.onboarding_stage === 'PRE_JOINING_VERIFIED' || e.onboarding_stage === 'POST_JOINING').length;
      const completed = myEmployees.filter(e => e.onboarding_stage === 'ACTIVE').length;

      setStats({ total, pending, active, completed });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const getStageLabel = (stage) => {
      switch(stage) {
          case 'BASIC_INFO': return 'Profile Pending';
          case 'PRE_JOINING': return 'Pre-Joining In Progress';
          case 'PRE_JOINING_VERIFIED': return 'Ready to Join';
          case 'POST_JOINING': return 'Post-Joining Formalities';
          case 'ACTIVE': return 'Onboarding Completed';
          default: return stage;
      }
  };

  const getStageColor = (stage) => {
      if (stage === 'ACTIVE') return 'bg-emerald-100 text-emerald-800';
      if (stage === 'BASIC_INFO') return 'bg-yellow-100 text-yellow-800';
      return 'bg-blue-100 text-blue-800';
  };

  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-text-dark)">HR Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">Manage your assigned employees and track their progress.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-(--color-primary) hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium">Assigned Employees</p>
                    <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">{stats.total}</h3>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-(--color-primary)">
                    <Users size={24} />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-(--color-accent-orange) hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium">Pending Reviews</p>
                    <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">{stats.pending}</h3>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg text-(--color-accent-orange)">
                    <Clock size={24} />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-(--color-accent-sage) hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium">Onboarding Active</p>
                    <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">{stats.active}</h3>
                </div>
                <div className="p-2 bg-green-50 rounded-lg text-(--color-accent-sage)">
                    <Activity size={24} />
                </div>
            </div>
        </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-(--color-accent-green) hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium">Fully Onboarded</p>
                    <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">{stats.completed}</h3>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg text-(--color-accent-green)">
                    <CheckCircle size={24} />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-(--color-secondary)">My Assigned Employees</h2>
                <button onClick={() => navigate('/hr-admin/employees')} className="text-sm text-blue-600 hover:underline">View All</button>
            </div>
            <div className="space-y-4">
                {assignedEmployees.length > 0 ? (
                    assignedEmployees.slice(0, 5).map((emp) => (
                        <div key={emp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="flex items-center gap-4">
                                {emp.profilePhoto ? (
                                    <img src={emp.profilePhoto} alt={emp.firstName} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-(--color-primary) text-white flex items-center justify-center font-bold uppercase">
                                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-semibold text-(--color-text-dark)">{emp.firstName} {emp.lastName}</h4>
                                    <p className="text-sm text-gray-500">Stage: {getStageLabel(emp.onboarding_stage)}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStageColor(emp.onboarding_stage)}`}>
                                {emp.onboarding_stage.replace('_', ' ')}
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
                <button className="p-4 border border-dashed border-gray-300 rounded-xl hover:border-(--color-primary) hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-(--color-primary)">
                    <FileText size={24} />
                    <span className="font-medium">Verify Forms</span>
                </button>
                <button className="p-4 border border-dashed border-gray-300 rounded-xl hover:border-(--color-accent-green) hover:bg-green-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-(--color-accent-green)">
                    <CheckCircle size={24} />
                    <span className="font-medium">Complete Onboarding</span>
                </button>
             </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
