import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, X, SkipForward, AlertCircle } from 'lucide-react';
import { webMidi } from '../utils/webAudioMidi.ts';

const SCAM_VIDEOS = [
  {
    title: 'BREAKING NEWS: DIRE CONSUMER WARNING',
    src: '/assets/aistudio/Creating_scammy_sales_video_news_5a1cced2_f3d0f1d1.mp4',
    badge: 'URGENT NEWS BULLET',
  },
  {
    title: 'ATTENTION! $50,000 IN 24 HOURS (NOT A JOKE)',
    src: '/assets/aistudio/Make_aggressive_scammy_sales_video_53a44362_3f838ddc.mp4',
    badge: 'SECRET BANK LOOPHOLE',
  },
  {
    title: 'STOP SCROLLING! $10,000 MADE WHILE YOU WATCHED',
    src: '/assets/aistudio/Make_aggressive_scammy_sales_video_a61f6d50_1c9c8031.mp4',
    badge: 'GUARANTEED ROI NOTICE',
  },
  {
    title: 'CONSUMER ALERT: BUY THIS BEFORE IT IS BANNED',
    src: '/assets/aistudio/Creating_scammy_sales_video_news_a01c3c94_d96df73c.mp4',
    badge: 'CRITICAL INVENTORY ALERT',
  },
];

export const StickyVideo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isDocked, setIsDocked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

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

  // Handle video rotation on end
  const handleVideoEnded = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % SCAM_VIDEOS.length);
  };

  const currentVideo = SCAM_VIDEOS[currentVideoIndex];

  // Try to play when source changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentVideoIndex]);

  const videoElement = (
    <div className="relative w-full h-full bg-black overflow-hidden select-none border-2 border-amber-500 shadow-2xl flex flex-col justify-between">
      {/* Real HTML5 Video element */}
      <video
        ref={videoRef}
        key={currentVideo.src}
        src={currentVideo.src}
        autoPlay
        playsInline
        muted={isMuted}
        onEnded={handleVideoEnded}
        className="w-full h-full object-cover"
      />

      {/* Top Banner overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-2 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between text-white text-[11px]">
        <div className="flex items-center gap-1.5 font-bold text-amber-400">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span className="truncate max-w-[170px] sm:max-w-xs">{currentVideo.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
            {currentVideoIndex + 1}/{SCAM_VIDEOS.length}
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
          onClick={() => {
            webMidi.ensureAudioContext();
            setIsMuted((m) => !m);
            if (videoRef.current) {
              videoRef.current.muted = !videoRef.current.muted;
            }
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-black uppercase transition-all cursor-pointer ${
            isMuted
              ? 'bg-amber-400 text-black hover:bg-amber-300 animate-pulse shadow-md'
              : 'bg-neutral-800 text-white hover:bg-neutral-700'
          }`}
          aria-label={isMuted ? 'Unmute video sound' : 'Mute video sound'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-black" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{isMuted ? 'CLICK TO UNMUTE 🔊' : 'AUDIO ON 🔊'}</span>
        </button>

        <button
          onClick={handleVideoEnded}
          className="flex items-center gap-1 px-2 py-1 rounded bg-black/70 hover:bg-black text-neutral-300 text-[10px] font-semibold border border-neutral-700 cursor-pointer"
          title="Next scam video"
        >
          <span>Next Video</span>
          <SkipForward className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  return (
    <>
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
