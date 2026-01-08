import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, UserCog, UserCircle, LogOut, FileText, CheckCircle, User } from 'lucide-react';

import { useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/hr-super-admin');
  const isHrAdmin = location.pathname.startsWith('/hr-admin');
  const isEmployee = location.pathname.startsWith('/employee');

  const superAdminItems = [
    { name: 'Dashboard', icon: Home, path: '/hr-super-admin' },
    { name: 'Manage Employees', icon: Users, path: '/hr-super-admin/employees' },
    { name: 'My Employees', icon: Users, path: '/hr-super-admin/myemployees' },
    { name: 'Manage Admins', icon: UserCog, path: '/hr-super-admin/admins' },
    { name: 'My Profile', icon: UserCircle, path: '/hr-super-admin/profile' },
  ];

  const hrAdminItems = [
    { name: 'Dashboard', icon: Home, path: '/hr-admin' },
    { name: 'My Employees', icon: Users, path: '/hr-admin/employees' },
    { name: 'My Profile', icon: UserCircle, path: '/hr-admin/profile' },
  ];

  const employeeItems = [
    { name: 'Dashboard', icon: Home, path: '/employee' },
    { name: 'Basic Information', icon: UserCircle, path: '/employee/basic-info' },
    { name: 'Pre-Joining Forms', icon: FileText, path: '/employee/pre-joining' },
    { name: 'Documents', icon: FileText, path: '/employee/documents' },
    { name: 'Post-Joining Forms', icon: CheckCircle, path: '/employee/post-joining' },
    { name: 'My HR', icon: User, path: '/employee/MyHr' },
  ];

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login
    // Using window.location.href ensures a full reload, clearing any temporary state
    // Alternatively, use navigate('/login') for SPA navigation
    // navigating to '/' or '/login'
    window.location.href = '/login'; 
  };

  const navItems = [];
  if (isSuperAdmin) navItems.push(...superAdminItems);
  else if (isHrAdmin) navItems.push(...hrAdminItems);
  else if (isEmployee) navItems.push(...employeeItems);

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 text-white flex flex-col shadow-xl z-50"
      style={{ backgroundColor: 'var(--color-secondary)' }}>
      
      <div className="p-6 flex items-center justify-center border-b border-[rgba(255,255,255,0.1)]">
        <h1 className="text-xl font-bold tracking-wider">VAKRANGEE</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
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
  );
};

export default Sidebar;
