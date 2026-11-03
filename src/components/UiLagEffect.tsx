import React, { useEffect, useRef } from 'react';

interface UiLagEffectProps {
  memoryMB: number;
}

/**
 * Creates perceptible, authentic micro-stuttering on scrolling/interactions
 * and executes hitch delays during article navigation without locking the
 * event loop so severely that the iframe sandbox watchdog kills the session.
 */
export const UiLagEffect: React.FC<UiLagEffectProps> = ({ memoryMB }) => {
  const lastScrollStallRef = useRef(0);
  const scrollCounterRef = useRef(0);

  useEffect(() => {
    // 1. Navigation lag handler: catches article switches and link clicks
    const handleNavLag = (e: Event) => {
      const customEvent = e as CustomEvent<{ delayMs?: number }>;
      const requestedStallMs = customEvent.detail?.delayMs || 120;
      // Cap at 90ms to keep iframe responsive to environment heartbeats
      const stallMs = Math.min(90, requestedStallMs);

      const start = performance.now();
      let acc = 0;
      while (performance.now() - start < stallMs) {
        acc += Math.sqrt(Math.random() * 99999);
      }
    };

    window.addEventListener('rbw-navigation-lag', handleNavLag);

    // 2. Micro-stutter on scrolling: authentic frame drops when memory pressure exists
    const handleScroll = () => {
      scrollCounterRef.current++;
      const now = performance.now();

      // Only trigger micro-stutter if there is active memory usage or periodic interval
      if (now - lastScrollStallRef.current > 280 && scrollCounterRef.current % 4 === 0) {
        lastScrollStallRef.current = now;

        // Baseline hitch of 16-24ms (drops 1-2 frames), scaling up to 45ms with high memory
        const memoryBonus = Math.min(25, Math.round((memoryMB / 4096) * 25));
        const stallMs = 18 + memoryBonus;

        const start = performance.now();
        let acc = 0;
        while (performance.now() - start < stallMs) {
          acc += Math.sin(acc + 0.1) * Math.cos(acc);
        }
      }
    };

    // 3. Click interaction stutter on article interactive elements
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Only add authentic stutter to article action buttons/links
      if (
        target.closest('.article-action-btn') ||
        target.closest('.tab-navigation-link')
      ) {
        const start = performance.now();
        let acc = 0;
        const clickStallMs = 24; // Subtle frame hitch without freezing UI thread
        while (performance.now() - start < clickStallMs) {
          acc += Math.atan(acc + 0.5);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    return () => {
      window.removeEventListener('rbw-navigation-lag', handleNavLag);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
    };
  }, [memoryMB]);

  return null;
};
