import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../Components/Layout/DashboardLayout';
import { LayoutList, CheckCircle, Clock, AlertCircle, ArrowRight, Lock } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/employees/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
      return (
          <DashboardLayout>
              <div className="flex justify-center items-center h-64">
                  <div className="text-gray-500 animate-pulse">Loading dashboard...</div>
              </div>
          </DashboardLayout>
      )
  }

  const { progress, basicInfoStatus, onboardingStage, nextAction } = stats || {};

  // Helper to determine stage styles
  const getBasicInfoStage = () => {
    if (basicInfoStatus === 'VERIFIED') return { status: 'Completed', color: 'green', icon: CheckCircle };
    if (basicInfoStatus === 'SUBMITTED') return { status: 'Under Review', color: 'yellow', icon: Clock };
    if (basicInfoStatus === 'REJECTED') return { status: 'Action Needed', color: 'red', icon: AlertCircle };
    return { status: 'Pending', color: 'blue', icon: AlertCircle };
  };

  const getPreJoiningStage = () => {
      // Logic relies on onboardingStage sequence
      if (['POST_JOINING', 'ACTIVE'].includes(onboardingStage)) return { status: 'Completed', color: 'green', icon: CheckCircle };
      if (onboardingStage === 'PRE_JOINING') return { status: 'In Progress', color: 'blue', icon: Clock };
      return { status: 'Locked', color: 'gray', icon: Lock };
  };

  const getPostJoiningStage = () => {
     if (onboardingStage === 'ACTIVE') return { status: 'Completed', color: 'green', icon: CheckCircle }; // Or In Progress if we had granular tracking
     if (onboardingStage === 'POST_JOINING') return { status: 'In Progress', color: 'blue', icon: Clock };
     return { status: 'Locked', color: 'gray', icon: Lock };
  };

  const basicInfo = getBasicInfoStage();
  const preJoining = getPreJoiningStage();
  const postJoining = getPostJoiningStage();

  const handleCardClick = (path, isLocked) => {
      if (!isLocked) navigate(path);
  }

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
                    <p className="text-sm text-gray-500">Your journey to becoming an official team member.</p>
                </div>
                <span className="text-2xl font-bold text-(--color-primary)">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-(--color-primary) h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           {/* Steps Cards */}
           <div 
                onClick={() => handleCardClick('/employee/basic-info', false)}
                className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-${basicInfo.color}-500 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow`}
            >
                <div className={`absolute top-4 right-4 text-${basicInfo.color}-500 opacity-20`}><basicInfo.icon size={40} /></div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">1. Basic Details</h3>
                <p className="text-sm text-gray-500 mb-4">Personal information and contact details.</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold text-${basicInfo.color}-600 bg-${basicInfo.color}-50 px-2 py-1 rounded`}>
                    <basicInfo.icon size={12} /> {basicInfo.status}
                </span>
           </div>

           <div 
                onClick={() => handleCardClick('/employee/pre-joining', preJoining.status === 'Locked')}
                className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-${preJoining.color}-500 relative overflow-hidden ${preJoining.status === 'Locked' ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'} transition-all`}
            >
                <div className={`absolute top-4 right-4 text-${preJoining.color}-500 opacity-20`}><preJoining.icon size={40} /></div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">2. Pre-Joining Forms</h3>
                <p className="text-sm text-gray-500 mb-4">Documents required before your first day.</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold text-${preJoining.color}-600 bg-${preJoining.color}-50 px-2 py-1 rounded`}>
                    <preJoining.icon size={12} /> {preJoining.status}
                </span>
           </div>

            <div 
                onClick={() => handleCardClick('/employee/post-joining', postJoining.status === 'Locked')}
                className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-${postJoining.color}-300 relative overflow-hidden ${postJoining.status === 'Locked' ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'} transition-all`}
            >
                <div className={`absolute top-4 right-4 text-${postJoining.color}-400 opacity-20`}><postJoining.icon size={40} /></div>
                <h3 className="font-bold text-lg mb-2 text-gray-600">3. Post-Joining Forms</h3>
                <p className="text-sm text-gray-500 mb-4">Paperwork to be done on your joining date.</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold text-${postJoining.color}-500 bg-${postJoining.color}-100 px-2 py-1 rounded`}>
                    <postJoining.icon size={12} /> {postJoining.status}
                </span>
           </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
