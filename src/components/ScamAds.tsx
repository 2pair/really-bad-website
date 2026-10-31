import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

import jackedSeniorImg from '../assets/images/jacked_senior_diet_1793320684153.jpg';
import cryptoGuruImg from '../assets/images/crypto_guru_ad_1793320697079.jpg';
import investingSeniorsImg from '../assets/images/investing_for_seniors_1793436245850.jpg';
import casinoJackpotImg from '../assets/images/casino_jackpot_ad_1793436102420.jpg';
import canadianDrugsImg from '../assets/images/canadian_darkweb_drugs_1793436246265.jpg';
import gasMileageImg from '../assets/images/gas_mileage_trick_1793435781796.jpg';
import navySealImg from '../assets/images/navy_seal_bathing_1793435781709.jpg';
import catAstrologyImg from '../assets/images/cat_astrology_finance_1793435782618.jpg';
import freeIpadImg from '../assets/images/free_ipad_ad_1793436246644.jpg';
import meteorInsuranceImg from '../assets/images/meteor_insurance_1793435782326.jpg';
import telepathicAnimalImg from '../assets/images/telepathic_animal_ad_1793436248281.jpg';

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
  fontFamily: string;
}

const AD_ROTATION: ScamAdConfig[] = [
  {
    id: 'weight-loss-cure',
    type: 'image',
    headline: 'THE 24-HOUR BELLY-MELTING MIRACLE DISCOVERY',
    subhead: 'Doctors are begging patients to stop using this 1 ancient yellow fruit ritual before bedtime.',
    image: jackedSeniorImg,
    ctaText: 'SEE THE CLINICAL WEIGHT LOSS DEMO >',
    badge: 'DOCTOR CENSORED CURE',
    bgColor: 'bg-yellow-400',
    textColor: 'text-black',
    fontFamily: "'Bebas Neue', Impact, sans-serif",
  },
  {
    id: 'investing-for-seniors',
    type: 'image',
    headline: 'GUARANTEED 450% SENIOR BOND DIVIDENDS: RETIRE RICH',
    subhead: 'Over 62? The Treasury does not want seniors learning this secret compound dividend loophole.',
    image: investingSeniorsImg,
    ctaText: 'CLAIM FREE SENIOR GOLD KIT NOW',
    badge: 'SENIOR WEALTH ALERT',
    bgColor: 'bg-amber-100',
    textColor: 'text-neutral-950',
    fontFamily: "'Cinzel', Georgia, serif",
  },
  {
    id: 'online-casinos',
    type: 'image',
    headline: 'LOCAL MAN WINS $1.4M ON PHONE DURING LUNCH BREAK!',
    subhead: 'This government-licensed digital slots vulnerability pays out on every 3rd spin. Play before patched.',
    image: casinoJackpotImg,
    ctaText: 'SPIN 50 FREE TURNS INSTANTLY >',
    badge: 'CASINO GLITCH REPORT',
    bgColor: 'bg-neutral-950',
    textColor: 'text-amber-300',
    fontFamily: "'Russo One', sans-serif",
  },
  {
    id: 'canadian-drugs-darkweb',
    type: 'image',
    headline: 'CANADIAN PRESCRIPTION DRUGS FROM THE DARK WEB WHOLESALE',
    subhead: 'Skip doctor visits forever. 99% purity Canadian pharmaceutical surplus delivered in discrete lead boxes.',
    image: canadianDrugsImg,
    ctaText: 'UNLOCK THE DARK WEB REPOSITORY',
    badge: 'OFFSHORE PHARMACY DISPATCH',
    bgColor: 'bg-slate-950',
    textColor: 'text-cyan-300',
    fontFamily: "'Share Tech Mono', monospace",
  },
  {
    id: 'gas-mileage-trick',
    type: 'image',
    headline: 'SCIENTISTS ARE FURIOUS ABOUT THIS WEIRD TRICK TO BOOST GAS MILEAGE!',
    subhead: 'Wrap an everyday kitchen magnet around your fuel line to triple your MPG instantly. Big Oil hates him!',
    image: gasMileageImg,
    ctaText: 'SEE THE 3-SECOND INSTALLATION HACK',
    badge: 'ENERGY CARTEL LEAK',
    bgColor: 'bg-emerald-900',
    textColor: 'text-yellow-300',
    fontFamily: "'Anton', sans-serif",
  },
  {
    id: 'navy-seal-bathing',
    type: 'image',
    headline: 'FORMER NAVY SEAL INVENTS METHOD TO ELIMINATE BATHING FOREVER',
    subhead: 'Special Forces covert bio-spray wipes out 100% of human odor molecules without a single drop of water.',
    image: navySealImg,
    ctaText: 'ORDER MILITARY SURPLUS MIST >',
    badge: 'CLASSIFIED HYGIENE TECH',
    bgColor: 'bg-neutral-900',
    textColor: 'text-emerald-400',
    fontFamily: "'Black Ops One', cursive",
  },
  {
    id: 'cat-astrology-finance',
    type: 'image',
    headline: 'FIND OUT WHAT YOUR CAT’S STAR SIGN SAYS ABOUT ITS FINANCIAL FUTURE!',
    subhead: 'Astrological alignment predicts which felines are destined to inherit generational wealth.',
    image: catAstrologyImg,
    ctaText: 'CALCULATE PET HOROSCOPE NOW 🔮',
    badge: 'COSMIC WEALTH READING',
    bgColor: 'bg-purple-950',
    textColor: 'text-pink-300',
    fontFamily: "'Fredoka', cursive, sans-serif",
  },
  {
    id: 'free-ipad-act-fast',
    type: 'image',
    headline: '⚡ FREE IPAD PRO ACT FAST: ONLY 3 UNITS REMAINING!',
    subhead: 'Unclaimed warehouse logistics inventory awarded to visitor #48,192. Confirm zip code immediately.',
    image: freeIpadImg,
    ctaText: 'CONFIRM DELIVERY ADDRESS NOW >',
    badge: 'OVERSTOCK CLEARANCE ALERT',
    bgColor: 'bg-red-600',
    textColor: 'text-white',
    fontFamily: "'Teko', sans-serif",
  },
  {
    id: 'meteor-insurance',
    type: 'image',
    headline: 'IS YOUR PROPERTY COVERED AGAINST DIRECT METEORITE IMPACT?',
    subhead: 'Standard homeowners insurance excludes deep-space cosmic ballistic debris. Get $10,000,000 asteroid protection.',
    image: meteorInsuranceImg,
    ctaText: 'GET INSTANT ORBITAL QUOTE ($4.99/MO)',
    badge: 'DEEP SPACE HAZARD NOTICE',
    bgColor: 'bg-blue-950',
    textColor: 'text-orange-300',
    fontFamily: "'Orbitron', sans-serif",
  },
  {
    id: 'telepathic-animal-command',
    type: 'image',
    headline: 'LEARN TO COMMAND ANY ANIMAL TELEPATHICALLY WITH YOUR MIND',
    subhead: 'Tibetan frequency unlocks dormant psychic cranial waves to mentally direct dogs, bears, and birds.',
    image: telepathicAnimalImg,
    ctaText: 'ACTIVATE PSYCHIC ANIMAL LINK',
    badge: 'ESOTERIC MIND SCIENCE',
    bgColor: 'bg-indigo-950',
    textColor: 'text-teal-200',
    fontFamily: "'MedievalSharp', cursive",
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
    fontFamily: "'Press Start 2P', monospace",
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
    fontFamily: "'VT323', monospace",
  },
];

