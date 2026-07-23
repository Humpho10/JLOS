// ============================================================
// Presentation metadata (icon, color, service blurbs) for the
// institutions that actually have scraped/embedded content behind
// them in the backend. Keyed by the backend's `slug` — anything
// returned by GET /api/institutions that isn't listed here still
// renders (with sensible defaults) instead of breaking, so this
// stays safe as more institutions get added on the backend.
// ============================================================

export const institutionMeta = {
  dpp: {
    color: '#C79A2E', icon: 'briefcase',
    sub: 'Criminal prosecutions',
    services: ['Filing a complaint', 'Case status & prosecutions', 'Contact & locations', 'Leadership & structure'],
  },
  uhrc: {
    color: '#7C2333', icon: 'heart',
    sub: 'Human rights protection',
    services: ['Complaints', 'Press & media relations', 'Tribunal & decisions', 'Reports & publications'],
  },
  judiciary: {
    color: '#123A61', icon: 'landmark',
    sub: 'Courts of law',
    services: ['Court structure & appeals', 'Filing guidance', 'Case status lookup', 'Reporting misconduct'],
  },
};

const DEFAULT_META = {
  color: '#0E2A47', icon: 'scale', sub: 'JLOS institution',
  services: ['Ask Justice AI about this institution'],
};

// Merge a backend institution ({id, name, slug, base_url}) with its
// presentation metadata, falling back to generic defaults for any
// institution not yet listed above.
export function enrichInstitution(inst) {
  const meta = institutionMeta[inst.slug] || DEFAULT_META;
  return { ...meta, ...inst, code: inst.slug.toUpperCase() };
}

// Institutions on the JLOS roadmap that don't have live content yet —
// shown as a plain, non-interactive list so the roadmap is visible
// without inviting anyone to click into something that doesn't work.
export const comingSoonInstitutions = [
  { code: 'MOJ-LC', name: 'Ministry of Justice — Law Council' },
  { code: 'MOJ-AD', name: 'Ministry of Justice — Administration' },
  { code: 'TAT', name: 'Tax Appeals Tribunal' },
  { code: 'UPF', name: 'Uganda Police Force' },
  { code: 'UPS', name: 'Uganda Prisons Service' },
];
