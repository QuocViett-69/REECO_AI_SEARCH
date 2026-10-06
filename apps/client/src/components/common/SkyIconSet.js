import React from 'react';

/* Sky icon set under the names the app used from @phosphor-icons/react, so a component
   switches by changing only its import. Monoline 24px glyphs, round caps and joins, drawn
   to match the sky theme (see SkyIcons.js for the check disc and colour seals).
   Props: size (px), weight ('bold' thickens the line, 'fill' fills closed shapes),
   className and any SVG attribute. Decorative unless aria-label or title is passed. */

function makeIcon(name, draw) {
  function Icon({ size = 16, weight, className = '', color = 'currentColor', title, ...rest }) {
    const filled = weight === 'fill';
    const labelled = Boolean(title || rest['aria-label']);
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={weight === 'bold' ? 2.3 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`sky-icon ${className}`.trim()}
        aria-hidden={labelled ? undefined : true}
        role={labelled ? 'img' : undefined}
        focusable="false"
        {...rest}
      >
        {title ? <title>{title}</title> : null}
        {draw(filled, color)}
      </svg>
    );
  }
  Icon.displayName = name;
  return Icon;
}

const fillIf = (filled, color) => (filled ? color : 'none');

/* ── Arrows and carets ── */
export const ArrowLeft = makeIcon('ArrowLeft', () => <path d="M19 12H5M11 6l-6 6 6 6" />);
export const ArrowUp = makeIcon('ArrowUp', () => <path d="M12 19V5M6 11l6-6 6 6" />);
export const ArrowUpRight = makeIcon('ArrowUpRight', () => <path d="M7 17 17 7M8 7h9v9" />);
export const ArrowsLeftRight = makeIcon('ArrowsLeftRight', () => (
  <path d="M4 8h13M13 4l4 4-4 4M20 16H7M11 12l-4 4 4 4" />
));
export const ArrowClockwise = makeIcon('ArrowClockwise', () => (
  <>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
    <path d="M19.5 4.5v4h-4" />
  </>
));
export const CaretDown = makeIcon('CaretDown', () => <path d="m6 9.5 6 6 6-6" />);
export const CaretRight = makeIcon('CaretRight', () => <path d="m9.5 6 6 6-6 6" />);

/* ── Marks ── */
export const Check = makeIcon('Check', () => <path d="m5 12.5 4.5 4.5L19 7.5" />);
export const Checks = makeIcon('Checks', () => <path d="m2.5 12.5 4 4L15 8M10.5 15.5l1 1L21 8" />);
export const X = makeIcon('X', () => <path d="M6 6l12 12M18 6 6 18" />);
export const Plus = makeIcon('Plus', () => <path d="M12 5v14M5 12h14" />);
export const Minus = makeIcon('Minus', () => <path d="M5 12h14" />);
export const List = makeIcon('List', () => <path d="M4 7h16M4 12h16M4 17h16" />);
export const CheckCircle = makeIcon('CheckCircle', (f, c) => (
  <>
    <circle cx="12" cy="12" r="9" fill={fillIf(f, c)} />
    <path d="m8 12.3 2.8 2.8L16 9.8" stroke={f ? '#fff' : c} />
  </>
));
export const XCircle = makeIcon('XCircle', (f, c) => (
  <>
    <circle cx="12" cy="12" r="9" fill={fillIf(f, c)} />
    <path d="m9 9 6 6M15 9l-6 6" stroke={f ? '#fff' : c} />
  </>
));
export const Info = makeIcon('Info', (f, c) => (
  <>
    <circle cx="12" cy="12" r="9" fill={fillIf(f, c)} />
    <path d="M12 11v5.5M12 7.8v.1" stroke={f ? '#fff' : c} />
  </>
));
export const WarningCircle = makeIcon('WarningCircle', (f, c) => (
  <>
    <circle cx="12" cy="12" r="9" fill={fillIf(f, c)} />
    <path d="M12 7.5V13M12 16.2v.1" stroke={f ? '#fff' : c} />
  </>
));
export const Warning = makeIcon('Warning', (f, c) => (
  <>
    <path d="M10.3 4.2 2.9 17.5A2 2 0 0 0 4.6 20.5h14.8a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" fill={fillIf(f, c)} />
    <path d="M12 9.5v4.2M12 17v.1" stroke={f ? '#fff' : c} />
  </>
));
export const SealCheck = makeIcon('SealCheck', (f, c) => (
  <>
    <path
      d="M12 2.8l2.1 1.6 2.6-.2.9 2.5 2.3 1.3-.6 2.6 1.1 2.4-2 1.7-.5 2.6-2.6.4-1.6 2.1-2.4-1-2.4 1-1.6-2.1-2.6-.4-.5-2.6-2-1.7 1.1-2.4-.6-2.6 2.3-1.3.9-2.5 2.6.2Z"
      fill={fillIf(f, c)}
    />
    <path d="m8.6 12.2 2.3 2.3 4.5-4.6" stroke={f ? '#fff' : c} />
  </>
));
export const CircleNotch = makeIcon('CircleNotch', () => <path d="M12 3.5a8.5 8.5 0 1 1-7.4 4.3" />);

