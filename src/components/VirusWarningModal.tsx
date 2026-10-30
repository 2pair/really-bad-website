import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, X, Terminal, CheckCircle2 } from 'lucide-react';
import { useAudioController } from '../context/AudioControllerContext.tsx';

interface VirusWarningModalProps {
  storageMB: number; // 0 to 4096
  onDismiss?: () => void;
}

export const VirusWarningModal: React.FC<VirusWarningModalProps> = ({
  storageMB,
  onDismiss,
}) => {
  const { playBuzzer } = useAudioController();
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(115); // 01:55 countdown
  const [scanState, setScanState] = useState<'alert' | 'scanning' | 'cleaned'>('alert');
  const [scanProgress, setScanProgress] = useState(0);

  // Trigger when storage is getting full (> 2400 MB)
  useEffect(() => {
    if (storageMB >= 2400 && !hasTriggered) {
      setIsOpen(true);
      setHasTriggered(true);
      playBuzzer();
    }
  }, [storageMB, hasTriggered, playBuzzer]);

  // Urgency Countdown timer
  useEffect(() => {
    if (!isOpen || scanState !== 'alert') return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, scanState]);

  const handleStartScan = () => {
    setScanState('scanning');
    setScanProgress(5);
    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setScanState('cleaned');
          return 100;
        }
        return p + Math.floor(Math.random() * 18 + 8);
      });
    }, 250);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onDismiss) onDismiss();
  };

  if (!isOpen) return null;

  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-lg w-full bg-neutral-950 border-4 border-red-600 rounded-2xl shadow-2xl overflow-hidden font-sans text-neutral-100">
        {/* Camouflaged close button: dark red on dark red in top right */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1.5 text-red-900/60 hover:text-red-400 transition-colors z-20"
          title="Dismiss alert"
          aria-label="Dismiss virus alert"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Flashing Urgency Header */}
        <div className="bg-gradient-to-r from-red-700 via-rose-600 to-red-800 p-4 flex items-center justify-between text-white border-b-2 border-red-500">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 animate-pulse text-amber-300" />
            <h3 className="font-black text-sm uppercase tracking-wider">
              CRITICAL HARD DRIVE THREAT DETECTED
            </h3>
          </div>
          <span className="bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 font-bold border border-red-400">
            SECTOR: CRITICAL
          </span>
        </div>

        {/* Urgency Countdown Banner */}
        <div className="bg-red-950/90 px-4 py-2 flex items-center justify-between border-b border-red-900/60 font-mono text-xs text-red-200">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            AUTOMATIC DATA CORRUPTION IN:
          </span>
          <span className="font-black text-amber-400 text-sm bg-black px-2 py-0.5 rounded border border-red-800">
            {timeFormatted}
          </span>
        </div>

        {/* Body content based on state */}
        <div className="p-5">
          {scanState === 'alert' && (
            <>
              <div className="flex items-start gap-3 bg-red-950/40 p-3.5 rounded-xl border border-red-900 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-red-300">
                    Storage Allocation: {storageMB} MB ({Math.round((storageMB / 4096) * 100)}% Capacity)
                  </p>
                  <p className="text-neutral-400 leading-relaxed">
                    A severe Trojan heuristic (Trojan.Win64.ChronoShift) is occupying sector blocks and generating random corruption matrices in your outer viewport!
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-5 text-[11px] font-mono text-neutral-400 bg-black p-3 rounded-lg border border-neutral-800">
                <div className="flex justify-between">
                  <span>Infected Files:</span>
                  <span className="text-red-400 font-bold">14,892 objects</span>
                </div>
                <div className="flex justify-between">
                  <span>System Memory Impact:</span>
                  <span className="text-amber-400 font-bold">SEVERE DEGRADATION</span>
                </div>
                <div className="flex justify-between">
                  <span>Action Required:</span>
                  <span className="text-emerald-400 font-bold">IMMEDIATE ANTIMALWARE DISINFECTION</span>
                </div>
              </div>

              <button
                onClick={handleStartScan}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase rounded-xl tracking-wider shadow-lg border border-red-400 cursor-pointer active:scale-98 animate-pulse"
              >
                🛡️ RUN DEEP SYSTEM CLEANSE & REPAIR NOW
              </button>
            </>
          )}

          {scanState === 'scanning' && (
            <div className="py-4 text-center">
              <Terminal className="w-10 h-10 text-amber-400 mx-auto mb-3 animate-spin" />
              <h4 className="font-bold text-sm mb-1 text-amber-300">
                DISINFECTING HARD DRIVE SECTORS...
              </h4>
              <p className="text-xs text-neutral-400 mb-4 font-mono">
                Purging Trojan.Win64.ChronoShift payload...
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-neutral-800 h-3 rounded-full overflow-hidden mb-2 border border-neutral-700">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-200"
                  style={{ width: `${Math.min(100, scanProgress)}%` }}
                />
              </div>
              <span className="text-xs font-mono text-neutral-300">{Math.min(100, scanProgress)}% Complete</span>
            </div>
          )}

          {scanState === 'cleaned' && (
            <div className="py-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <h4 className="font-extrabold text-base text-emerald-400 mb-1">
                SYSTEM REPAIRED & DISINFECTED!
              </h4>
              <p className="text-xs text-neutral-300 mb-5 max-w-sm mx-auto">
                All 14,892 infected files were quarantined. Your browser registry has been restored to baseline parameters.
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                RETURN TO BROWSING
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
