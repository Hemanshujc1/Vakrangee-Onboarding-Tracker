import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/HRSuperAdmin/Dashboard'
import ManageEmployees from './pages/HRSuperAdmin/ManageEmployees'
import ManageAdmins from './pages/HRSuperAdmin/ManageAdmins'
import AdminDetail from './pages/HRSuperAdmin/AdminDetail';
import EmployeeDetail from './pages/Shared/EmployeeDetail';
import MyProfile from './pages/HRSuperAdmin/MyProfile'
import MyEmployees from './pages/HRSuperAdmin/MyEmployees'

// HR Admin Pages
import HRAdminDashboard from './pages/HRAdmin/Dashboard'
import HRAdminEmployees from './pages/HRAdmin/ManageEmployees'
import HRAdminProfile from './pages/HRAdmin/MyProfile'

// Employee Pages
import EmployeeDashboard from './pages/Employee/Dashboard'
import BasicInformation from './pages/Employee/BasicInformation'
import Documents from './pages/Employee/Documents'
import PreJoiningForms from './pages/Employee/PreJoiningForms'
import PostJoiningForms from './pages/Employee/PostJoiningForms'
import MyHR from './pages/Employee/MyHR'


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      
      {/* HR Super Admin Routes */}
      <Route path="/hr-super-admin" element={<Dashboard />} />
      <Route path="/hr-super-admin/employees" element={<ManageEmployees />} />
      <Route path="/hr-super-admin/admins" element={<ManageAdmins />} />
      <Route path="/hr-super-admin/admins/:id" element={<AdminDetail />} />
      <Route path="/hr-super-admin/employees/:id" element={<EmployeeDetail />} />
      <Route path="/hr-super-admin/profile" element={<MyProfile />} />
      <Route path="/hr-super-admin/myemployees" element={<MyEmployees />} />

      {/* HR Admin Routes */}
      <Route path="/hr-admin" element={<HRAdminDashboard />} />
      <Route path="/hr-admin/employees" element={<HRAdminEmployees />} />
      <Route path="/hr-admin/employees/:id" element={<EmployeeDetail />} />
      <Route path="/hr-admin/profile" element={<HRAdminProfile />} />

      {/* Employee Routes */}
      <Route path="/employee" element={<EmployeeDashboard />} />
      <Route path="/employee/basic-info" element={<BasicInformation />} />
      <Route path="/employee/documents" element={<Documents />} />
      <Route path="/employee/pre-joining" element={<PreJoiningForms />} />
      <Route path="/employee/post-joining" element={<PostJoiningForms />} />
      <Route path="/employee/MyHr" element={<MyHR />} />
    </Routes>
  )
}

export default App
