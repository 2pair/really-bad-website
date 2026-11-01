import React, { useEffect, useRef } from 'react';
import { calculateLagDelayMs } from '../utils/resourceMath.ts';

interface UiLagEffectProps {
  memoryMB: number;
}

export const UiLagEffect: React.FC<UiLagEffectProps> = ({ memoryMB }) => {
  const lagMs = calculateLagDelayMs(memoryMB, 4096);
  const lastBurnRef = useRef(0);

  useEffect(() => {
    if (lagMs <= 0) return;

    // Simulate realistic frame drops without starving browser IPC or crashing the tab
    const burnMainThread = () => {
      const now = performance.now();
      // Throttle strictly to at most once per 450ms
      if (now - lastBurnRef.current < 450) return;
      lastBurnRef.current = now;

      // Safe bounded stall: max 14ms (drops ~1 frame intentionally without triggering browser OOM kill)
      const safeStall = Math.min(14, Math.max(3, Math.round(lagMs * 0.15)));
      const start = performance.now();
      let acc = 0;
      while (performance.now() - start < safeStall) {
        acc += Math.sin(acc + 0.1);
      }
    };

    const handleScroll = () => {
      burnMainThread();
    };

    const handleClick = () => {
      burnMainThread();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleClick, { capture: true, passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick, { capture: true });
    };
  }, [lagMs]);

  // Visual jitter / lag indicator when memory is saturated
  if (lagMs <= 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-red-950/90 border border-red-600 text-red-200 text-[10px] font-mono px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse"
    >
      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
      <span>UI THREAD JANK: +{lagMs}ms STALL / FRAME DROP</span>
    </div>
  );
};
