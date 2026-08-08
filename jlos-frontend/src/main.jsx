import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '../resources/css/app.css';

// The public site has no real URL routing (every page is just React state —
// see AppContext's goToPage). /admin is the one deliberate exception: a
// path nothing in the public UI links to, so regular visitors never see it
// exists, while an admin can reach it by typing the URL directly.
const isAdminPath = window.location.pathname.startsWith('/admin');

async function render() {
  const Root = isAdminPath
    ? (await import('./admin/AdminApp.jsx')).default
    : App;

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
}

render();
