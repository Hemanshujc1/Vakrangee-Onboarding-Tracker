import React from 'react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import { Users, Clock, CheckCircle, Activity, FileText } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorVar }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-(--color-text-dark)">{value}</h3>
      </div>
      <div className="p-3 rounded-full opacity-20" style={{ backgroundColor: `var(${colorVar})`, color: `var(${colorVar})` }}>
        <Icon size={24} style={{ opacity: 1, color: `var(${colorVar})` }} /> {/* Re-applying color to icon for visibility */}
      </div>
    </div>
    <div className="absolute top-6 right-6 p-3 rounded-full" style={{ backgroundColor: `var(${colorVar})`, opacity: 0.1 }}></div>
    <div className="absolute top-6 right-6 p-3 rounded-full text-transparent">
        <Icon size={24} style={{ fill: `var(${colorVar})`, stroke: `var(${colorVar})` }} /> 
    </div>
  </div>
);

const SimpleStatCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-(--color-text-dark)">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${bgColor} ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);


const Dashboard = () => {
  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-text-dark)">HR Super Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back! Here's an overview of the onboarding status.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-(--color-primary) hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium">Total Employees</p>
                    <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">1,234</h3>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-(--color-primary)">
                    <Users size={24} />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-(--color-accent-orange) hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium">Pending Approvals</p>
                    <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">28</h3>
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
                    <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">45</h3>
                </div>
                <div className="p-2 bg-green-50 rounded-lg text-(--color-accent-sage)">
                    <Activity size={24} />
                </div>
            </div>
        </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-(--color-accent-green) hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium">Completed</p>
                    <h3 className="text-3xl font-bold mt-2 text-(--color-secondary)">156</h3>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg text-(--color-accent-green)">
                    <CheckCircle size={24} />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-(--color-secondary)">Pending Verifications</h2>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-(--color-secondary) text-white flex items-center justify-center font-bold">
                                JD
                            </div>
                            <div>
                                <h4 className="font-semibold text-(--color-text-dark)">New Employee {i}</h4>
                                <p className="text-sm text-gray-500">Submitted Pre-joining Forms</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Pending</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold mb-4 text-(--color-secondary)">Quick Actions</h2>
             <div className="grid grid-cols-2 gap-4">
                <button className="p-4 border border-dashed border-gray-300 rounded-xl hover:border-(--color-text-dark) hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-(--color-primary)">
                    <Users size={24} />
                    <span className="font-medium">Add Employee</span>
                </button>
                <button className="p-4 border border-dashed border-gray-300 rounded-xl hover:border-(--color-accent-gold) hover:bg-yellow-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-(--color-accent-gold)">
                    <FileText size={24} />
                    <span className="font-medium">Review Forms</span>
                </button>
             </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
