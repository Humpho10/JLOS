import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from './AdminAuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import AdminLayout from './AdminLayout.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminInboxPage from './pages/AdminInboxPage.jsx';
import AdminInstitutionsPage from './pages/AdminInstitutionsPage.jsx';
import AdminInstitutionDetailPage from './pages/AdminInstitutionDetailPage.jsx';
import './admin.css';

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/inbox" replace />} />
            <Route path="inbox" element={<AdminInboxPage />} />

            <Route element={<ProtectedRoute roles={['super_admin']} />}>
              <Route path="institutions" element={<AdminInstitutionsPage />} />
              <Route path="institutions/:id" element={<AdminInstitutionDetailPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}
