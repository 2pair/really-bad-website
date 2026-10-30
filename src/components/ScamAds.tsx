import React, { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import jackedSeniorImg from '../assets/images/jacked_senior_diet_1793320684153.jpg';
import cryptoGuruImg from '../assets/images/crypto_guru_ad_1793320697079.jpg';

interface ScamAdConfig {
  id: string;
  type: 'image' | 'system_alert' | 'text_tabloid';
  headline: string;
  subhead: string;
  image?: string;
  ctaText: string;
  badge: string;
  bgColor: string;
  textColor: string;
}

const AD_ROTATION: ScamAdConfig[] = [
  {
    id: 'jacked-grandpa',
    type: 'image',
    headline: '75-YEAR-OLD GRANDPA BUILDS HUGE MUSCLES FAST!',
    subhead: 'Local doctors are furious. He drinks this 1 yellow fruit before bed.',
    image: jackedSeniorImg,
    ctaText: 'SEE THE SECRET RECIPE >',
    badge: 'SPONSORED HEALTH REPORT',
    bgColor: 'bg-yellow-400',
    textColor: 'text-black',
  },
  {
    id: 'crypto-leak',
    type: 'image',
    headline: 'CENTRAL BANKS BEGGED TO TAKE THIS DOWN!',
    subhead: 'System glitch allows everyday citizens to claim quantum tokens daily.',
    image: cryptoGuruImg,
    ctaText: 'CLAIM $4,890 VOUCHER NOW',
    badge: 'BREAKING FINANCIAL NOTICE',
    bgColor: 'bg-neutral-900',
    textColor: 'text-yellow-300',
  },
  {
    id: 'pc-cleaner',
    type: 'system_alert',
    headline: '⚠️ CRITICAL PERFORMANCE WARNING: 94% MEMORY LEAK DETECTED',
    subhead: 'Your browser cache contains 418 junk cookies. Click OK to download 32GB Cloud RAM immediately.',
    ctaText: 'START INSTANT OPTIMIZATION (RECOMMENDED)',
    badge: 'SECURITY THREAT LEVEL: HIGH',
    bgColor: 'bg-blue-900',
    textColor: 'text-white',
  },
  {
    id: 'dentist-hack',
    type: 'text_tabloid',
    headline: 'WHY DENTISTS CANNOT LEGALLY STOP THIS REVOLUTION',
    subhead: 'Rub this common pantry root on your molars for 12 seconds to grow new enamel.',
    ctaText: 'WATCH UNCENSORED DEMO',
    badge: 'MEDICAL INDUSTRY SECRETS',
    bgColor: 'bg-red-700',
    textColor: 'text-white',
  },
];

interface ScamAdsProps {
  position?: 'top' | 'mid' | 'bottom';
}

export const ScamAds: React.FC<ScamAdsProps> = ({ position = 'mid' }) => {
  const [currentIndex, setCurrentIndex] = useState(position === 'top' ? 0 : 1);
  const [isVisible, setIsVisible] = useState(true);
  const [adTimer, setAdTimer] = useState(175); // 02:55 countdown

  // Ticking urgency countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setAdTimer((prev) => (prev > 0 ? prev - 1 : 180));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rotation cycle every 24 seconds
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % AD_ROTATION.length);
    }, 24000);
    return () => clearInterval(interval);
  }, [isVisible]);

  // When user closes the ad, a new ad loads in after 5 seconds (creating layout shift!)
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % AD_ROTATION.length);
      setIsVisible(true);
    }, 5000);
  };

  if (!isVisible) {
    // Unreserving space creates instant reflow / layout shift!
    return null;
  }

  const currentAd = AD_ROTATION[currentIndex];
  const m = Math.floor(adTimer / 60);
  const s = adTimer % 60;
  const timeFormatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return (
    <div className="my-6 w-full select-none transition-all duration-150 animate-in fade-in">
      <div
        className={`relative w-full rounded-none border-4 border-dashed border-red-600 shadow-2xl p-3 sm:p-5 ${currentAd.bgColor} ${currentAd.textColor} font-sans`}
        style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
      >
        {/* Google Ads-like Top Right Info & Close buttons */}
        <div className="absolute top-1 right-1 flex items-center bg-white/90 px-1.5 py-0.5 rounded shadow text-neutral-600 text-[10px] font-sans font-normal z-20">
          <span className="flex items-center gap-0.5 mr-2 text-[9px] hover:underline cursor-pointer">
            <Info className="w-2.5 h-2.5" /> AdChoices
          </span>
          <button
            onClick={handleClose}
            className="hover:bg-neutral-200 p-0.5 rounded transition-colors cursor-pointer"
            title="Close this ad"
            aria-label="Close advertisement"
          >
            <X className="w-3 h-3 text-neutral-800" />
          </button>
        </div>

        {/* Ad Tag badge & Urgency Countdown */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="inline-block bg-black text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
            {currentAd.badge}
          </div>
          <div className="inline-flex items-center gap-1 bg-red-600 text-yellow-200 text-[10px] font-mono font-black px-2 py-0.5 rounded animate-pulse border border-yellow-300">
            <span>⏰ URGENT ALLOCATION WINDOW:</span>
            <span className="text-white">{timeFormatted}</span>
          </div>
        </div>

        {/* Ad Body Content based on Trope */}
        {currentAd.type === 'image' && currentAd.image && (
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-3/5 overflow-hidden border-2 border-black rounded">
              <img
                src={currentAd.image}
                alt={currentAd.headline}
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="w-full md:w-2/5 flex flex-col justify-center text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black leading-tight tracking-tight uppercase drop-shadow-sm">
                {currentAd.headline}
              </h3>
              <p className="mt-2 text-sm font-bold opacity-90 leading-snug">
                {currentAd.subhead}
              </p>
              <button
                onClick={() => alert('Redirecting to 14 affiliate tracking redirects...')}
                className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase rounded shadow-lg border-2 border-white animate-bounce cursor-pointer tracking-wider"
              >
                👉 {currentAd.ctaText}
              </button>
            </div>
          </div>
        )}

        {currentAd.type === 'system_alert' && (
          <div className="py-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-600 text-white mb-2 animate-pulse">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase text-amber-300">
              {currentAd.headline}
            </h3>
            <p className="mt-2 text-sm font-medium max-w-xl mx-auto">
              {currentAd.subhead}
            </p>
            <button
              onClick={() => alert('Installing CloudRAM32GB.exe...')}
              className="mt-4 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-base uppercase rounded-lg shadow-xl border-2 border-black tracking-wide"
            >
              ⚡ {currentAd.ctaText}
            </button>
          </div>
        )}

        {currentAd.type === 'text_tabloid' && (
          <div className="py-4 px-2 text-center">
            <span className="text-4xl">🦷</span>
            <h3 className="text-2xl font-black uppercase tracking-tight mt-1 text-white">
              {currentAd.headline}
            </h3>
            <p className="mt-2 text-sm font-medium text-red-100 max-w-lg mx-auto">
              {currentAd.subhead}
            </p>
            <button
              onClick={() => alert('Loading 45 minute video presentation...')}
              className="mt-4 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase tracking-wider rounded border border-black shadow"
            >
              ▶️ {currentAd.ctaText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
