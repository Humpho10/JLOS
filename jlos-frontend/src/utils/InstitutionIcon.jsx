// ============================================================
// Institution icon glyphs — same path data as the original
// prototype's iconSvg() helper. Used both for institutions with
// no logo image, and as the fallback rendered when a logo <img>
// fails to load (see InstitutionCard.jsx).
// ============================================================

const PATHS = {
  scale: (
    <>
      <path d="M12 3v18" />
      <path d="M5 7l7-4 7 4" />
      <path d="M5 7l-3 8a4 4 0 0 0 8 0z" />
      <path d="M19 7l-3 8a4 4 0 0 0 8 0z" />
      <path d="M8 21h8" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6" />
    </>
  ),
  heart: (
    <path d="M12 21s-6.5-4.35-9-8.5C1 8.5 3 5 6.5 5 9 5 12 7.5 12 7.5S15 5 17.5 5C21 5 23 8.5 21 12.5 18.5 16.65 12 21 12 21z" />
  ),
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M2 13h20" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" />
      <path d="M9 7h6M9 11h6" />
    </>
  ),
  landmark: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V10M9 21V10M15 21V10M19 21V10" />
      <path d="M2 10l10-6 10 6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
};

export default function InstitutionIcon({ type, color = '#fff' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[type] || PATHS.scale}
    </svg>
  );
}
