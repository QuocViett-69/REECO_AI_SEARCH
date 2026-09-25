import React from 'react';

export function BackgroundEffects() {
  return (
    <div className="bg-effects" aria-hidden="true">
      {/* Soft warm solar ambient glow at top-center (representing daylight atmosphere) */}
      <div className="ambient-sun-glow" />

      {/* Gentle atmospheric airflow stream (representing meteorological air currents) */}
      <div className="atmospheric-breeze stream-1" />
      <div className="atmospheric-breeze stream-2" />
    </div>
  );
}
