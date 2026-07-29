import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext.jsx';

export default function ProtectedRoute({ roles }) {
  const { token, user, ready } = useAdminAuth();

  if (!ready) return null;
  if (!token || !user) return <Navigate to="/admin/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/admin" replace />;

  return <Outlet />;
}
