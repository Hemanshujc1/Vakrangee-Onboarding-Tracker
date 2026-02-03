import React, { useState, useEffect } from 'react'; 
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {Home, Users, UserPlus, UserCog, UserCircle, LogOut, FileText, CheckCircle, User, Building2, ListCheck, X} from 'lucide-react';
import axios from 'axios';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSuperAdmin = location.pathname.startsWith('/hr-super-admin');
  const isHrAdmin = location.pathname.startsWith('/hr-admin');
  const isEmployee = location.pathname.startsWith('/employee');

  const [employeeStage, setEmployeeStage] = useState(null);

  useEffect(() => {
    if (isEmployee) {
        const fetchStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('/api/employees/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEmployeeStage(res.data.onboardingStage);
            } catch (error) {
                console.error("Error fetching employee status:", error);
            }
        };
        fetchStatus();
    }
  }, [isEmployee]);

  const superAdminItems = [
    { name: 'Dashboard', icon: Home, path: '/hr-super-admin' },
    { name: 'Manage Admins', icon: UserCog, path: '/hr-super-admin/admins' },
    { name: 'Manage Employees', icon: UserPlus, path: '/hr-super-admin/employees' },
    { name: 'My Employees', icon: Users, path: '/hr-super-admin/myemployees' },
    { name: 'My Profile', icon: UserCircle, path: '/hr-super-admin/profile' },
  ];

  const hrAdminItems = [
    { name: 'Dashboard', icon: Home, path: '/hr-admin' },
    { name: 'My Employees', icon: Users, path: '/hr-admin/employees' },
    { name: 'Other Employees', icon: Users, path: '/hr-admin/other-employees' },
    { name: 'My Profile', icon: UserCircle, path: '/hr-admin/profile' },
  ];

  const employeeItems = [
    { name: 'Dashboard', icon: Home, path: '/employee' },
    { name: 'Basic Information', icon: UserCircle, path: '/employee/basic-info' },
    { name: 'Documents', icon: FileText, path: '/employee/documents' },
    { name: 'Pre-Joining Forms', icon: CheckCircle, path: '/employee/pre-joining' },
    { name: 'Post-Joining Forms', icon: CheckCircle, path: '/employee/post-joining' },
    { name: 'My HR', icon: User, path: '/employee/myHr' },
    { name: 'Company Overview', icon: Building2, path: '/employee/company-overview' },
    // { name: 'Check List', icon: ListCheck, path: '/employee/check-list' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login'); 
  };

  const navItems = [];
  if (isSuperAdmin) navItems.push(...superAdminItems);
  else if (isHrAdmin) navItems.push(...hrAdminItems);
  else if (isEmployee) {
    const filtered = employeeItems.filter(item => {
        if (item.path === '/employee/pre-joining') {
            return employeeStage && employeeStage !== 'BASIC_INFO' && employeeStage !== 'Not_joined';
        }
        if (item.path === '/employee/post-joining') {
            return ['POST_JOINING', 'ONBOARDED'].includes(employeeStage);
        }
        return true;
    });
    navItems.push(...filtered);
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 text-white flex flex-col shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: 'var(--color-secondary)' }}
      >
        
        <div className="p-6 flex items-center justify-between border-b border-[rgba(255,255,255,0.1)]">
          <h1 className="text-xl font-bold tracking-wider">VAKRANGEE</h1>
          <button onClick={onClose} className="lg:hidden text-white/80 hover:text-white transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>
  
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  end={item.path === '/hr-super-admin' || item.path === '/hr-admin' || item.path === '/employee'}
                  onClick={() => onClose && onClose()} // Close on navigation on mobile
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-(--color-primary) shadow-md font-semibold'
                        : 'hover:bg-[rgba(255,255,255,0.1)]'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
  
        <div className="p-4 border-t border-[rgba(255,255,255,0.1)]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors text-left text-red-300 hover:text-red-200 cursor-pointer"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
