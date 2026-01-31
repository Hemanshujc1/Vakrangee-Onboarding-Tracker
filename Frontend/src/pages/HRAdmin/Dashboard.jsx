import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import { Users, Clock, CheckCircle, Activity, FileText, UserPlus } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getEmployeeStatus } from '../../utils/employeeUtils';

const StatCard = ({ title, value, icon: Icon, colorVar }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-(--color-text-dark)">{value}</h3>
      </div>
      <div className="p-3 rounded-full opacity-20" style={{ backgroundColor: `var(${colorVar})`, color: `var(${colorVar})` }}>
        <Icon size={24} style={{ opacity: 1, color: `var(${colorVar})` }} />
      </div>
    </div>
    <div className="absolute top-6 right-6 p-3 rounded-full" style={{ backgroundColor: `var(${colorVar})`, opacity: 0.1 }}></div>
    <div className="absolute top-6 right-6 p-3 rounded-full text-transparent">
        <Icon size={24} style={{ fill: `var(${colorVar})`, stroke: `var(${colorVar})` }} /> 
    </div>
  </div>
);

const Dashboard = () => {
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignedEmployees();
  }, []);

  const fetchAssignedEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user'); // Or 'userInfo' -> parse -> user
       // Note: In some parts of the code it uses 'userInfo' and in others 'user'. 
       // HRAdmin uses 'user' in the original code I read. I will try to support both or stick to what was there if it worked.
       // The original code used `localStorage.getItem('user')` and `localStorage.getItem('token')` separately? 
       // Actually `ManageAdmins` used `userInfo`. `ManageEmployees` used `userInfo`. 
       // HR Admin Dashboard original code used `localStorage.getItem('user')`.
       // I'll add a fallback to be safe.
      
      let userId = null;
      let authToken = token;

      if (!authToken) {
          const userInfo = localStorage.getItem("userInfo");
          if (userInfo) {
              const parsed = JSON.parse(userInfo);
              authToken = parsed.token;
          }
      }

      if (userStr) {
          const parsedUser = JSON.parse(userStr);
          userId = parsedUser.id; 
      } else {
          const userInfo = localStorage.getItem("userInfo");
          if (userInfo) {
             const parsed = JSON.parse(userInfo);
             userId = parsed.id || parsed.user?.id; // backend might return user object inside
          }
      }

      if (!authToken || !userId) return;

      const config = { headers: { Authorization: `Bearer ${authToken}` } };
      const { data } = await axios.get("/api/employees", config);

      const myEmployees = data.filter(emp => 
        emp.role === 'EMPLOYEE' && emp.onboardingHrId == userId
      );

      setAssignedEmployees(myEmployees);

      // Stats Logic matching Super Admin
      const total = myEmployees.length;
      
      const active = myEmployees.filter(e => {
        const status = getEmployeeStatus(e);
         return !['Completed', 'Not Joined'].includes(status);
      }).length;

      const completed = myEmployees.filter(e => getEmployeeStatus(e) === 'Completed').length;
      
      // For "Pending Reviews" in HR Admin context, let's say it counts "Profile Pending" 
      // or we can stick to "Active Onboarding" as the main metric. 
      // Let's keep "Pending Reviews" as "Profile Pending" specifically if that's useful, 
      // OR maybe "Ready to Join" (Pre-joining verified)?
      // Let's use "Profile Pending" + "In Progress" as "Pending Action" generally?
      // Actually, looking at Super Admin, "Pending Approvals" was hardcoded. 
      // Let's use "Profile Pending" as "Pending Reviews" because that implies HR needs to review the profile.
      const pending = myEmployees.filter(e => getEmployeeStatus(e) === 'Profile Pending' || getEmployeeStatus(e) === 'In Progress').length;


      setStats({ total, pending, active, completed });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
        setLoading(false);
    }
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
                    <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">{loading ? '-' : stats.total}</h3>
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
                    <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">{loading ? '-' : stats.pending}</h3>
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
                    <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">{loading ? '-' : stats.active}</h3>
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
                    <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">{loading ? '-' : stats.completed}</h3>
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
                <button onClick={() => navigate('/hr-admin/employees')} className="text-sm text-(--color-primary) hover:underline font-medium">View All</button>
            </div>
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-4 text-gray-500">Loading...</div>
                ) : assignedEmployees.length > 0 ? (
                    assignedEmployees.slice(0, 5).map((emp) => (
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
                    onClick={() => navigate('/hr-admin/profile')} // Or complete onboarding action
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
