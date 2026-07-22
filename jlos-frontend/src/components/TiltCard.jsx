import React, { useCallback, useRef } from 'react';

// ============================================================
// Cursor-tracked 3D tilt, ported from the original tilt.js.
// Pointer-fine devices only (skips touch) — same
// `(hover: hover) and (pointer: fine)` check as before.
// ============================================================

const supportsHoverTilt = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export default function TiltCard({ as: Tag = 'div', className = '', maxTilt = 5, onClick, children, ...rest }) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!supportsHoverTilt() || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg) translateY(-4px) scale(1.012)`;
    ref.current.style.boxShadow = '0 24px 40px rgba(14,42,71,.16)';
  }, [maxTilt]);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = '';
    ref.current.style.boxShadow = '';
  }, []);

  return (
    <Tag
      ref={ref}
      className={`tilt-card ${className}`.trim()}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </Tag>
  );
}
