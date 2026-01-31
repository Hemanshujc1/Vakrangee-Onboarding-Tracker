import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-(--color-bg-light)">
      {/* Mobile Header for Hamburger */}
      <div className="lg:hidden p-4 bg-(--color-secondary) text-white flex items-center shadow-md sticky top-0 z-40">
        <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
          <Menu size={24} />
        </button>
        <span className="ml-4 font-bold tracking-wider">VAKRANGEE</span>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="lg:ml-64 p-4 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main> 
    </div>
  ); 
};

export default DashboardLayout;
