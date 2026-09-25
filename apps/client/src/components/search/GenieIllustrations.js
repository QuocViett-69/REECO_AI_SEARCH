import React from 'react';

// ── 3 Cute Inline Avatars inside the Headline: Weather, Hydrology, Environment ─
export function InlineHeadlineAvatars() {
  return (
    <span className="headline-avatar-cluster" aria-hidden="true">
      {/* 1. Weather / Cloud Avatar (Blue) */}
      <span className="avatar-chip avatar-chip-blue" title="Khí tượng (Meteorology)">
        <svg viewBox="0 0 40 40" width="38" height="38" fill="none">
          <defs>
            <linearGradient id="cloudGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7ecbff" />
              <stop offset="1" stopColor="#1e88ff" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="18" fill="url(#cloudGrad)" />
          {/* Eyes */}
          <circle cx="15" cy="18" r="2.2" fill="#0a0d12" />
          <circle cx="25" cy="18" r="2.2" fill="#0a0d12" />
          {/* Cute smile */}
          <path d="M15 22 Q20 26 25 22" stroke="#0a0d12" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Sparkles */}
          <circle cx="13" cy="14" r="1.2" fill="#ffffff" />
          <circle cx="23" cy="14" r="1.2" fill="#ffffff" />
        </svg>
      </span>

      {/* 2. Hydrology / Water Drop Avatar (Cyan / Aquamarine) */}
      <span className="avatar-chip avatar-chip-cyan" title="Thủy văn (Hydrology)">
        <svg viewBox="0 0 40 40" width="38" height="38" fill="none">
          <defs>
            <linearGradient id="dropGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#55e7fc" />
              <stop offset="1" stopColor="#0298db" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="18" fill="url(#dropGrad)" />
          {/* Water drop shape highlight */}
          <path d="M20 7 C23 11 27 15 27 19 C27 23 23.8 26 20 26 C16.2 26 13 23 13 19 C13 15 17 11 20 7 Z" fill="rgba(255,255,255,0.28)" />
          {/* Happy closed curved eyes */}
          <path d="M15 18 Q17 15 19 18" stroke="#06324a" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M21 18 Q23 15 25 18" stroke="#06324a" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Big happy smile */}
          <path d="M16 22 Q20 26 24 22" stroke="#06324a" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Rosy cheeks */}
          <circle cx="13" cy="21" r="1.8" fill="#00b4d8" opacity="0.6" />
          <circle cx="27" cy="21" r="1.8" fill="#00b4d8" opacity="0.6" />
        </svg>
      </span>

      {/* 3. Environment / Eco Sprout & Sun Avatar (Emerald / Sun Gold) */}
      <span className="avatar-chip avatar-chip-green" title="Môi trường & Sinh thái (Environment)">
        <svg viewBox="0 0 40 40" width="38" height="38" fill="none">
          <defs>
            <linearGradient id="ecoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6ee7b7" />
              <stop offset="1" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="18" fill="url(#ecoGrad)" />
          {/* Little green plant sprout on head */}
          <path d="M20 12 C18 7 13 8 14 11 C15 13 18 12 20 12 Z" fill="#047857" />
          <path d="M20 12 C22 7 27 8 26 11 C25 13 22 12 20 12 Z" fill="#059669" />
          {/* Sparkly eyes */}
          <circle cx="15" cy="19" r="2.2" fill="#064e3b" />
          <circle cx="25" cy="19" r="2.2" fill="#064e3b" />
          {/* Big smile */}
          <path d="M16 23 Q20 27 24 23" stroke="#064e3b" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="13.5" cy="16.5" r="1" fill="#ffffff" />
          <circle cx="23.5" cy="16.5" r="1" fill="#ffffff" />
        </svg>
      </span>
    </span>
  );
}