/* ── Commerce ── */
export const ShoppingCart = makeIcon('ShoppingCart', (f, c) => (
  <>
    <path d="M3 4h2.2l2.3 11.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6" fill={fillIf(f, c)} />
    <circle cx="9.5" cy="20" r="1.2" />
    <circle cx="17" cy="20" r="1.2" />
  </>
));
export const ShoppingBag = makeIcon('ShoppingBag', (f, c) => (
  <>
    <path d="M5 7.5h14l-1 12.5H6L5 7.5Z" fill={fillIf(f, c)} />
    <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
  </>
));
export const Package = makeIcon('Package', (f, c) => (
  <>
    <path d="M12 3 4 7.3v9.4L12 21l8-4.3V7.3L12 3Z" fill={fillIf(f, c)} />
    <path d="M4 7.3 12 11.6l8-4.3M12 11.6V21M8 5.2l8 4.3" stroke={f ? '#fff' : c} />
  </>
));
export const Truck = makeIcon('Truck', () => (
  <>
    <path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3.5v3h-7" />
    <circle cx="6.5" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </>
));
export const CreditCard = makeIcon('CreditCard', () => (
  <>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="M3 10h18M7 15h3" />
  </>
));
export const Money = makeIcon('Money', () => (
  <>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 9.5v5M18 9.5v5" />
  </>
));
export const Trash = makeIcon('Trash', () => (
  <path d="M4.5 6.5h15M9.5 6.5V4.5h5v2M6.5 6.5l.8 13h9.4l.8-13M10 10.5v6M14 10.5v6" />
));
export const Heart = makeIcon('Heart', (f, c) => (
  <path
    d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z"
    fill={fillIf(f, c)}
  />
));

