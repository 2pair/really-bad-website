import React from 'react';

interface CpuBurningEffectProps {
  cpuPercent: number; // 0 to 99
}

export const CpuBurningEffect: React.FC<CpuBurningEffectProps> = ({ cpuPercent }) => {
  if (cpuPercent <= 2) return null;

  const normalized = Math.min(99, Math.max(0, cpuPercent)) / 100;
  const opacity = Math.min(1, normalized * 1.1);
  const glowSpread = Math.round(15 + normalized * 70);
  const flameHeight = Math.round(20 + normalized * 80);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 transition-opacity duration-300"
      style={{ opacity }}
    >
      {/* Outer burning screen vignette */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          boxShadow: `inset 0 0 ${glowSpread}px ${glowSpread / 2}px rgba(255, 69, 0, ${0.4 + normalized * 0.5}), inset 0 0 ${glowSpread * 1.8}px rgba(255, 215, 0, ${0.25 + normalized * 0.4})`,
        }}
      />

      {/* Top fire wave */}
      <div
        className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-orange-600/70 via-red-500/40 to-transparent blur-sm"
        style={{ height: `${flameHeight}px` }}
      />

      {/* Bottom fire wave */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-700/80 via-orange-500/50 to-transparent blur-sm"
        style={{ height: `${flameHeight * 1.2}px` }}
      />

      {/* Left fire border */}
      <div
        className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-orange-600/70 via-amber-500/30 to-transparent blur-sm"
      />

      {/* Right fire border */}
      <div
        className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-orange-600/70 via-amber-500/30 to-transparent blur-sm"
      />

      {/* Extreme heat distortion wave at > 70% CPU */}
      {normalized > 0.65 && (
        <div className="absolute inset-0 bg-orange-500/10 mix-blend-color-dodge animate-ping" />
      )}
    </div>
  );
};
