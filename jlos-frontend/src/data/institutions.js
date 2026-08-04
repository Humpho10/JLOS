// ============================================================
// The 5 JLOS institutions currently in scope. `icon` keys map to the
// path lookup in ../utils/InstitutionIcon.jsx.
//
// `phone` is a PLACEHOLDER toll-free number — swap in the real one per
// institution before going live.
//
// `website` is the institution's own site — the home page pills link
// straight out to it (see HomePage.jsx) instead of opening the
// in-portal directory.
//
// `chatSlug` maps to the jlos-chatbot backend's institution slug (see
// jlos-chatbot's Institution model). Only institutions with a `chatSlug`
// have scraped/embedded content and can run the AI-scoped chat on their
// contact page; others fall back to phone-only contact.
// ============================================================

export const institutions = [
  {
    code: 'MOJ', short: 'Justice', name: 'Ministry of Justice and Constitutional Affairs', sub: 'Legal services & regulation',
    color: '#0E2A47', icon: 'scale', chatSlug: 'moj', phone: '0800 100 001', website: 'https://justice.go.ug/',
    logo: 'https://justice.go.ug/wp-content/uploads/2022/09/Ministry-of-Justice-Website-cut-pix-08-1.png',
    services: ['Inspection of chambers', 'Disciplinary committee', 'Filing a complaint', 'Seeing a state attorney', 'Legal education', 'Legal aid'],
  },
  {
    code: 'UHRC', short: 'UHRC', name: 'Uganda Human Rights Commission', sub: 'Human rights protection',
    color: '#7C2333', icon: 'heart', chatSlug: 'uhrc', phone: '0800 100 003', website: 'https://uhrc.ug/',
    logo: 'https://uhrc.ug/wp-content/uploads/2025/03/uhrc-logo.png',
    services: ['Complaints', 'Press / media relations', 'Inquiries', 'Clearance requests'],
  },
  {
    code: 'ODPP', short: 'ODPP', name: 'Office of the Director of Public Prosecutions', sub: 'Criminal prosecutions',
    color: '#C79A2E', icon: 'briefcase', chatSlug: 'dpp', phone: '0800 100 004', website: 'https://dpp.go.ug/',
    logo: 'https://dpp.go.ug/wp-content/uploads/2023/04/ODPP-ICON.png',
    services: ['Case perusal & sanctioning', 'Criminal proceedings', 'Criminal investigations', 'Private prosecutions'],
  },
  {
    code: 'TAT', short: 'TAT', name: 'Tax Appeals Tribunal', sub: 'Tax dispute resolution',
    color: '#1F8A57', icon: 'receipt', chatSlug: 'tat', phone: '0800 100 005', website: 'https://tat.go.ug/',
    logo: 'https://tat.go.ug/wp-content/uploads/2023/09/tribunal-logo1.png',
    services: ['Filing', 'Hearings (online)', 'Consultation', 'Follow-up on cases'],
  },
  {
    code: 'JSC', short: 'JSC', name: 'Judicial Service Commission', sub: 'Judicial appointments & discipline',
    color: '#123A61', icon: 'landmark', chatSlug: 'jsc', phone: '0800 100 006', website: 'https://www.jsc.go.ug/',
    logo: 'https://www.jsc.go.ug/wp-content/themes/jsc/img/0.png',
    services: ['Judicial appointments', 'Complaints against judicial officers', 'Case status lookup', 'Court schedules'],
  },
];