// ── Floating 3D Pastel Meteorology, Hydrology & Environment Icons ────────────
export function Floating3DDecorations() {
  return (
    <div className="genie-floating-decorations" aria-hidden="true">
      {/* 1. Top Left: 3D Wind Anemometer (Khí tượng - Cảm biến đo tốc độ gió & hướng gió) */}
      <div className="decor-item decor-anemometer" title="Khí tượng: Cảm biến đo gió (Anemometer)">
        <svg viewBox="0 0 80 80" width="70" height="70" fill="none">
          <defs>
            <linearGradient id="windGrad1" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffb37a" />
              <stop offset="1" stopColor="#ff7033" />
            </linearGradient>
            <linearGradient id="metalStem" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#e2ecf5" />
              <stop offset="1" stopColor="#9fbcd4" />
            </linearGradient>
            <filter id="shadowAnemo" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#ff7033" floodOpacity="0.25" />
            </filter>
          </defs>
          {/* Wind flow curve lines in background */}
          <path d="M4 22 Q24 16 44 24 T76 20" stroke="rgba(255,140,70,0.3)" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M12 30 Q30 25 50 32" stroke="rgba(255,140,70,0.2)" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Central mast & rotor */}
          <line x1="40" y1="28" x2="40" y2="72" stroke="url(#metalStem)" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="40" cy="72" rx="14" ry="4" fill="#9fbcd4" opacity="0.8" />
          {/* Center rotor hub */}
          <circle cx="40" cy="28" r="6.5" fill="#ffffff" stroke="#9fbcd4" strokeWidth="2" />
          {/* Rotating arms and 3D hemispherical cups */}
          {/* Arm 1 to top right */}
          <line x1="40" y1="28" x2="62" y2="18" stroke="url(#metalStem)" strokeWidth="3" strokeLinecap="round" />
          <path d="M60 12 C68 15 68 25 60 28 C56 22 56 16 60 12 Z" fill="url(#windGrad1)" filter="url(#shadowAnemo)" />
          {/* Arm 2 to left */}
          <line x1="40" y1="28" x2="18" y2="25" stroke="url(#metalStem)" strokeWidth="3" strokeLinecap="round" />
          <path d="M14 18 C20 15 26 23 20 31 C14 28 12 21 14 18 Z" fill="url(#windGrad1)" filter="url(#shadowAnemo)" />
          {/* Arm 3 to bottom right */}
          <line x1="40" y1="28" x2="48" y2="44" stroke="url(#metalStem)" strokeWidth="3" strokeLinecap="round" />
          <path d="M44 46 C50 42 56 48 50 54 C44 52 42 47 44 46 Z" fill="url(#windGrad1)" filter="url(#shadowAnemo)" />
        </svg>
      </div>

      {/* 2. Mid Left: 3D Soil Moisture Sensor with Sprout (Môi trường & Độ ẩm đất) */}
      <div className="decor-item decor-soil" title="Môi trường: Cảm biến độ ẩm đất & mầm cây (Soil Moisture Probe)">
        <svg viewBox="0 0 85 85" width="75" height="75" fill="none">
          <defs>
            <linearGradient id="sproutGrad" x1="20" y1="10" x2="70" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#72e29e" />
              <stop offset="1" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="probeMetal" x1="0" y1="0" x2="30" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f0f6fc" />
              <stop offset="1" stopColor="#a3b8cc" />
            </linearGradient>
            <linearGradient id="soilEarth" x1="0" y1="0" x2="50" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#e8b896" />
              <stop offset="1" stopColor="#c28b63" />
            </linearGradient>
            <filter id="shadowSoil" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#10b981" floodOpacity="0.25" />
            </filter>
          </defs>
          {/* Soil base pill */}
          <rect x="20" y="52" width="45" height="18" rx="9" fill="url(#soilEarth)" />
          {/* Probe rods going down */}
          <line x1="34" y1="36" x2="34" y2="64" stroke="url(#probeMetal)" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="50" y1="36" x2="50" y2="64" stroke="url(#probeMetal)" strokeWidth="3.5" strokeLinecap="round" />
          {/* Probe head enclosure */}
          <rect x="28" y="28" width="28" height="15" rx="5" fill="#3b82f6" />
          <circle cx="35" cy="35" r="2" fill="#93c5fd" />
          <circle cx="43" cy="35" r="2" fill="#93c5fd" />
          {/* 3D Sprout Leafs Growing */}
          <path d="M42 28 C42 16 28 14 26 22 C30 26 38 27 42 28 Z" fill="url(#sproutGrad)" filter="url(#shadowSoil)" />
          <path d="M42 28 C42 18 56 16 58 24 C54 28 46 28 42 28 Z" fill="#34d399" filter="url(#shadowSoil)" />
          {/* Dew drop on leaf */}
          <circle cx="34" cy="18" r="2.5" fill="#ffffff" opacity="0.85" />
        </svg>
      </div>

      {/* 3. Lower Left: 3D Weather Thermometer & Barometer Gauge (Nhiệt kế & Khí áp) */}
      <div className="decor-item decor-thermometer" title="Khí tượng: Nhiệt ẩm kế chính xác (Precision Temperature & Humidity)">
        <svg viewBox="0 0 75 85" width="68" height="78" fill="none">
          <defs>
            <linearGradient id="thermoFluid" x1="0" y1="0" x2="0" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ff5e62" />
              <stop offset="1" stopColor="#ff9966" />
            </linearGradient>
            <linearGradient id="glassTube" x1="0" y1="0" x2="30" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="0.5" stopColor="#f0f7ff" stopOpacity="0.6" />
              <stop offset="1" stopColor="#dbeafe" stopOpacity="0.8" />
            </linearGradient>
            <filter id="shadowThermo" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#ff5e62" floodOpacity="0.25" />
            </filter>
          </defs>
          {/* Thermometer Glass Body */}
          <rect x="28" y="10" width="16" height="50" rx="8" fill="url(#glassTube)" stroke="#bcd6f2" strokeWidth="1.5" />
          <circle cx="36" cy="62" r="13" fill="url(#glassTube)" stroke="#bcd6f2" strokeWidth="1.5" />
          {/* Red/Orange Liquid */}
          <rect x="33" y="24" width="6" height="34" rx="3" fill="url(#thermoFluid)" filter="url(#shadowThermo)" />
          <circle cx="36" cy="62" r="9" fill="url(#thermoFluid)" filter="url(#shadowThermo)" />
          {/* Glass Highlights */}
          <line x1="31" y1="16" x2="31" y2="48" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="33" cy="59" r="2.5" fill="#ffffff" opacity="0.8" />
          {/* Tick marks */}
          <line x1="47" y1="20" x2="53" y2="20" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
          <line x1="47" y1="30" x2="55" y2="30" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
          <line x1="47" y1="40" x2="52" y2="40" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
          {/* °C indicator tag */}
          <text x="56" y="22" fill="#0284c7" fontSize="10" fontWeight="bold" fontFamily="sans-serif">°C</text>
        </svg>
      </div>

      {/* 4. Top Right: 3D Atmospheric Rain Cloud (Khí tượng - Mây & Giọt Mưa Thủy Văn) */}
      <div className="decor-item decor-cloud" title="Khí quyển: Đám mây & Mưa (Weather Cloud & Precipitation)">
        <svg viewBox="0 0 100 75" width="94" height="70" fill="none">
          <defs>
            <linearGradient id="cloudAtm" x1="0" y1="0" x2="100" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#63b6ff" />
              <stop offset="1" stopColor="#0066ee" />
            </linearGradient>
            <linearGradient id="rainDropGrad" x1="0" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7be0ff" />
              <stop offset="1" stopColor="#1e88ff" />
            </linearGradient>
            <filter id="shadowCloud" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#0066ee" floodOpacity="0.25" />
            </filter>
          </defs>
          {/* 3D Puffy Cloud */}
          <path
            d="M25 45 L75 45 A18 18 0 0 0 85 26 A22 22 0 0 0 52 16 A20 20 0 0 0 22 28 A16 16 0 0 0 25 45 Z"
            fill="url(#cloudAtm)"
            filter="url(#shadowCloud)"
          />
          <circle cx="50" cy="22" r="3.5" fill="#ffffff" opacity="0.6" />
          {/* 3 Hydrology Rain Drops Falling */}
          <path d="M30 52 C32 55 35 58 35 62 A3 3 0 0 1 29 62 C29 58 30 55 30 52 Z" fill="url(#rainDropGrad)" />
          <path d="M52 50 C54 53 57 57 57 61 A3.5 3.5 0 0 1 50 61 C50 57 52 53 52 50 Z" fill="url(#rainDropGrad)" />
          <path d="M72 53 C74 56 77 59 77 63 A3 3 0 0 1 71 63 C71 59 72 56 72 53 Z" fill="url(#rainDropGrad)" />
        </svg>
      </div>

      {/* 5. Mid Right: 3D Hydrology Water Droplet with Ripple (Thủy văn - Đo mực nước & Dòng chảy) */}
      <div className="decor-item decor-water" title="Thủy văn: Giọt nước thủy văn & Sóng nước (Hydrology Water & Flow)">
        <svg viewBox="0 0 85 75" width="76" height="68" fill="none">
          <defs>
            <linearGradient id="waterDrop3d" x1="20" y1="5" x2="65" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#67e8f9" />
              <stop offset="0.6" stopColor="#06b6d4" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
            <filter id="shadowWater" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0284c7" floodOpacity="0.3" />
            </filter>
          </defs>
          {/* Water ripple circles at base */}
          <ellipse cx="42" cy="58" rx="34" ry="10" fill="none" stroke="#67e8f9" strokeWidth="2" opacity="0.6" />
          <ellipse cx="42" cy="58" rx="22" ry="6" fill="none" stroke="#06b6d4" strokeWidth="2.5" opacity="0.8" />
          {/* Main 3D Water Droplet */}
          <path
            d="M42 10 C48 20 62 32 62 44 C62 55 53 62 42 62 C31 62 22 55 22 44 C22 32 36 20 42 10 Z"
            fill="url(#waterDrop3d)"
            filter="url(#shadowWater)"
          />
          {/* Glossy 3D Highlight reflection */}
          <path d="M42 16 C45 22 50 30 50 38 C47 34 45 28 42 16 Z" fill="#ffffff" opacity="0.65" />
          <circle cx="34" cy="46" r="3" fill="#ffffff" opacity="0.5" />
        </svg>
      </div>

      {/* 6. Lower Right: 3D Solar Radiation Sensor / Pyranometer (Bức xạ Mặt trời & Năng lượng) */}
      <div className="decor-item decor-pyranometer" title="Khí tượng: Cảm biến bức xạ mặt trời (Solar Pyranometer)">
        <svg viewBox="0 0 85 75" width="76" height="68" fill="none">
          <defs>
            <linearGradient id="sunRadiation" x1="0" y1="0" x2="85" y2="75" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fde047" />
              <stop offset="0.5" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="glassDome" x1="20" y1="15" x2="60" y2="45" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="1" stopColor="#93c5fd" stopOpacity="0.4" />
            </linearGradient>
            <filter id="shadowSolar" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.3" />
            </filter>
          </defs>
          {/* Radiant sun ray pulses */}
          <circle cx="42" cy="38" r="30" fill="rgba(253,224,71,0.18)" />
          {/* Base plate of pyranometer */}
          <ellipse cx="42" cy="50" rx="30" ry="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" filter="url(#shadowSolar)" />
          {/* Level indicator bubble */}
          <circle cx="58" cy="48" r="3.5" fill="#38bdf8" />
          <circle cx="58" cy="48" r="1.5" fill="#ffffff" />
          {/* Black thermopile sensor center disc */}
          <ellipse cx="42" cy="46" rx="16" ry="6" fill="#1e293b" />
          {/* Glass Dome over sensor */}
          <path d="M26 46 A16 16 0 0 1 58 46 Z" fill="url(#glassDome)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
          {/* Sun emblem / Ray flare above dome */}
          <circle cx="42" cy="22" r="7" fill="url(#sunRadiation)" filter="url(#shadowSolar)" />
          <line x1="42" y1="11" x2="42" y2="7" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="31" y1="15" x2="28" y2="12" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="53" y1="15" x2="56" y2="12" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Tiny Meteorological Sparkles & Atmospheric Particles */}
      <div className="decor-star star-1" title="Khí quyển">✦</div>
      <div className="decor-star star-2" title="Gió & Khí áp">✦</div>
      <div className="decor-star star-3" title="Nắng ấm">✦</div>
      <div className="decor-star star-4" title="Hơi ẩm">💧</div>
      <div className="decor-star star-5" title="Sinh thái">✦</div>
    </div>
  );
}

