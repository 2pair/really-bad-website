import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Cpu,
  Layers,
  HardDrive,
  AlertOctagon,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  Gauge,
  Clock,
} from 'lucide-react';
import { useAudioController } from '../context/AudioControllerContext.tsx';
import { formatBytes } from '../utils/resourceMath.ts';
import type { WorkerMetrics } from '../utils/workerManager.ts';

interface ChaosDrawerProps {
  cpu: number;
  memoryMB: number;
  storageMB: number;
  maxMemoryMB?: number;
  onCpuChange: (val: number) => void;
  onMemoryChange: (val: number) => void;
  onStorageChange: (val: number) => void;
  onEmergencyStop: () => void;
  workerMetrics: WorkerMetrics;
}

export const ChaosDrawer: React.FC<ChaosDrawerProps> = ({
  cpu,
  memoryMB,
  storageMB,
  maxMemoryMB = 4096,
  onCpuChange,
  onMemoryChange,
  onStorageChange,
  onEmergencyStop,
  workerMetrics,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAnythingPlaying, toggleGlobalMute } = useAudioController();
  const [fps, setFps] = useState<number>(60);
  const [renderTimeMs, setRenderTimeMs] = useState<number>(1.2);

  // Measure live FPS and frame time
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const loop = (timestamp: number) => {
      frameCountRef.current++;
      const delta = timestamp - lastTimeRef.current;
      if (delta >= 500) {
        const currentFps = Math.min(120, Math.round((frameCountRef.current * 1000) / delta));
        const estimatedFrameLatency = parseFloat((delta / frameCountRef.current).toFixed(2));
        setFps(currentFps);
        setRenderTimeMs(estimatedFrameLatency);
        frameCountRef.current = 0;
        lastTimeRef.current = timestamp;
      }
      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 font-sans shadow-2xl ${
        isOpen ? 'h-84' : 'h-13'
      } bg-neutral-900 border-t border-neutral-700 text-neutral-100 flex flex-col`}
    >
      {/* Top Bar of the drawer (always visible at bottom or top of drawer) */}
      <div className="h-13 px-3 sm:px-5 flex items-center justify-between bg-neutral-950 border-b border-neutral-800 shrink-0 select-none">
        {/* Left: Branding & expand button */}
        <div className="flex items-center gap-2 sm:gap-4 mr-3">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold tracking-wide transition-colors cursor-pointer"
            title={isOpen ? 'Collapse Chaos Experimental Laboratory' : 'Expand Chaos Experimental Laboratory'}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-amber-400 animate-bounce" />
            ) : (
              <ChevronUp className="w-4 h-4 text-amber-400 animate-bounce" />
            )}
            <span className="hidden md:inline">CHAOS EXPERIMENTAL LABORATORY</span>
            <span className="md:hidden">CHAOS LAB</span>
          </button>

          {/* Mini readouts on the bar */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-neutral-400">
            <span className="flex items-center gap-1">
              <Cpu className={`w-3.5 h-3.5 ${cpu > 70 ? 'text-red-400 animate-pulse' : 'text-neutral-400'}`} />
              CPU: <strong className="text-neutral-200">{cpu}%</strong>
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              MEM: <strong className="text-neutral-200">{memoryMB} MB</strong>
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              IDB: <strong className="text-neutral-200">{storageMB} MB</strong>
            </span>
          </div>
        </div>

        {/* Center / Right controls container */}
        <div className="flex items-center">
          {/* Unboxed FPS readout: text/icon that changes color based on frame rate */}
          <div
            className={`h-7 flex items-center gap-1 px-1 text-xs font-mono font-bold transition-colors select-none mr-3 sm:mr-4 ${
              fps < 30
                ? 'text-red-400'
                : fps < 50
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
            title="Live Display Frame Rate"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{fps} FPS</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 h-7 px-1 text-neutral-500 text-xs font-mono mr-3 sm:mr-4">
            <Clock className="w-3 h-3 text-neutral-600" />
            <span>{renderTimeMs}ms</span>
          </div>

          {/* Unboxed Global Audio Mute / Unmute Controller: text/icon that changes color to reflect state */}
          <button
            onClick={toggleGlobalMute}
            className={`h-7 flex items-center gap-1.5 px-1 text-xs font-mono font-semibold transition-colors cursor-pointer mr-3 sm:mr-4 ${
              isAnythingPlaying
                ? 'text-emerald-400 hover:text-emerald-300'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title={
              isAnythingPlaying
                ? 'Global Audio: Playing. Click to mute all audio sources'
                : 'Global Audio: Muted. Click to restore previous audio'
            }
            aria-label={isAnythingPlaying ? 'Mute all audio' : 'Unmute all audio'}
          >
            {isAnythingPlaying ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <span className="hidden sm:inline">
              {isAnythingPlaying ? 'AUDIO ON' : 'AUDIO MUTED'}
            </span>
            <span className="sm:hidden">
              {isAnythingPlaying ? 'ON' : 'MUTED'}
            </span>
          </button>

          {/* Emergency Stop Button - 1/3 smaller, compact, matching h-7 height */}
          <button
            onClick={onEmergencyStop}
            className="h-7 flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider shadow hover:shadow-red-500/30 transition-all active:scale-90 cursor-pointer"
            title="Reset all resource usage and clear IndexedDB stores"
          >
            <AlertOctagon className="w-3 h-3 text-white animate-pulse" />
            <span className="whitespace-nowrap">EMERGENCY STOP</span>
          </button>
        </div>
      </div>

      {/* Expanded Controls Drawer Area */}
      {isOpen && (
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-neutral-900 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CPU Slider Card */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold flex items-center gap-1.5 text-orange-400">
                  <Flame className="w-4 h-4 text-orange-500" />
                  CPU Saturation Target
                </span>
                <span className="font-mono text-sm font-bold text-orange-300 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800">
                  {cpu}%
                </span>
              </div>
              <p className="text-xs text-neutral-400 mb-4">
                Spin-waits in {workerMetrics.concurrencyLimit} concurrent Web Workers. Ignites screen edge burning heat effect. Caps at 99%.
              </p>
              <input
                type="range"
                min="0"
                max="99"
                value={cpu}
                aria-label="CPU Saturation Target"
                onChange={(e) => onCpuChange(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer h-2 bg-neutral-800 rounded-lg appearance-none"
              />
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-800 flex justify-between text-[11px] font-mono text-neutral-500">
              <span>Duty: {cpu}%</span>
              <span>Workers: {workerMetrics.concurrencyLimit} active</span>
            </div>
          </div>

          {/* Memory Slider Card with Dynamic Marshal High Watermark Max */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold flex items-center gap-1.5 text-blue-400">
                  <Layers className="w-4 h-4 text-blue-500" />
                  In-Memory Footprint
                </span>
                <span className="font-mono text-sm font-bold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                  {memoryMB} MB
                </span>
              </div>
              <p className="text-xs text-neutral-400 mb-4">
                Sequential 1024MB worker fleet. Marshal monitors for OOM and clamps maximum slider limit to nearest full worker high watermark.
              </p>
              <input
                type="range"
                min="0"
                max={maxMemoryMB}
                step="1"
                value={Math.min(memoryMB, maxMemoryMB)}
                aria-label="In-Memory Footprint Target"
                onChange={(e) => onMemoryChange(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-2 bg-neutral-800 rounded-lg appearance-none"
              />
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-800 flex justify-between text-[11px] font-mono text-neutral-500">
              <span>Allocated: {formatBytes(workerMetrics.totalMemoryBytes)}</span>
              <span>Watermark Limit: {maxMemoryMB} MB ({(maxMemoryMB / 1024).toFixed(1)} GB)</span>
            </div>
          </div>

          {/* IndexedDB Storage Slider Card */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold flex items-center gap-1.5 text-emerald-400">
                  <HardDrive className="w-4 h-4 text-emerald-500" />
                  IndexedDB Storage
                </span>
                <span className="font-mono text-sm font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  {storageMB} MB
                </span>
              </div>
              <p className="text-xs text-neutral-400 mb-4">
                Writes non-compressible random chunks to disk. Generates dense 1mm corruption squares across screen & triggers virus alert.
              </p>
              <input
                type="range"
                min="0"
                max="4096"
                step="1"
                value={storageMB}
                aria-label="IndexedDB Storage Target"
                onChange={(e) => onStorageChange(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-neutral-800 rounded-lg appearance-none"
              />
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-800 flex justify-between text-[11px] font-mono text-neutral-500">
              <span>IDB Written: {formatBytes(workerMetrics.totalStorageBytes)}</span>
              <span>Viewport: {Math.round((1 - (storageMB / 4096) * 0.6) * 100)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
