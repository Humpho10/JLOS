import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.jsx';

// Shared shell for every dialog in the portal. Beyond the visual frame it
// provides the accessibility contract for a modal: role="dialog" +
// aria-modal, a label wired to the heading, focus moved into the dialog on
// open, a Tab focus-trap while open, and focus restored to the triggering
// control on close.
export default function ModalShell({ id, title, wide = false, children }) {
  const { isModalOpen, closeModal } = useApp();
  const open = isModalOpen(id);
  const dialogRef = useRef(null);
  const restoreRef = useRef(null);
  const titleId = `${id}-title`;

  useEffect(() => {
    if (!open) return undefined;

    // Remember where focus was, then move it into the dialog.
    restoreRef.current = document.activeElement;
    const dialog = dialogRef.current;
    const focusables = () =>
      dialog.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    const first = focusables()[0];
    (first || dialog).focus();

    function onKeyDown(e) {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) { e.preventDefault(); return; }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
    dialog.addEventListener('keydown', onKeyDown);

    return () => {
      dialog.removeEventListener('keydown', onKeyDown);
      // Restore focus to whatever opened the modal.
      if (restoreRef.current && restoreRef.current.focus) restoreRef.current.focus();
    };
  }, [open]);

  return (
    <div
      className={`modal-overlay-web ${open ? 'show' : ''}`}
      id={id}
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(id); }}
    >
      <div
        className={`modal-dialog ${wide ? 'wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={dialogRef}
      >
        <h3 id={titleId}>
          {title}
          <button
            type="button"
            className="modal-close"
            onClick={() => closeModal(id)}
            aria-label="Close dialog"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </h3>
        {children}
      </div>
    </div>
  );
}
