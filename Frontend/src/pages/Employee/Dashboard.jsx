import React from 'react';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import { LayoutList, BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const progress = 25; 
    
  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-(--color-text-dark)">Employee Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome! Complete your onboarding tasks to get started.</p>
      </header>

      {/* Progress Overview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-lg font-bold text-(--color-secondary)">Onboarding Progress</h2>
                    <p className="text-sm text-gray-500">2 of 8 steps completed</p>
                </div>
                <span className="text-2xl font-bold text-(--color-primary)">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-(--color-primary) h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           {/* Steps Cards */}
           <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-green-500 opacity-20"><CheckCircle size={40} /></div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">1. Basic Details</h3>
                <p className="text-sm text-gray-500 mb-4">Personal information and contact details.</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                    <CheckCircle size={12} /> Completed
                </span>
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-blue-500 opacity-20"><Clock size={40} /></div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">2. Pre-Joining Forms</h3>
                <p className="text-sm text-gray-500 mb-4">Documents required before your first day.</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    <Clock size={12} /> In Progress
                </span>
           </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-gray-300 relative overflow-hidden opacity-75">
                <div className="absolute top-4 right-4 text-gray-400 opacity-20"><LayoutList size={40} /></div>
                <h3 className="font-bold text-lg mb-2 text-gray-600">3. Post-Joining Forms</h3>
                <p className="text-sm text-gray-500 mb-4">Paperwork to be done on your joining date.</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Locked
                </span>
           </div>
      </div>
      
      {/* Notifications / Next Steps */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
        <div className="text-blue-500 mt-1">
            <AlertCircle size={24} />
        </div>
        <div>
            <h4 className="font-bold text-blue-800 mb-1">Action Required</h4>
            <p className="text-blue-700 text-sm">Please complete your <strong>Pre-Joining Forms</strong>. Your assigned HR Admin will review them shortly.</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Go to Forms
            </button>
        </div>
      </div>

    </DashboardLayout>
  );
};

export default Dashboard;
