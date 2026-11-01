import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertTriangle, X } from 'lucide-react';
import { useAudioController } from '../context/AudioControllerContext.tsx';

interface PreVideoLocationModalProps {
  isOpen: boolean;
  onResolve: (granted: boolean) => void;
}

export const PreVideoLocationModal: React.FC<PreVideoLocationModalProps> = ({
  isOpen,
  onResolve,
}) => {
  const [coarseLocation, setCoarseLocation] = useState<string>('Resolving IP Coordinates...');
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  const { resumeAudioContext, playSwoosh, playBuzzer } = useAudioController();

  useEffect(() => {
    let isMounted = true;

    const fetchCoarseLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(2800),
        });
        if (response.ok) {
          const data = await response.json();
          const parts = [data.city, data.region, data.country_name].filter(Boolean);
          if (isMounted && parts.length > 0) {
            setCoarseLocation(parts.join(', '));
            setLoadingLocation(false);
            return;
          }
        }
      } catch (err) {
        // Fallback to secondary fast IP lookup
        try {
          const res2 = await fetch('https://api.country.is/', {
            signal: AbortSignal.timeout(2000),
          });
          if (res2.ok) {
            const data2 = await res2.json();
            if (isMounted && data2.country) {
              setCoarseLocation(`Metropolitan Sector, Country: ${data2.country}`);
              setLoadingLocation(false);
              return;
            }
          }
        } catch (err2) {}
      }

      if (isMounted) {
        setCoarseLocation('Metropolitan Terrestrial Sector #836');
        setLoadingLocation(false);
      }
    };

    if (isOpen) {
      fetchCoarseLocation();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGrantExact = () => {
    resumeAudioContext();
    playSwoosh();

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('Exact sub-meter coordinates acquired for syndicate partners:', pos.coords);
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem('rbw_location_granted', 'true');
            }
          },
          (err) => {
            console.warn('Exact coordinates denied or timed out:', err);
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem('rbw_location_granted', 'false');
            }
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } catch (e) {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('rbw_location_granted', 'false');
        }
      }
    }

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('rbw_location_decided', 'true');
      sessionStorage.setItem('rbw_location_granted', 'true');
    }

    onResolve(true);
  };

  const handleUseCoarse = () => {
    resumeAudioContext();
    playBuzzer();

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('rbw_location_decided', 'true');
      sessionStorage.setItem('rbw_location_granted', 'false');
    }

    onResolve(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="max-w-md w-full bg-neutral-900 border-2 border-red-500 rounded-2xl p-6 shadow-2xl text-white relative select-none">
        {/* Close corner X */}
        <button
          onClick={handleUseCoarse}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          title="Dismiss with reduced monetization"
          aria-label="Close location prompt"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="p-2 bg-red-600/30 text-red-400 border border-red-500/50 rounded-xl">
            <MapPin className="w-5 h-5 text-red-500 animate-bounce" />
          </span>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-extrabold block">
              SYNDICATE AD AUCTION MANDATE
            </span>
            <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
              Precise Coordinates Required for Video
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 text-xs text-neutral-300 leading-relaxed font-sans mb-5">
          <p>
            Our <strong>836 certified advertising syndicate partners</strong> require your exact physical coordinates before high-definition video transmission can be decrypted.
          </p>

          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block mb-1">
              Currently Broadcasted Coarse Location (via Public IP):
            </span>
            <p className="font-mono text-amber-400 font-bold text-sm flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{loadingLocation ? 'Pinging ISP nodes...' : coarseLocation}</span>
            </p>
          </div>

          <p className="text-[11px] text-neutral-400 italic bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-lg">
            We have already informed them that you are in <strong>{coarseLocation}</strong>, but your exact sub-meter GPS coordinates are <strong>48.7x more monetizable</strong> for our real-time bidding auction.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 font-sans">
          <button
            onClick={handleGrantExact}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Navigation className="w-4 h-4 text-emerald-200" />
            <span>Transmit Sub-Meter GPS Coordinates (Recommended)</span>
          </button>

          <button
            onClick={handleUseCoarse}
            className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 font-bold text-[11px] rounded-lg transition-colors cursor-pointer text-center"
          >
            Keep Coarse Location (Partners Will Suffer Reduced Yield)
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
          <span>GDPR / CCPA Disclaimer §14.8</span>
          <span className="text-amber-500 font-semibold">Bidding Pool: 836 Active</span>
        </div>
      </div>
    </div>
  );
};