interface ScamAdsProps {
  position?: 'top' | 'mid' | 'bottom';
}

export const ScamAds: React.FC<ScamAdsProps> = ({ position = 'mid' }) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (position === 'top') return 0;
    if (position === 'bottom') return 2;
    return 1;
  });
  const [isVisible, setIsVisible] = useState(true);
  const [adTimer, setAdTimer] = useState(175); // 02:55 countdown

  // Ticking urgency countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setAdTimer((prev) => (prev > 0 ? prev - 1 : 180));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fast rotation cycle every 12 seconds to provoke maximum distraction
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % AD_ROTATION.length);
    }, 12000);
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
    return null;
  }

  const currentAd = AD_ROTATION[currentIndex];
  const m = Math.floor(adTimer / 60);
  const s = adTimer % 60;
  const timeFormatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return (
    <div className="my-6 w-full select-none transition-all duration-150 animate-in fade-in">
      <div
        className={`relative w-full rounded-none border-4 border-dashed border-red-600 shadow-2xl p-3 sm:p-5 ${currentAd.bgColor} ${currentAd.textColor}`}
        style={{ fontFamily: currentAd.fontFamily }}
      >
        {/* Google Ads-like Top Right Info & Close buttons */}
        <div className="absolute top-1 right-1 flex items-center bg-white/90 px-1.5 py-0.5 rounded shadow text-neutral-600 text-[10px] font-sans font-normal z-20">
          <span className="flex items-center gap-0.5 mr-2 text-[9px] hover:underline cursor-pointer">
            <Info className="w-2.5 h-2.5" /> AdChoices
          </span>
          <button
            onClick={handleClose}
            className="hover:bg-neutral-200 text-neutral-800 p-0.5 rounded cursor-pointer"
            title="Close this ad"
            aria-label="Close ad"
          >
            ✕
          </button>
        </div>

        {/* Fake Urgency Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pr-20">
          <span className="inline-block px-2 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-none animate-pulse">
            {currentAd.badge}
          </span>
          <span className="text-[11px] font-mono text-red-400 font-bold bg-black/60 px-2 py-0.5 rounded">
            LIMITED OFFER EXPIRES: {timeFormatted}
          </span>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {currentAd.image && (
            <div className="relative w-full sm:w-48 h-36 shrink-0 bg-black overflow-hidden border-2 border-white shadow-md">
              <img
                src={currentAd.image}
                alt={currentAd.headline}
                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
              />
              <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] text-yellow-400 px-1 rounded font-mono">
                LIVE DEMO
              </span>
            </div>
          )}

          <div className="flex-1 space-y-2 text-left">
            <h4 className="text-base sm:text-lg font-black leading-tight uppercase tracking-tight drop-shadow-sm">
              {currentAd.headline}
            </h4>
            <p className="text-xs sm:text-sm font-normal opacity-90 leading-snug">
              {currentAd.subhead}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  alert('WARNING: Redirecting to verified partner payment portal...');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-red-500/50 transform hover:-translate-y-0.5 transition-all cursor-pointer animate-bounce"
              >
                {currentAd.ctaText}
              </button>
              <span className="text-[10px] font-normal opacity-75 italic">
                *No purchase necessary, subject to Terms & Subsections §1-§45.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
