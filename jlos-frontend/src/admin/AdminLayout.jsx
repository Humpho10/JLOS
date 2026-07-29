import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext.jsx';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
          isActive ? 'bg-brand-navy text-white' : 'text-brand-muted hover:bg-black/5 hover:text-brand-text'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const initial = (user?.name || '?').charAt(0).toUpperCase();

  return (
    <div className="admin-shell">
      <div className="sticky top-0 z-10 border-b border-brand-line bg-brand-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 font-semibold text-brand-navy">
            <span aria-hidden="true">⚖️</span>
            JLOS Admin
          </div>
          <nav className="flex items-center gap-2">
            <NavItem to="/admin/inbox">Inbox</NavItem>
            {user?.role === 'super_admin' && <NavItem to="/admin/institutions">Institutions</NavItem>}
            <div className="mx-2 hidden items-center gap-2 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold/20 text-xs font-semibold text-brand-navy">
                {initial}
              </div>
              <span className="text-sm text-brand-muted">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-brand-line px-3 py-1.5 text-sm text-brand-text transition hover:border-brand-navy-3 hover:text-brand-navy"
            >
              Sign out
            </button>
          </nav>
        </div>
      </div>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
