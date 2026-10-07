import React, { useId } from 'react';

// Cut-paper illustration of a Campbell field station: a datalogger enclosure on a mast,
// a cup anemometer and wind vane, a solar panel, a soil probe under the hill, a rain
// cloud and the sun. Flat fills, ink outlines, nothing photographic.
const INK = '#222222';

export function PaperCutStation({ className = '', title, sun = '#ffdd00', ink = INK }) {
  const decorative = !title;
  const groundId = `pc-ground-${useId().replace(/:/g, '')}`;
  return (
    <svg
      className={`pc-station ${className}`}
      viewBox="0 0 440 380"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={title}
      fill="none"
      stroke={ink}
      strokeWidth="3.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* Sun */}
      <circle cx="342" cy="78" r="46" fill={sun} />
      <path d="M342 14v-8M342 150v-8M278 78h-8M414 78h-8M297 33l-6-6M393 129l-6-6M387 33l6-6M291 129l6-6" />

      {/* Rain cloud */}
      <path
        d="M70 128c-20 0-34-14-34-30s14-30 32-30c4-22 22-36 44-36 20 0 36 12 42 30 4-2 9-3 14-3 18 0 32 14 32 32s-14 37-32 37H70z"
        fill="#ffffff"
      />
      <path d="M78 150l-8 18M112 150l-8 18M146 150l-8 18" stroke="#6aa7cf" strokeWidth="5" />

      <defs>
        <clipPath id={groundId}>
          <rect x="0" y="150" width="440" height="228" rx="56" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${groundId})`}>
      {/* Back hill */}
      <path d="M-10 300C60 236 150 222 236 244c70 18 132 6 214-40v186H-10z" fill="#f7d046" />
      {/* Front hill */}
      <path d="M-10 318c90-60 190-74 300-50 60 13 110 8 160-10v132H-10z" fill="#d8573f" />

      {/* Soil probe under the hill */}
      <path d="M110 300v54M126 300v54" strokeWidth="3" />
      <rect x="98" y="286" width="40" height="20" rx="6" fill="#ffffff" />
      </g>
      {/* The cut edge of the ground sticker */}
      <path d="M1.75 298V320a56 56 0 0 0 56 56H382.25a56 56 0 0 0 56-56V212" />

      {/* Mast and tripod */}
      <path d="M262 110v178M262 288l-34 40M262 288l34 40M262 288v40" strokeWidth="4" />

      {/* Solar panel */}
      <path d="M262 200l52-14" />
      <rect x="296" y="160" width="74" height="46" rx="6" fill="#6aa7cf" transform="rotate(-14 333 183)" />
      <path d="M311 170l12 44M335 164l12 44" stroke="#ffffff" strokeWidth="2.5" transform="rotate(-14 333 183)" />

      {/* Datalogger enclosure */}
      <rect x="226" y="214" width="72" height="56" rx="12" fill="#ffffff" />
      <circle cx="246" cy="242" r="7" fill="#d8573f" />
      <path d="M262 236h22M262 250h14" />

      {/* Crossarm */}
      <path d="M200 122h124" strokeWidth="4" />

      {/* Wind vane */}
      <path d="M318 122v-18M300 104h44" />
      <path d="M344 104l-14-10v20z" fill="#d8573f" />
      <path d="M300 104l-10-8M300 104l-10 8" />

      {/* Cup anemometer: the hub spins */}
      <g className="pc-station__rotor" style={{ transformOrigin: '206px 96px' }}>
        <path d="M206 96l-28-10M206 96l26-12M206 96l2 28" />
        <circle cx="176" cy="85" r="10" fill="#ffdd00" />
        <circle cx="234" cy="82" r="10" fill="#ffdd00" />
        <circle cx="208" cy="126" r="10" fill="#ffdd00" />
      </g>
      <path d="M206 122V96" />
      <circle cx="206" cy="96" r="6" fill={ink} />
    </svg>
  );
}

export default PaperCutStation;
