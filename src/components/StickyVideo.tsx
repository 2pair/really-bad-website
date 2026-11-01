import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, X, SkipForward, MapPin, Database } from 'lucide-react';
import { useAudioController } from '../context/AudioControllerContext.tsx';
import { resolvePublicAsset } from '../utils/assetUrl.ts';
import { fetchVideoWithCache } from '../utils/videoCache.ts';
import { PreVideoLocationModal } from './PreVideoLocationModal.tsx';
import { SCAM_VIDEOS } from 'virtual:scam-videos';

// Helper to choose a random next index avoiding repeating the current video
const getRandomNextIndex = (currentIndex: number, total: number) => {
  if (total <= 1) return 0;
  let next = Math.floor(Math.random() * total);
  while (next === currentIndex) {
    next = Math.floor(Math.random() * total);
  }
  return next;
};

export const StickyVideo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Start at a random video index from dynamically enumerated videos
  const [currentVideoIndex, setCurrentVideoIndex] = useState(() =>
    Math.floor(Math.random() * Math.max(1, SCAM_VIDEOS.length))
  );
  const [isDocked, setIsDocked] = useState(false);
  const { isVideoUnmuted, toggleVideoAudio, registerVideoElement } = useAudioController();

  // On-demand video caching state
  const [activeVideoSrc, setActiveVideoSrc] = useState<string>('');
  const [isCached, setIsCached] = useState<boolean>(false);

  // Location mandate prompt before video starts
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(() => {
    return typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('rbw_location_decided') !== 'true'
      : true;
  });

  useEffect(() => {
    registerVideoElement(videoRef.current);
    return () => registerVideoElement(null);
  }, [registerVideoElement]);

  // Dock to screen corner when user scrolls past
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top < -50) {
        setIsDocked(true);
      } else {
        setIsDocked(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentVideo = SCAM_VIDEOS[currentVideoIndex] || SCAM_VIDEOS[0];

  // Fetch on-demand and aggressively store in page/disk cache
  useEffect(() => {
    let active = true;
    if (!currentVideo) return;

    const resolvedUrl = resolvePublicAsset(currentVideo.src);

    fetchVideoWithCache(resolvedUrl).then((cachedOrOriginal) => {
      if (active) {
        setActiveVideoSrc(cachedOrOriginal);
        setIsCached(cachedOrOriginal.startsWith('blob:'));
      }
    });

    return () => {
      active = false;
    };
  }, [currentVideoIndex, currentVideo]);

  // Play video on demand once source is ready and location prompt has resolved
  useEffect(() => {
    if (videoRef.current && activeVideoSrc && !isLocationModalOpen) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [activeVideoSrc, isLocationModalOpen]);

  // Randomized playback order when video finishes
  const handleVideoEnded = () => {
    setCurrentVideoIndex((prev) => getRandomNextIndex(prev, SCAM_VIDEOS.length));
  };

  const videoElement = (
    <div className="relative w-full h-full bg-black overflow-hidden select-none border-2 border-amber-500 shadow-2xl flex flex-col justify-between">
      {/* Real HTML5 Video element loaded on demand */}
      {activeVideoSrc ? (
        <video
          ref={videoRef}
          key={activeVideoSrc}
          src={activeVideoSrc}
          autoPlay={!isLocationModalOpen}
          playsInline
          muted={!isVideoUnmuted}
          onEnded={handleVideoEnded}
          className={`w-full h-full object-cover transition-filter duration-300 ${
            isLocationModalOpen ? 'blur-md brightness-50' : ''
          }`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black text-amber-400 font-mono text-xs">
          FETCHING VIDEO STREAM FROM SYNDICATE CDN...
        </div>
      )}

      {/* Gated location overlay if awaiting prompt */}
      {isLocationModalOpen && (
        <div
          onClick={() => setIsLocationModalOpen(true)}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-black/60 text-center cursor-pointer"
        >
          <span className="p-3 bg-red-600/40 text-red-400 rounded-2xl border border-red-500 mb-2">
            <MapPin className="w-6 h-6 animate-bounce" />
          </span>
          <p className="font-mono text-xs font-black uppercase text-amber-400">
            VIDEO GATED: AWAITING LOCATION COORDINATES
          </p>
          <p className="text-[10px] text-neutral-300 mt-1 max-w-xs">
            Click to transmit coordinates for our 836 advertising partners.
          </p>
        </div>
      )}

      {/* Top Banner overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-2 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between text-white text-[11px]">
        <div className="flex items-center gap-1.5 font-bold text-amber-400 min-w-0">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
          <span className="truncate max-w-[150px] sm:max-w-xs">{currentVideo?.title}</span>
          {isCached && (
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700 shrink-0">
              <Database className="w-2.5 h-2.5" /> CACHED
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
            {currentVideo?.badge}
          </span>
          <button
            onClick={() => setIsDocked(false)}
            className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
            title="Minimize"
            aria-label="Minimize sponsored video"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom control bar with UNMUTE prompt */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-2 bg-gradient-to-t from-black/95 to-transparent flex items-center justify-between">
        <button
          onClick={toggleVideoAudio}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-black uppercase transition-all cursor-pointer ${
            !isVideoUnmuted
              ? 'bg-amber-400 text-black hover:bg-amber-300 animate-pulse shadow-md'
              : 'bg-neutral-800 text-white hover:bg-neutral-700'
          }`}
          aria-label={!isVideoUnmuted ? 'Unmute video sound' : 'Mute video sound'}
        >
          {!isVideoUnmuted ? (
            <VolumeX className="w-3.5 h-3.5 text-black" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{!isVideoUnmuted ? 'CLICK TO UNMUTE 🔊' : 'AUDIO ON 🔊'}</span>
        </button>

        <button
          onClick={handleVideoEnded}
          className="flex items-center gap-1 px-2 py-1 rounded bg-black/70 hover:bg-black text-neutral-300 text-[10px] font-semibold border border-neutral-700 cursor-pointer"
          title="Play random next scam video"
        >
          <span>Shuffle Next</span>
          <SkipForward className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Pre-video Location Mandate Modal */}
      <PreVideoLocationModal
        isOpen={isLocationModalOpen}
        onResolve={() => setIsLocationModalOpen(false)}
      />

      {/* Anchor placeholder in the document flow */}
      <div
        ref={containerRef}
        className="my-4 w-full max-w-2xl mx-auto h-64 sm:h-80 bg-neutral-950 rounded-xl overflow-hidden shadow-2xl"
      >
        {!isDocked && videoElement}
      </div>

      {/* Sticky docked viewport player */}
      {isDocked && (
        <div className="fixed top-18 right-5 z-40 w-72 h-44 sm:w-80 sm:h-48 rounded-xl overflow-hidden shadow-2xl ring-2 ring-amber-500 animate-in fade-in zoom-in-95 duration-200">
          {videoElement}
        </div>
      )}
    </>
  );
};