// ── Mascot Cloud Waving at the Bottom ─────────────────────────────────────────
export function WavingMascotCloud() {
  return (
    <div className="genie-waving-mascot" aria-hidden="true">
      <svg viewBox="0 0 140 140" width="130" height="130" fill="none">
        <defs>
          <linearGradient id="mascotGrad" x1="20" y1="20" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#63b6ff" />
            <stop offset="1" stopColor="#1e7cf0" />
          </linearGradient>
          <linearGradient id="wispGrad" x1="70" y1="90" x2="70" y2="135" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e7cf0" />
            <stop offset="1" stopColor="#63b6ff" />
          </linearGradient>
        </defs>

        {/* Tail / cloud swirl at bottom */}
        <path d="M70 85 C65 105 85 115 78 128 C74 135 65 132 64 125 C62 118 72 108 66 90 Z" fill="url(#wispGrad)" />

        {/* Main cloud body */}
        <path
          d="M50 85 C32 85 24 72 26 58 C26 46 36 38 48 38 C52 25 66 18 80 22 C92 24 102 34 102 46 C112 48 118 58 116 68 C114 80 102 85 88 85 Z"
          fill="url(#mascotGrad)"
          filter="drop-shadow(0 12px 28px rgba(30,124,240,0.32))"
        />

        {/* Waving Hand Left */}
        <path
          d="M32 52 C22 42 16 30 20 22 C24 15 32 24 36 34"
          stroke="url(#mascotGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          className="mascot-arm-wave"
        />

        {/* Right Hand resting cute */}
        <path
          d="M106 60 C114 62 120 70 115 76 C110 82 104 74 100 68"
          stroke="#1e7cf0"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cute Face: Big Sparkly Eyes */}
        <ellipse cx="60" cy="54" rx="3.5" ry="4.5" fill="#0a0d12" />
        <ellipse cx="82" cy="54" rx="3.5" ry="4.5" fill="#0a0d12" />
        <circle cx="61.5" cy="52" r="1.5" fill="#ffffff" />
        <circle cx="83.5" cy="52" r="1.5" fill="#ffffff" />

        {/* Big Open Happy Smile */}
        <path
          d="M65 62 Q71 72 77 62"
          fill="#0a0d12"
          stroke="#0a0d12"
          strokeWidth="1.5"
        />
        {/* Pink tongue */}
        <path
          d="M68 67 Q71 71 74 67"
          fill="#ff6b8b"
        />

        {/* Rosy Cheeks */}
        <circle cx="53" cy="61" r="3.5" fill="#ff4d79" opacity="0.3" />
        <circle cx="89" cy="61" r="3.5" fill="#ff4d79" opacity="0.3" />
      </svg>
    </div>
  );
}

// ── Soft Fluffy Cloud Hills Framing the Bottom ────────────────────────────────
export function BottomCloudScenery() {
  return (
    <div className="bottom-cloud-scenery" aria-hidden="true">
      {/* Left fluffy cloud hill */}
      <div className="cloud-hill cloud-hill-left" />
      {/* Right fluffy cloud hill */}
      <div className="cloud-hill cloud-hill-right" />
    </div>
  );
}
