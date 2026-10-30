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

function AppContent() {
  // Resource saturation targets
  const [cpu, setCpu] = useState<number>(0); // 0 to 99%
  const [memoryMB, setMemoryMB] = useState<number>(0); // 0 to 4096 MB
  const [storageMB, setStorageMB] = useState<number>(0); // 0 to 4096 MB

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
    concurrencyLimit: typeof navigator !== 'undefined' ? Math.min(4, navigator.hardwareConcurrency || 4) : 4,
  });

  // Support chat external trigger
  const [toddPrompt, setToddPrompt] = useState<string | null>(null);

  // Unskippable 10s ad state
  const [showUnskippableAd, setShowUnskippableAd] = useState<boolean>(false);

  // Worker Pool reference
  const poolRef = useRef<SaturationWorkerPool | null>(null);

  // Initialize saturation worker pool
  useEffect(() => {
    const pool = new SaturationWorkerPool((metrics) => {
      setWorkerMetrics(metrics);
    });
    poolRef.current = pool;

    return () => {
      pool.terminate();
    };
  }, []);

  // Sync targets to web workers
  useEffect(() => {
    if (poolRef.current) {
      poolRef.current.setTargets(cpu, memoryMB, storageMB);
    }
  }, [cpu, memoryMB, storageMB]);

  // Track user scroll to satisfy chat requirement and escalate sliders
  const lastScrollYRef = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 40 && !hasScrolled) {
        setHasScrolled(true);
      }

      const delta = Math.abs(currentY - lastScrollYRef.current);
      if (delta > 220) {
        lastScrollYRef.current = currentY;

        // Pick one randomly to escalate
        const choice = Math.floor(Math.random() * 3);
        if (choice === 0) {
          setCpu((prev) => Math.min(99, prev + 3));
        } else if (choice === 1) {
          setMemoryMB((prev) => Math.min(4096, prev + 128));
        } else {
          setStorageMB((prev) => Math.min(4096, prev + 128));
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolled]);

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
    <div className="relative min-h-screen bg-neutral-100 text-neutral-900 selection:bg-amber-200">
      {/* 1. CPU Burning Screen Edge Effect */}
      <CpuBurningEffect cpuPercent={cpu} />

      {/* 2. Storage Corruption: Small 1mm nearly-opaque micro-squares across the screen */}
      <StorageCorruptionEffect storageMB={storageMB} maxStorageMB={4096} />

      {/* 3. Memory UI Lag & Stutter Effect */}
      <UiLagEffect memoryMB={memoryMB} />

      {/* 4. Virus Warning Modal when storage is getting full, with urgency countdown and scanner */}
      <VirusWarningModal storageMB={storageMB} />

      {/* Main Page Layout */}
      <div className="relative w-full min-h-screen pb-28">
        {/* Top publisher navigation bar */}
        <nav className="sticky top-0 z-20 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
            <span className="font-extrabold tracking-tight text-lg text-neutral-950 font-sans">
              REALLY BAD WEBSITE<span className="text-blue-600">.IO</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold text-neutral-600">
            {/* Top nav MIDI toggle button tied to Global Audio Controller */}
            <button
              onClick={toggleMidi}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                isMidiPlaying
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md animate-pulse'
                  : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border-neutral-300'
              }`}
              title={isMidiPlaying ? 'Pause MIDI synth' : 'Play cheesy retro MIDI music'}
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

      {/* Layered Popups (Cookie wall, Newsletter, Permissions, Unskippable Ad) - Fixed to viewport */}
      <Popups
        showUnskippableAd={showUnskippableAd}
        onCloseUnskippableAd={() => setShowUnskippableAd(false)}
        onInitialPopupsCleared={() => setInitialPopupsCleared(true)}
      />

      {/* 
        Collapsible Chaos Lab Drawer:
        Fixed at bottom of viewport with emergency stop, audio MIDI, and live FPS readouts.
      */}
      <ChaosDrawer
        cpu={cpu}
        memoryMB={memoryMB}
        storageMB={storageMB}
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
