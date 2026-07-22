// ============================================================
// The 8 JLOS institutions — same data as the original prototype.
// `icon` keys map to the path lookup in ../utils/icons.jsx.
// ============================================================

export const institutions = [
  {
    code: 'MOJ-LC', short: 'Law Council', name: 'Ministry of Justice — Law Council', sub: 'Regulation of the legal profession',
    color: '#0E2A47', icon: 'scale',
    logo: 'https://justice.go.ug/wp-content/uploads/2022/09/Ministry-of-Justice-Website-cut-pix-08-1.png',
    services: ['Inspection of chambers', 'Disciplinary committee', 'Filing a complaint', 'Seeing a state attorney', 'Legal education', 'Legal aid'],
  },
  {
    code: 'MOJ-AD', short: 'Administration', name: 'Ministry of Justice — Administration', sub: 'Registry & general services',
    color: '#1B4B7A', icon: 'file',
    logo: 'https://justice.go.ug/wp-content/uploads/2022/09/Ministry-of-Justice-Website-cut-pix-08-1.png',
    services: ['State authority filings', 'Opening a file', 'Mediation & family meetings', 'Certificate of no objection', 'General inquiries'],
  },
  {
    code: 'UHRC', short: 'UHRC', name: 'Uganda Human Rights Commission', sub: 'Human rights protection',
    color: '#7C2333', icon: 'heart',
    logo: 'https://www.uhrc.ug/themes/businessgroup_zymphonies_theme/img/uhrc-logo-symbol.png',
    services: ['Complaints', 'Press / media relations', 'Inquiries', 'Clearance requests'],
  },
  {
    code: 'ODPP', short: 'ODPP', name: 'Office of the Director of Public Prosecutions', sub: 'Criminal prosecutions',
    color: '#C79A2E', icon: 'briefcase',
    logo: 'https://dpp.go.ug/wp-content/uploads/2023/04/ODPP-ICON.png',
    services: ['Case perusal & sanctioning', 'Criminal proceedings', 'Criminal investigations', 'Private prosecutions'],
  },
  {
    code: 'TAT', short: 'TAT', name: 'Tax Appeals Tribunal', sub: 'Tax dispute resolution',
    color: '#1F8A57', icon: 'receipt',
    logo: 'https://tat.go.ug/wp-content/uploads/2023/09/tribunal-logo1.png',
    services: ['Filing', 'Hearings (online)', 'Consultation', 'Follow-up on cases'],
  },
  {
    code: 'JUD', short: 'Judiciary', name: 'The Judiciary', sub: 'Courts of law',
    color: '#123A61', icon: 'landmark',
    logo: 'https://www.judiciary.go.ug/images/logos.png',
    services: ['Case status lookup', 'Court schedules', 'Filing guidance'],
  },
  {
    code: 'UPF', short: 'Police', name: 'Uganda Police Force', sub: 'Law enforcement',
    color: '#5c1826', icon: 'shield',
    logo: 'https://upf.go.ug/wp-content/uploads/2024/09/cropped-upflogo-270x270.png',
    services: ['Report a crime', 'Case follow-up', 'Community policing'],
  },
  {
    code: 'UPS', short: 'Prisons', name: 'Uganda Prisons Service', sub: 'Custodial services',
    color: '#7C2333', icon: 'lock', logo: null,
    services: ['Visitation requests', 'Inmate inquiries'],
  },
];
