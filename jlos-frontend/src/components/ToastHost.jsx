import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ToastHost() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="toast-host-web" id="toastHost" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <button
          type="button"
          className="toast"
          key={t.id}
          onClick={() => dismissToast(t.id)}
          aria-label={`${t.msg} — dismiss`}
        >
          {t.msg}
        </button>
      ))}
    </div>
  );
}
