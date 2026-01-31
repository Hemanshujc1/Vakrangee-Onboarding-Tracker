import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard if role doesn't match
    if (user.role === 'HR_SUPER_ADMIN') return <Navigate to="/hr-super-admin" replace />;
    if (user.role === 'HR_ADMIN') return <Navigate to="/hr-admin" replace />;
    if (user.role === 'EMPLOYEE') return <Navigate to="/employee" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
