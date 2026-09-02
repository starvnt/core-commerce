// Minimal inline SVG icon set — keeps bundle small, fully styleable
const make = (path, viewBox = '0 0 24 24') => ({ size = 18, className = '', strokeWidth = 1.8, ...rest }) => (
  <svg width={size} height={size} viewBox={viewBox} fill="none" stroke="currentColor"
       strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
       className={className} {...rest}>
    {path}
  </svg>
);

const paths = {
  home: <><path d="M3 12l9-9 9 9" /><path d="M5 10v10h14V10" /></>,
  discover: <><circle cx="12" cy="12" r="9" /><path d="M16 8l-1.5 4.5L10 14l4.5-1.5L16 8z" /></>,
  inbox: <><path d="M3 13l4-2 5 4 5-4 4 2" /><path d="M3 13v6h18v-6" /></>,
  spark: <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /><circle cx="12" cy="12" r="3" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-1a6 6 0 0112 0v1" /><circle cx="17" cy="9" r="2.5" /><path d="M14 14.5a5 5 0 017 4.5V20" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" /><path d="M3 13h18" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>,
  money: <><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M7 9.5h.01M17 14.5h.01" /></>,
  bolt: <><path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" /></>,
  doc: <><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
  chat: <><path d="M21 12a8 8 0 11-3.2-6.4L21 4l-1 4.8A8 8 0 0121 12z" /><circle cx="9" cy="12" r="0.8" fill="currentColor" /><circle cx="12" cy="12" r="0.8" fill="currentColor" /><circle cx="15" cy="12" r="0.8" fill="currentColor" /></>,
  checklist: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9l2 2 4-4M8 15l2 2 4-4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  bell: <><path d="M18 16v-5a6 6 0 10-12 0v5l-2 3h16l-2-3z" /><path d="M10 21a2 2 0 004 0" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  edit: <><path d="M4 20h4l11-11-4-4L4 16v4z" /><path d="M14 6l4 4" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>,
  x: <><path d="M6 6l12 12M18 6L6 18" /></>,
  chevron: <><path d="M9 6l6 6-6 6" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  check: <><path d="M5 12l5 5L20 7" /></>,
  refresh: <><path d="M3 12a9 9 0 0115-6l3 3M21 12a9 9 0 01-15 6l-3-3M3 3v6h6M21 21v-6h-6" /></>,
  star: <><path d="M12 3l2.6 6 6.4.5-4.9 4 1.5 6.5L12 16.8 6.4 20l1.5-6.5L3 9.5 9.4 9z" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></>,
  bookmark: <><path d="M6 3h12v18l-6-4-6 4V3z" /></>,
  cog: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 00-.1-1.3l2-1.6-2-3.5-2.4.9a7 7 0 00-2.2-1.3L14 3h-4l-.3 2.2a7 7 0 00-2.2 1.3l-2.4-.9-2 3.5 2 1.6A7 7 0 005 12c0 .4 0 .9.1 1.3l-2 1.6 2 3.5 2.4-.9a7 7 0 002.2 1.3L10 21h4l.3-2.2a7 7 0 002.2-1.3l2.4.9 2-3.5-2-1.6c.1-.4.1-.9.1-1.3z" /></>,
  link: <><path d="M10 14l4-4M9 7h-2a5 5 0 000 10h2M15 7h2a5 5 0 010 10h-2" /></>,
  send: <><path d="M3 20l18-8L3 4l3 8-3 8z" /><path d="M6 12h12" /></>,
  logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></>,
  partner: <><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h2M13 9h2M9 13h2M13 13h2M9 17h6" /></>,
  shield: <><path d="M12 3l8 4v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4z" /></>,
  flag: <><path d="M4 22V4M4 4h13l-2 4 2 4H4" /></>,
  zap: <><path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" /></>,
  gift: <><rect x="3" y="9" width="18" height="11" rx="1" /><path d="M3 13h18M12 9v11M8 9c0-2 2-3 4-3s4 1 4 3" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  phone: <><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></>,
};

export default function Icon({ name, ...rest }) {
  const path = paths[name];
  if (!path) return null;
  return make(path)({ ...rest });
}

export const IconKeys = Object.keys(paths);
