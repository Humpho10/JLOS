import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ToastHost() {
  const { toasts } = useApp();
  return (
    <div className="toast-host-web" id="toastHost" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>{t.msg}</div>
      ))}
    </div>
  );
}
