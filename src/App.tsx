import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { AudioControllerProvider, useAudioController } from './context/AudioControllerContext.tsx';
import { CpuBurningEffect } from './components/CpuBurningEffect.tsx';
import { StorageCorruptionEffect } from './components/StorageCorruptionEffect.tsx';
import { UiLagEffect } from './components/UiLagEffect.tsx';
import { VirusWarningModal } from './components/VirusWarningModal.tsx';
import { ChaosDrawer } from './components/ChaosDrawer.tsx';
import { BadArticle } from './components/BadArticle.tsx';
import { SupportChat } from './components/SupportChat.tsx';
import { Popups } from './components/Popups.tsx';
import { SaturationWorkerPool, WorkerMetrics } from './utils/workerManager.ts';
import { initConsoleChaos } from './utils/consoleChaos.ts';
import { cleanupPreviousSessionStorage, setupTabExitNotification } from './utils/storageCleanup.ts';
import { PWAInstallButton } from './components/PWAInstallButton.tsx';
import { resolvePublicAsset } from './utils/assetUrl.ts';

function AppContent() {
  // Unconstrained default memory testing ceiling: 16 GB (16384 MB)
  const defaultTestingCeilingMB = 16384;

  const [isOomClamped, setIsOomClamped] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const tried = parseInt(localStorage.getItem('memory_tried') || '0', 10);
      const used = parseInt(localStorage.getItem('memory_used') || '0', 10);
      const wasAlive = localStorage.getItem('memory_alive') === 'true';
      // Only lock in if memory was attempted, the prior session died before heartbeat confirmation (!wasAlive), and tried > used
      return tried > 0 && !wasAlive && tried > used;
    }
    return false;
  });

  const [highWatermarkMB, setHighWatermarkMB] = useState<number>(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const hwm = localStorage.getItem('memory_high_watermark') || localStorage.getItem('memory_used');
      if (hwm) return parseInt(hwm, 10);
    }
    return 0;
  });

  // On page load, first check localStorage memory log (OOM kill recovery on iOS/mobile)
  // Locking in the max should ONLY be at boot time when there is existing unrecovered memory threshold in persistent storage.
  const [maxMemoryMB, setMaxMemoryMB] = useState<number>(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const triedStr = localStorage.getItem('memory_tried');
        const usedStr = localStorage.getItem('memory_used');
        const wasAlive = localStorage.getItem('memory_alive') === 'true';
        const tried = triedStr ? parseInt(triedStr, 10) : 0;
        const used = usedStr ? parseInt(usedStr, 10) : 0;
        if (tried > 0 && !wasAlive && tried > used) {
          console.warn(`[OOM Boot Recovery] Detected crash in previous session: memory_tried=${tried}MB > memory_used=${used}MB (alive=false). Clamping slider max to ${used}MB.`);
          return Math.max(128, used);
        }
      } catch (e) {
        console.warn('Failed to read localStorage memory log', e);
      }
    }
    return defaultTestingCeilingMB;
  });

  // Initialize console chaos, cleanup previous session storage, register tab exit notification, and mark session alive
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      // Mark current session as alive
      localStorage.setItem('memory_alive', 'true');
    }
    initConsoleChaos();
    cleanupPreviousSessionStorage();
    const cleanupExitNotification = setupTabExitNotification();
    return () => {
      cleanupExitNotification();
    };
  }, []);

  // Resource saturation targets
  const [cpu, setCpu] = useState<number>(0); // 0 to 99%
  const [memoryMB, setMemoryMB] = useState<number>(0); // 0 to maxMemoryMB
  const [storageMB, setStorageMB] = useState<number>(0); // 0 to 4096 MB

  // Slower modern sans-serif web fonts injection:
  // Timer activates ONLY once the user starts scrolling, loading slowly to trigger extreme layout shifts
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const fontTimerActivatedRef = useRef<boolean>(false);

  useEffect(() => {
    const handleScrollForFonts = () => {
      if (fontTimerActivatedRef.current) return;
      fontTimerActivatedRef.current = true;

      // Slow 6-second countdown after user begins scrolling
      setTimeout(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,800;1,400&family=Space+Grotesk:wght@600;700&display=swap';
        link.onload = () => {
          setFontsLoaded(true);
          const style = document.createElement('style');
          style.textContent = `
            body, p, li, span:not([class*="font-"]) { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important; }
            h1, h2, h3, h4, h5, h6 { font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif !important; letter-spacing: -0.025em; }
          `;
          document.head.appendChild(style);
        };
        document.head.appendChild(link);
      }, 6000);
    };

    window.addEventListener('scroll', handleScrollForFonts, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollForFonts);
  }, []);

  // Back button hijacking: pushes synthetic history states and intercepts popstate to prevent leaving
  useEffect(() => {
    // Prime the history stack with traps
    try {
      window.history.pushState({ page: 'trap-1', site: 'ReallyBadWebsite' }, '', window.location.href);
      window.history.pushState({ page: 'trap-2', site: 'ReallyBadWebsite' }, '', window.location.href);
    } catch {
      // Ignore if history API restricted
    }

    const handlePopState = (event: PopStateEvent) => {
      // Re-inject history entry immediately to absorb the back navigation
      try {
        window.history.pushState({ page: 're-trapped', timestamp: Date.now() }, '', window.location.href);
      } catch {
        // Ignore
      }

      // Trigger Todd to comment on their futile attempt to leave
      setToddPrompt(
        "Notice you reached for that browser back button! Our 836 data partners kindly request you remain engaged with our high-impact sponsored editorial content."
      );
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Audio controller
  const { isMidiPlaying, toggleMidi, resumeAudioContext } = useAudioController();

  // Initial barrage status & user scroll tracking for Todd Chat gating
  const [initialPopupsCleared, setInitialPopupsCleared] = useState<boolean>(false);
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);

  // Worker metrics reported from background threads
  const [workerMetrics, setWorkerMetrics] = useState<WorkerMetrics>({
    totalMemoryBytes: 0,
    totalStorageBytes: 0,
    activeWorkers: 0,
    concurrencyLimit: Math.max(4, Math.ceil(defaultTestingCeilingMB / 1024)),
  });

  // Support chat external trigger
  const [toddPrompt, setToddPrompt] = useState<string | null>(null);

  // Unskippable full page ad and article expansion state
  const [showUnskippableAd, setShowUnskippableAd] = useState<boolean>(false);
  const [articleExpanded, setArticleExpanded] = useState<boolean>(false);
  const [adBlockNoticeCount, setAdBlockNoticeCount] = useState<number>(0);

  // Worker Pool reference with marshal
  const poolRef = useRef<SaturationWorkerPool | null>(null);

  // Initialize saturation worker pool with Marshal and OOM high watermark listener
  useEffect(() => {
    const pool = new SaturationWorkerPool(
      maxMemoryMB,
      (metrics) => {
        setWorkerMetrics(metrics);
        const currentMB = Math.round(metrics.totalMemoryBytes / (1024 * 1024));
        if (currentMB > highWatermarkMB) {
          setHighWatermarkMB(currentMB);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('memory_high_watermark', String(currentMB));
          }
        }
      },
      (hwmMB) => {
        // High watermark report from worker heartbeat - updates display readout without reducing runtime max
        setHighWatermarkMB((prev) => Math.max(prev, hwmMB));
      }
    );
    poolRef.current = pool;

    return () => {
      pool.terminate();
    };
  }, []);

  const handleUnlockCeiling = () => {
    setIsOomClamped(false);
    setMaxMemoryMB(defaultTestingCeilingMB);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('memory_tried', '0');
      localStorage.setItem('memory_used', '0');
      localStorage.setItem('memory_alive', 'true');
    }
  };

  // Sync targets to web workers
  useEffect(() => {
    if (poolRef.current) {
      poolRef.current.setTargets(cpu, memoryMB, storageMB);
    }
  }, [cpu, memoryMB, storageMB]);

  // Track user scroll based on em: scales similarly across displays, triggers ad-blocker before Todd
  const lastScrollYRef = useRef(0);
  const adBlockerTriggeredOnScrollRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const rootFontSize =
        (typeof document !== 'undefined' && parseFloat(getComputedStyle(document.documentElement).fontSize)) || 16;

      // Initial scroll detection threshold (2em)
      if (currentY > 2 * rootFontSize && !hasScrolled) {
        setHasScrolled(true);
      }

      // Trigger ad blocker popup just after start scrolling (3.5em), before Todd triggers!
      if (currentY > 3.5 * rootFontSize && !adBlockerTriggeredOnScrollRef.current) {
        adBlockerTriggeredOnScrollRef.current = true;
        setAdBlockNoticeCount((prev) => prev + 1);
      }

      // Resource saturation on scroll based on em:
      // Every 12em of scroll delta, increase memory, CPU, and storage smoothly
      const emSpanThreshold = 12 * rootFontSize;
      const delta = Math.abs(currentY - lastScrollYRef.current);
      if (delta >= emSpanThreshold) {
        lastScrollYRef.current = currentY;
        setMemoryMB((prev) => Math.min(maxMemoryMB, prev + 16));
        setCpu((prev) => Math.min(99, prev + 3));
        setStorageMB((prev) => Math.min(4096, prev + 32));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolled, maxMemoryMB]);

  // Emergency Stop / Reset
  const handleEmergencyStop = () => {
    setCpu(0);
    setMemoryMB(0);
    setStorageMB(0);
    if (poolRef.current) {
      poolRef.current.emergencyReset();
    }
  };

  // Chat starts ONLY when initial popups are closed AND user has scrolled
  const canChatStart = initialPopupsCleared && hasScrolled;

  return (
    <div
      className={`relative min-h-screen bg-neutral-100 text-neutral-900 selection:bg-amber-200 transition-all ${
        fontsLoaded ? 'delayed-fonts-applied' : ''
      }`}
    >
      {/* 1. CPU Burning Screen Edge Effect */}
      <CpuBurningEffect cpuPercent={cpu} />

      {/* 2. Storage & Memory Corruption: 1mm micro-squares with capacity based on memory ceiling */}
      <StorageCorruptionEffect
        storageMB={storageMB}
        maxStorageMB={4096}
        memoryMB={memoryMB}
        maxMemoryMB={maxMemoryMB}
      />

      {/* 3. Memory UI Lag & Stutter Effect */}
      <UiLagEffect memoryMB={memoryMB} />

      {/* 4. Virus Warning Modal when storage is getting full, with urgency countdown and scanner */}
      <VirusWarningModal storageMB={storageMB} />

      {/* Main Page Layout */}
      <div className="relative w-full min-h-screen pb-28">
        {/* Top publisher navigation bar */}
        <nav className="sticky top-0 z-20 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <img
              src={resolvePublicAsset('header-logo.png')}
              alt="Really Bad Website Logo"
              className="h-8 w-auto max-w-[40px] object-contain drop-shadow-xs"
            />
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base sm:text-lg text-neutral-950 font-sans">
                REALLY BAD WEBSITE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold text-neutral-600">
            {/* PWA In-App Install Button */}
            <PWAInstallButton />

            {/* Top nav MIDI toggle button tied to Global Audio Controller */}
            <button
              onClick={toggleMidi}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                isMidiPlaying
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md animate-pulse'
                  : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border-neutral-300'
              }`}
              title={
                isMidiPlaying
                  ? 'Pause corporate theme song'
                  : 'Play our relaxing corporate theme song (specifically engineered to increase ad tolerance by 12%)'
              }
            >
              {isMidiPlaying ? (
                <Volume2 className="w-3.5 h-3.5 text-white animate-bounce" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
              )}
              <span>{isMidiPlaying ? 'MIDI: PLAYING 🎵' : 'PLAY MIDI 🎵'}</span>
            </button>

            <span className="hidden md:inline bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200 text-neutral-500">
              CHAOS TESTBED v4.0
            </span>
            <button
              onClick={() => {
                resumeAudioContext();
                setToddPrompt('Hey, did you need something?');
              }}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 cursor-pointer"
            >
              Need Help?
            </button>
          </div>
        </nav>

        {/* Main Article Content & Extreme CLS Engine */}
        <main className="w-full">
          <BadArticle
            onTriggerTodd={(prompt) => setToddPrompt(prompt)}
            onContinueReading={() => setShowUnskippableAd(true)}
            onArticleTransition={() => {
              setArticleExpanded(false);
              setAdBlockNoticeCount((prev) => prev + 1);
            }}
            isArticleExpanded={articleExpanded}
          />
        </main>
      </div>

      {/* 
        Viewport Fixed Components:
        Fixed directly to root viewport so they reliably stick regardless of scrolling!
      */}

      {/* Customer Support Chatbot (Todd) - Fixed to bottom right viewport */}
      <SupportChat
        canStart={canChatStart}
        externalTriggerPrompt={toddPrompt}
        onClearExternalTrigger={() => setToddPrompt(null)}
      />

      {/* Layered Popups (Cookie wall, Newsletter, Permissions, Full Page Ad) - Fixed to viewport */}
      <Popups
        showUnskippableAd={showUnskippableAd}
        onCloseUnskippableAd={() => {
          setShowUnskippableAd(false);
          setArticleExpanded(true);
        }}
        onInitialPopupsCleared={() => setInitialPopupsCleared(true)}
        triggerAdBlockNoticeCount={adBlockNoticeCount}
      />

      {/* 
        Collapsible Chaos Lab Drawer:
        Fixed at bottom of viewport with emergency stop, audio MIDI, and live FPS readouts.
      */}
      <ChaosDrawer
        cpu={cpu}
        memoryMB={memoryMB}
        storageMB={storageMB}
        maxMemoryMB={maxMemoryMB}
        highWatermarkMB={highWatermarkMB}
        isOomClamped={isOomClamped}
        onUnlockCeiling={handleUnlockCeiling}
        onCpuChange={setCpu}
        onMemoryChange={setMemoryMB}
        onStorageChange={setStorageMB}
        onEmergencyStop={handleEmergencyStop}
        workerMetrics={workerMetrics}
      />
    </div>
  );
}

export default function App() {
  return (
    <AudioControllerProvider>
      <AppContent />
    </AudioControllerProvider>
  );
}
