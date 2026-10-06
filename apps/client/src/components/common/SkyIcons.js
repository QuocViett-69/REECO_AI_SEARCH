import React from 'react';

/* Sky icon set: monoline 24px glyphs with round caps, plus the two filled marks of the
   sky theme — the blue check disc and the scalloped colour seal (like a rubber stamp on
   an invoice). Every icon is decorative unless a `title` is passed. */

function Svg({ size = 20, title, children, viewBox = '0 0 24 24', ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const IconArrowLeft = (props) => (
  <Svg {...props}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>
);

export const IconArrowUpRight = (props) => (
  <Svg {...props}><path d="M7 17 17 7M8 7h9v9" /></Svg>
);

export const IconPlus = (props) => (
  <Svg {...props}><path d="M12 5v14M5 12h14" /></Svg>
);

export const IconMinus = (props) => (
  <Svg {...props}><path d="M5 12h14" /></Svg>
);

export const IconCheck = (props) => (
  <Svg {...props}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>
);

export const IconCompare = (props) => (
  <Svg {...props}><path d="M4 8h13M13 4l4 4-4 4M20 16H7M11 12l-4 4 4 4" /></Svg>
);

export const IconHeart = ({ filled = false, ...props }) => (
  <Svg {...props}>
    <path
      d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z"
      fill={filled ? 'currentColor' : 'none'}
    />
  </Svg>
);

/* Filled blue disc with a white check — the theme's list bullet */
export const CheckDisc = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={`sky-check ${className}`}>
    <circle cx="12" cy="12" r="12" fill="currentColor" />
    <path d="m7 12.4 3.2 3.2L17 8.8" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Scalloped stamp outline, 14 bumps around a 24px circle */
const SEAL_PATH = (() => {
  const bumps = 14;
  const points = [];
  for (let i = 0; i < bumps * 2; i += 1) {
    const angle = (Math.PI * i) / bumps - Math.PI / 2;
    const radius = i % 2 === 0 ? 12 : 10.6;
    points.push(`${(12 + radius * Math.cos(angle)).toFixed(2)} ${(12 + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return `M${points.join(' L')} Z`;
})();

const SEAL_GLYPHS = {
  doc: <path d="M9 7.5h4.5L15.5 9.5v7h-6.5v-9ZM10.8 12h3M10.8 14.4h3" />,
  book: <path d="M7.5 8.5c1.8-.6 3.3-.4 4.5.6 1.2-1 2.7-1.2 4.5-.6v7.5c-1.8-.6-3.3-.4-4.5.6-1.2-1-2.7-1.2-4.5-.6v-7.5ZM12 9.1v7.5" />,
  plus: <path d="M12 8v8M8 12h8" />,
  down: <path d="M12 7.5v7M9 11.8l3 3 3-3M8.5 16.5h7" />,
  bolt: <path d="m12.8 7-3.6 5.4h3.4L11.2 17l3.6-5.4h-3.4L12.8 7Z" />,
  wave: <path d="M7 12h2l1.5-3.5 3 7L15 12h2" />,
  alert: <path d="M12 8v4.6M12 15.8v.1" />,
};

/* Colour stamp with a white glyph: tone is iris, leaf, coral, blue or ink */
export const Seal = ({ glyph = 'doc', tone = 'blue', size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    className={`sky-seal sky-seal--${tone} ${className}`}
  >
    <path d={SEAL_PATH} fill="currentColor" />
    <g fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {SEAL_GLYPHS[glyph]}
    </g>
  </svg>
);
