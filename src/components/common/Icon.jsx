const shapes = {
  cart: <><path d="M2 3h3l3 12h11l3-9H6M9 19h.01M18 19h.01" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></>,
  truck: <><path d="M1 4h13v13H1V4Zm13 5h5l4 5v3h-9M14 14h9" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="18" r="3" /></>,
  gift: <><path d="M3 10h18v12H3V10ZM2 6h20v4H2V6Zm10 0v16" /><path d="M12 6C4 6 5 0 8 1c3 0 4 5 4 5Zm0 0c8 0 7-6 4-5-3 0-4 5-4 5Z" /></>,
  filter: <><path d="M3 6h18M3 12h18M3 18h18" /><circle cx="8" cy="6" r="2" fill="currentColor" /><circle cx="16" cy="12" r="2" fill="currentColor" /><circle cx="10" cy="18" r="2" fill="currentColor" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  arrow: <><path d="M4 12h16M14 6l6 6-6 6" /></>,
  bag: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none" /></>,
  facebook: <><path d="M14 22V13h3l.5-4H14V6.5c0-1 .5-1.5 1.5-1.5H18V1.5c-.7-.2-2-.3-3.5-.3-3.3 0-5.5 2-5.5 5.5V9H6v4h3v9" /></>,
  whatsapp: <><path d="M20.5 11.5a8.8 8.8 0 0 1-13 7.7L2 21l1.8-5.4a8.8 8.8 0 1 1 16.7-4.1Z" /><path d="m8 7 1.5 3-1 1c1 2 2.5 3.5 4.5 4.5l1-1 3 1.5c-.5 2-2.5 2.5-4 1.5-3.5-1.5-6-4-7.5-7.5C4.5 8.5 5 6.5 7 6Z" transform="translate(1 -1) scale(.9)" /></>,
  diamond: <><path d="m2 8 5-6h10l5 6-10 14L2 8Zm0 0h20M7 2l5 20 5-20M7 8l5-6 5 6" /></>,
  person: <><circle cx="12" cy="6" r="4" /><path d="M4 22v-3a8 8 0 0 1 16 0v3H4Z" /></>,
  people: <><circle cx="9" cy="7" r="3" /><circle cx="17" cy="8" r="2.5" /><path d="M2.5 21v-2a6.5 6.5 0 0 1 13 0v2h-13Zm13-7a5 5 0 0 1 6 5v2h-3.5" /></>,
  star: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3 1.2-6.9-5-4.9 6.9-1L12 2Z" />,
  flower: <><path d="M12 21C5 19 2 14 2 9c4 0 7 2 10 7 3-5 6-7 10-7 0 5-3 10-10 12Z" /><path d="M12 21C7 15 6 8 12 2c6 6 5 13 0 19Z" /></>,
  heart: <path d="M20.5 4.5a5.5 5.5 0 0 0-8 0L12 5l-.5-.5a5.5 5.5 0 0 0-8 8L12 21l8.5-8.5a5.5 5.5 0 0 0 0-8Z" />,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  calendar: <><rect x="3" y="5" width="18" height="17" rx="2" /><path d="M7 2v6M17 2v6M3 11h18M7 15h1M12 15h1M17 15h1M7 18h1M12 18h1" /></>,
  sparkle: <><path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" /></>,
};
export default function Icon({ name, size = 24, className = '' }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name] || shapes.sparkle}</svg>;
}
