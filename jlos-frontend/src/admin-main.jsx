import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './admin/AdminApp.jsx';

// Dedicated entry for admin.html — a real, separate build output the
// server can find directly, unlike the old approach (main.jsx checking
// window.location.pathname for "/admin" at runtime), which only worked if
// the server was configured to fall back to index.html for unknown paths.
// No pathname check needed here: this file only ever loads because
// admin.html was requested specifically.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);