/* ── People, places, security ── */
export const User = makeIcon('User', (f, c) => (
  <>
    <circle cx="12" cy="8.5" r="4" fill={fillIf(f, c)} />
    <path d="M4.5 20.5c1.3-3.6 4.2-5.5 7.5-5.5s6.2 1.9 7.5 5.5" />
  </>
));
export const Buildings = makeIcon('Buildings', () => (
  <path d="M3 20.5h18M5 20.5V5.5l8-2v17M13 9.5l6 2v9M8.5 8.5h1.5M8.5 12h1.5M8.5 15.5h1.5M16 14h.5M16 17h.5" />
));
export const MapPin = makeIcon('MapPin', (f, c) => (
  <>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" fill={fillIf(f, c)} />
    <circle cx="12" cy="10" r="2.3" stroke={f ? '#fff' : c} />
  </>
));
export const EnvelopeSimple = makeIcon('EnvelopeSimple', () => (
  <>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </>
));
export const Phone = makeIcon('Phone', () => (
  <path d="M8.2 3.8 5.5 4.3C4.6 4.5 4 5.4 4.1 6.3c.8 7.2 6.4 12.8 13.6 13.6.9.1 1.8-.5 2-1.4l.5-2.7-3.6-1.6-1.9 2c-2.6-1.2-4.6-3.2-5.8-5.8l2-1.9-1.6-3.7Z" />
));
export const Shield = makeIcon('Shield', (f, c) => (
  <path d="M12 3 5 5.8v5.4c0 4.5 3 8.3 7 9.8 4-1.5 7-5.3 7-9.8V5.8L12 3Z" fill={fillIf(f, c)} />
));
export const ShieldCheck = makeIcon('ShieldCheck', (f, c) => (
  <>
    <path d="M12 3 5 5.8v5.4c0 4.5 3 8.3 7 9.8 4-1.5 7-5.3 7-9.8V5.8L12 3Z" fill={fillIf(f, c)} />
    <path d="m9 12 2.2 2.2L15.5 10" stroke={f ? '#fff' : c} />
  </>
));
export const Lock = makeIcon('Lock', () => (
  <>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v2" />
  </>
));
export const Key = makeIcon('Key', () => (
  <>
    <circle cx="8" cy="15" r="4" />
    <path d="m11 12 8.5-8.5M16 7l2.5 2.5M14 9l2 2" />
  </>
));
export const SignIn = makeIcon('SignIn', () => (
  <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M3.5 12h11M10.5 8l4 4-4 4" />
));
export const SignOut = makeIcon('SignOut', () => (
  <path d="M10 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4M9.5 12h11M16.5 8l4 4-4 4" />
));

/* ── Communication and status ── */
export const Bell = makeIcon('Bell', (f, c) => (
  <>
    <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15l1.5-2Z" fill={fillIf(f, c)} />
    <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
  </>
));
export const ChatCircleText = makeIcon('ChatCircleText', () => (
  <path d="M12 3.5a8.5 8.5 0 0 0-7.4 12.7L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5ZM8.5 10.5h7M8.5 14h4.5" />
));
export const ClockCounterClockwise = makeIcon('ClockCounterClockwise', () => (
  <>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9" />
    <path d="M4.5 4.5V9H9M12 8v4.5l3 2" />
  </>
));
export const WifiSlash = makeIcon('WifiSlash', () => (
  <path d="M4 4l16 16M2.5 9a15 15 0 0 1 5-2.8M21.5 9a15 15 0 0 0-9.3-3.5M5.5 12.5a10 10 0 0 1 4-2.3M18.5 12.5a10 10 0 0 0-2.4-1.7M9 16a4.5 4.5 0 0 1 6 0M12 19.5v.1" />
));

/* ── Search and editing ── */
export const MagnifyingGlass = makeIcon('MagnifyingGlass', () => (
  <>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </>
));
export const MagnifyingGlassMinus = makeIcon('MagnifyingGlassMinus', () => (
  <>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5M7.5 10.5h6" />
  </>
));
export const PencilSimple = makeIcon('PencilSimple', () => (
  <path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5 4 20ZM13.5 7l3 3" />
));
export const CloudSun = makeIcon('CloudSun', (f, c) => (
  <>
    <path d="M7.5 19.5h9a3.8 3.8 0 0 0 .3-7.6 5 5 0 0 0-9.5 1.3 3.2 3.2 0 0 0 .2 6.3Z" fill={fillIf(f, c)} />
    <path d="M16 4.5v-1M20.5 8.5h1M19.4 5.1l.7-.7M13.3 5.6a3.5 3.5 0 0 1 6 2.9" />
  </>
));

/* Phosphor's context provider is a no-op here; defaults come from the props above */
export const IconContext = React.createContext({});
