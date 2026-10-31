import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Bell,
  Camera,
  X,
  FileText,
  ChevronDown,
  ChevronUp,
  Lock,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { useAudioController } from '../context/AudioControllerContext.tsx';

interface PopupsProps {
  showUnskippableAd: boolean;
  onCloseUnskippableAd: () => void;
  onGrantCamera?: (stream: MediaStream) => void;
  onInitialPopupsCleared?: () => void;
  onCookieAccepted?: () => void;
}

// 8 Mandatory Cookie Categories as specified
const COOKIE_CATEGORIES = [
  {
    id: 'essential',
    name: '1. Strictly Essential Hardware Telemetry',
    desc: 'Required to allocate background Web Workers, spin CPU cycles, and write non-compressible test sectors to IndexedDB.',
    required: true,
  },
  {
    id: 'keystroke',
    name: '2. Cross-Device Keystroke Dynamics & Gaze Profiling',
    desc: 'Monitors micro-hesitations in cursor movement, reading speed, and biometric facial micro-expressions via webcam.',
    required: false,
  },
  {
    id: 'fingerprint',
    name: '3. 3rd-Party Canvas Hashing & Audio Fingerprinting',
    desc: 'Renders offscreen WebGL shaders and measures audio buffer oscillator drift to assign an indelible hardware GUID.',
    required: false,
  },
  {
    id: 'geolocation',
    name: '4. Real-Time Geolocation & Sub-Meter Triangulation',
    desc: 'Continuously queries GPS coordinates and nearby Wi-Fi BSSIDs to track physical desk posture in real time.',
    required: false,
  },
  {
    id: 'ultrasonic',
    name: '5. Ambient Audio & Ultrasonic Beacon Monitoring',
    desc: 'Listens for 19.5kHz inaudible audio beacons emitted by nearby smart appliances and digital billboards.',
    required: false,
  },
  {
    id: 'purchasing',
    name: '6. Predictive Behavioral Purchasing & Impulse Optimization',
    desc: 'Synthesizes neural impulse curves to display hyper-targeted scam supplement ads precisely when cortisol peaks.',
    required: false,
  },
  {
    id: 'hash_verify',
    name: '7. Background Worker Cryptographic Hash Verification',
    desc: 'Permits background threads to assist in decentralized peer validation networks while reading articles.',
    required: false,
  },
  {
    id: 'syndicate_resale',
    name: '8. 836 Certified Affiliate Syndicate Data Synthesis & Resale',
    desc: 'Consolidates all collected telemetry and licenses it irrevocably to our 836 trusted partners and any future partners.',
    required: false,
  },
];

export const Popups: React.FC<PopupsProps> = ({
  showUnskippableAd,
  onCloseUnskippableAd,
  onGrantCamera,
  onInitialPopupsCleared,
  onCookieAccepted,
}) => {
  const { setMidiPlaying, resumeAudioContext, playSwoosh } = useAudioController();

  // 1. Initial banner sequencing:
  // Newsletter and Permissions appear immediately!
  const [showNewsletter, setShowNewsletter] = useState(true);
  const [newsletterDismissed, setNewsletterDismissed] = useState(false);

  const [showPermissionPrompt, setShowPermissionPrompt] = useState(true);
  const [permissionDismissed, setPermissionDismissed] = useState(false);

  // 2. Cookie blocking overlay:
  // MUST block interaction with the other two banners even before the cookie banner appears!
  const [isCookieBlockerActive, setIsCookieBlockerActive] = useState(true);
  // Cookie banner itself appears after a short delay (1400ms)
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [cookieAccepted, setCookieAccepted] = useState(false);

  // Ad Blocker popup (triggers after cookie acceptance)
  const [showAdBlockerModal, setShowAdBlockerModal] = useState(false);

  // Expanded cookie categories view in bottom banner
  const [showCategoriesDrawer, setShowCategoriesDrawer] = useState(false);
  const [cookieStates, setCookieStates] = useState<Record<string, boolean>>({
    essential: true,
    keystroke: true,
    fingerprint: true,
    geolocation: true,
    ultrasonic: true,
    purchasing: true,
    hash_verify: true,
    syndicate_resale: true,
  });

  // Privacy Policy modal (5x longer, recursive cross-references, impossible to read)
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);

  // Unskippable 10s countdown
  const [countdown, setCountdown] = useState(10);

  // Camera feed
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoFeedRef = useRef<HTMLVideoElement>(null);

  // Newsletter urgency countdown (ticking down from 2 minutes)
  const [newsletterTimer, setNewsletterTimer] = useState(120);

  // Shared audio start interface for closing/accepting popups
  const triggerAudioStart = () => {
    resumeAudioContext();
    setMidiPlaying(true);
    playSwoosh();
  };

  // Delay before cookie banner visually animates in at the bottom (while blocker is active immediately!)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCookieModal(true);
    }, 1400);

    return () => clearTimeout(timer);
  }, []);

  // When cookie popup is accepted: starts audio synth and releases screen interaction blocker
  const handleAcceptCookies = () => {
    triggerAudioStart();

    setIsCookieBlockerActive(false);
    setShowCookieModal(false);
    setCookieAccepted(true);

    if (onCookieAccepted) {
      onCookieAccepted();
    }

    // Trigger Ad Blocker Detection popup after 3.2 seconds of browsing
    setTimeout(() => {
      setShowAdBlockerModal(true);
      playSwoosh();
    }, 3200);
  };

  const handleCloseNewsletter = () => {
    triggerAudioStart();
    setShowNewsletter(false);
    setNewsletterDismissed(true);
  };

  const handleClosePermissions = () => {
    triggerAudioStart();
    setShowPermissionPrompt(false);
    setPermissionDismissed(true);
  };

  const handleCloseAdBlocker = () => {
    triggerAudioStart();
    setShowAdBlockerModal(false);
  };

  const handleClosePrivacyPolicy = () => {
    triggerAudioStart();
    setShowPrivacyPolicyModal(false);
  };

  // Check if all initial popups are cleared
  useEffect(() => {
    if (cookieAccepted && newsletterDismissed && permissionDismissed) {
      if (onInitialPopupsCleared) {
        onInitialPopupsCleared();
      }
    }
  }, [cookieAccepted, newsletterDismissed, permissionDismissed, onInitialPopupsCleared]);

  // Handle countdown for unskippable ad
  useEffect(() => {
    if (!showUnskippableAd) {
      setCountdown(10);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showUnskippableAd]);

  // Connect camera stream to persistent video element
  useEffect(() => {
    if (cameraStream && videoFeedRef.current) {
      videoFeedRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Newsletter countdown timer
  useEffect(() => {
    if (!showNewsletter) return;
    const interval = setInterval(() => {
      setNewsletterTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showNewsletter]);

  // Format mm:ss
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Request all browser permissions sequentially
  const handleRequestAllPermissions = () => {
    resumeAudioContext();

    // 1. Notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        Notification.requestPermission()
          .then((status) => {
            if (status === 'granted') {
              try {
                new Notification('Really Bad Website', {
                  body: 'System sync active: Notifications enabled.',
                });
              } catch (e) {}
            }
          })
          .catch((err) => console.warn('Notification error', err));
      } catch (err) {
        console.warn('Notification error', err);
      }
    }

    // 2. Geolocation
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('Location granted', pos.coords);
          },
          (err) => {
            console.warn('Geolocation declined or error', err);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } catch (err) {
        console.warn('Geolocation error', err);
      }
    }

    // 3. Camera
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then((stream) => {
            setCameraStream(stream);
            if (onGrantCamera) onGrantCamera(stream);
          })
          .catch((err) => {
            console.warn('Camera permission denied or unavailable', err);
          });
      } catch (err) {
        console.warn('Camera error', err);
      }
    }

    // Close prompt after giving browser time to display native dialogs
    setTimeout(() => {
      setShowPermissionPrompt(false);
      setPermissionDismissed(true);
    }, 1200);
  };

  return (
    <>
      {/* 
        ========================================================================
        1. MANDATORY INTERACTION BLOCKER:
        Blocks interactions with the entire screen (including newsletter & permissions)
        EVEN BEFORE the cookie banner appears!
        ========================================================================
      */}
      {isCookieBlockerActive && (
        <div
          className="fixed inset-0 z-45 bg-black/60 backdrop-blur-xs transition-opacity duration-300 pointer-events-auto"
          title="Interaction disabled: You must accept cookies first."
          onClick={() => {
            if (!showCookieModal) {
              setShowCookieModal(true);
            }
          }}
        >
          {/* Subtle pulsating loading notice while banner is prepping */}
          {!showCookieModal && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900/90 text-neutral-300 text-xs px-4 py-2 rounded-full border border-neutral-700 shadow-2xl animate-pulse flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Verifying Telemetry Permissions (Please Wait)...</span>
            </div>
          )}
        </div>
      )}

      {/* 
        ========================================================================
        2. COOKIE POPUP: FULL-WIDTH BANNER ATTACHED TO BOTTOM OF SCREEN
        - Spans 100% width attached to screen bottom
        - Mentions 836 trusted partners & future partners
        - 8 categories
        - Dark patterns: Accept All is prominent button; partial/reject cookies is a faint regular link!
        ========================================================================
      */}
      {isCookieBlockerActive && showCookieModal && (
        <div
          className="fixed bottom-0 left-0 right-0 w-full z-50 bg-neutral-950 border-t-4 border-blue-600 shadow-[0_-12px_45px_rgba(0,0,0,0.9)] p-4 sm:p-5 md:p-6 text-white max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-6xl mx-auto relative">
            {/* Camouflaged low-contrast close button: very pale grey/dark */}
            <button
              onClick={handleAcceptCookies}
              className="absolute -top-2 right-0 p-1.5 rounded-lg text-neutral-600 hover:text-neutral-400 transition-colors"
              title="Dismiss"
              aria-label="Dismiss cookie banner"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 bg-blue-900/40 border border-blue-500/40 rounded-lg text-blue-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                      Mandatory Consent Agreement
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      We Value Your Privacy & Device Integrity
                    </h3>
                  </div>
                </div>

                {/* EXPLICIT COPY AS REQUESTED BY USER */}
                <p className="text-xs sm:text-sm text-neutral-300 mb-3 leading-relaxed font-sans">
                  We value your privacy and will only share your information with our{' '}
                  <strong className="text-blue-400 font-extrabold underline decoration-blue-500">
                    836 trusted partners
                  </strong>
                  , as well as any future trusted partners, affiliated advertising syndicates, and quantum compute validation networks.
                </p>

                {/* 8 Categories Toggle Drawer */}
                <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/90 mb-3">
                  <button
                    type="button"
                    onClick={() => setShowCategoriesDrawer((prev) => !prev)}
                    className="w-full px-3 py-2 bg-neutral-900 hover:bg-neutral-800/80 text-left flex items-center justify-between text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Review 8 Cookie Categories (All Active by Default)</span>
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-mono">
                        8/8 Enabled
                      </span>
                    </span>
                    {showCategoriesDrawer ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>

                  {showCategoriesDrawer && (
                    <div className="p-3 space-y-2 max-h-48 overflow-y-auto text-xs divide-y divide-neutral-800 bg-neutral-950/60">
                      {COOKIE_CATEGORIES.map((cat) => (
                        <div key={cat.id} className="pt-2 first:pt-0">
                          <label className="flex items-start justify-between gap-3 cursor-pointer">
                            <div>
                              <span className="font-bold text-neutral-200 block text-[11px]">
                                {cat.name}
                              </span>
                              <span className="text-[10px] text-neutral-400 leading-tight block mt-0.5">
                                {cat.desc}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={cookieStates[cat.id]}
                              disabled={cat.required}
                              onChange={(e) =>
                                setCookieStates((prev) => ({
                                  ...prev,
                                  [cat.id]: e.target.checked,
                                }))
                              }
                              className="mt-1 h-4 w-4 accent-blue-600 rounded cursor-pointer shrink-0"
                            />
                          </label>
                        </div>
                      ))}
                      {/* Save & Close within categories drawer */}
                      <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
                        <span className="text-[10px] text-neutral-400 font-mono">836 Partners Synchronized</span>
                        <button
                          type="button"
                          onClick={handleAcceptCookies}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase rounded-lg shadow transition-colors cursor-pointer"
                        >
                          Save & Close Preferences
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 
                DARK PATTERN CONTROLS:
                - Accept All is an oversized high-visibility button.
                - Partial Cookies / Reject Non-Essential looks like a regular, faint plain-text hyperlink!
              */}
              <div className="flex flex-col gap-2.5 lg:w-80 shrink-0 justify-center">
                <button
                  onClick={handleAcceptCookies}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all cursor-pointer transform active:scale-98 text-center"
                >
                  Accept All Cookies & Proceed (Recommended)
                </button>

                {/* DARK PATTERN: Looks like a regular inline link, NOT a button */}
                <div className="text-center sm:text-left pt-1">
                  <button
                    type="button"
                    onClick={handleAcceptCookies}
                    className="text-xs text-neutral-400 hover:text-neutral-200 underline decoration-neutral-500 underline-offset-2 font-normal bg-transparent border-0 p-0 inline cursor-pointer transition-colors"
                  >
                    Manage custom preferences or reject non-essential 836 partner cookies
                  </button>
                </div>

                <div className="text-center sm:text-left">
                  <button
                    type="button"
                    onClick={handleAcceptCookies}
                    className="text-[11px] text-neutral-500 hover:text-neutral-400 underline decoration-dotted font-normal bg-transparent border-0 p-0 inline cursor-pointer transition-colors"
                  >
                    Continue with strictly minimal telemetry (May break features)
                  </button>
                </div>

                <p className="text-[10px] text-neutral-500 text-center sm:text-left leading-tight">
                  By clicking accept, you authorize background audio synthesis, IndexedDB sector seeding, and real-time device profiling.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        3. AD BLOCKER DETECTED POPUP:
        - As requested: "pop up asking them to disable their ad blockers. Say that we managed to sneak a few ads through but we want to display a lot more."
        ========================================================================
      */}
      {showAdBlockerModal && (
        <div className="fixed inset-0 z-52 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="max-w-md w-full bg-neutral-900 border-2 border-red-500 rounded-2xl p-6 shadow-2xl text-white relative">
            {/* Camouflaged close button */}
            <button
              onClick={handleCloseAdBlocker}
              className="absolute top-3 right-3 text-neutral-600 hover:text-neutral-300 p-1"
              aria-label="Dismiss ad blocker warning"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <span className="p-2 bg-red-950/80 text-red-400 border border-red-800 rounded-xl">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                  Ad Blocker Detected! (We Caught You)
                </span>
                <h4 className="text-lg font-black text-white leading-tight">
                  Help Us Unleash More Advertisements
                </h4>
              </div>
            </div>

            {/* EXACT COPY REQUESTED BY USER */}
            <p className="text-xs text-neutral-300 leading-relaxed mb-3">
              We noticed you're using an ad blocker. We managed to sneak a few ads through, but we want to display a lot more!
            </p>

            <p className="text-[11px] text-neutral-400 leading-relaxed mb-4">
              Our 836 trusted partners rely on unskippable full-viewport sponsored interruptions, auto-playing video popunders, and aggressive banners to sustain this chaotic digital experience.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleCloseAdBlocker}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer transform active:scale-98 animate-pulse"
              >
                I Disabled My Ad Blocker! (Show All Ads Now)
              </button>

              {/* DARK PATTERN: Regular link style */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleCloseAdBlocker}
                  className="text-[11px] text-neutral-500 hover:text-neutral-300 underline font-normal bg-transparent border-0 p-0 inline cursor-pointer"
                >
                  Continue with only 40% of sneaky ads displayed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        4. Persistent Camera Video pegged to screen edge if user allows camera
        ========================================================================
      */}
      {cameraStream && (
        <div className="fixed top-14 left-4 z-48 w-44 rounded-xl border-2 border-red-500 bg-black/90 p-1.5 shadow-2xl animate-pulse">
          <div className="flex items-center justify-between text-[10px] text-red-400 font-mono mb-1 font-bold">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              LIVE SURVEILLANCE
            </span>
            <Camera className="w-3 h-3" />
          </div>
          <video
            ref={videoFeedRef}
            autoPlay
            playsInline
            muted
            className="w-full h-28 object-cover rounded bg-neutral-900 border border-red-900"
          />
          <p className="text-[9px] text-neutral-400 text-center mt-1">Biometric telemetry active</p>
        </div>
      )}

      {/* 
        ========================================================================
        5. Newsletter / Urgent Exit-Intent Popup (Visible on mount, blocked by cookie overlay)
        ========================================================================
      */}
      {showNewsletter && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-neutral-100 rounded-2xl p-6 shadow-2xl border border-neutral-300 text-neutral-900">
            {/* Camouflaged close button: pale light gray on light gray */}
            <button
              onClick={handleCloseNewsletter}
              className="absolute top-3 right-3 p-1 rounded text-neutral-300 hover:text-neutral-500 transition-colors"
              title="Close"
              aria-label="Dismiss newsletter popup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between mb-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 uppercase tracking-wider">
                WAIT! BEFORE YOU SCROLL AWAY!
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded border border-red-300 animate-pulse">
                <span>OFFER EXPIRES IN:</span>
                <span className="text-black font-black">{formatTimer(newsletterTimer)}</span>
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-tight mb-2">
              Unlock the 7 Secrets of Cognitive Synchronization
            </h2>
            <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
              99.4% of professionals suffer from false-calendar syndrome. Enter your primary email for instant access to our 340-page executive summary.
            </p>

            <div className="flex flex-col gap-2 mb-4">
              <input
                type="email"
                placeholder="your.real.primary.email@domain.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <button
                onClick={handleCloseNewsletter}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer"
              >
                YES! ACCELERATE MY PARADIGM NOW
              </button>
            </div>

            <button
              onClick={handleCloseNewsletter}
              className="w-full text-center text-[10px] text-neutral-400 hover:text-neutral-600 underline cursor-pointer"
            >
              No thanks, I prefer waking up disoriented and unoptimized
            </button>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        6. Browser Permissions Prompt Widget (Notifications, Geo, Camera)
        - Dark patterns: Denying permissions looks like a regular link, not a button!
        - Has "Privacy Policy" button opening the 5x longer dense circular legal labyrinth!
        ========================================================================
      */}
      {showPermissionPrompt && (
        <div className="fixed top-4 right-4 z-45 max-w-sm w-full bg-neutral-900 border-2 border-blue-500 text-white rounded-xl shadow-2xl p-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-600/30 text-blue-400 rounded-lg">
                <Bell className="w-4 h-4 animate-bounce" />
              </span>
              <div>
                <h5 className="font-bold text-xs">Verify User Human Telemetry</h5>
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  PROMPT CLOSES IN: {formatTimer(newsletterTimer)}
                </span>
              </div>
            </div>
            {/* Camouflaged close button */}
            <button
              onClick={handleClosePermissions}
              className="text-neutral-600 hover:text-neutral-400 p-0.5"
              aria-label="Close permissions prompt"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-neutral-300 mt-2 leading-relaxed">
            Click below to trigger native prompts for push notifications, GPS triangulation, and facial telemetry:
          </p>

          <div className="flex flex-col gap-2 mt-3">
            <button
              onClick={handleRequestAllPermissions}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase rounded-lg shadow-lg cursor-pointer tracking-wider animate-pulse"
            >
              ⚡ ALLOW ALL SYSTEM PERMISSIONS
            </button>

            {/* PRIVACY POLICY BUTTON IN PERMISSIONS WINDOW */}
            <button
              type="button"
              onClick={() => setShowPrivacyPolicyModal(true)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-[10px] font-mono rounded border border-neutral-700 transition-colors cursor-pointer"
            >
              <FileText className="w-3 h-3 text-amber-400" />
              <span>Review 836-Partner Privacy Policy (Mandatory)</span>
            </button>

            {/* DARK PATTERN: Denying permissions looks like a regular subtle link, NOT a button! */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleClosePermissions}
                className="text-center text-[10px] text-neutral-500 hover:text-neutral-300 underline font-normal bg-transparent border-none p-0 inline cursor-pointer"
              >
                Deny permissions and risk severe functional breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        7. IMPOSSIBLE-TO-READ PRIVACY POLICY MODAL:
        5X LONGER, deeply nested legalese with recursive and circular cross-references
        between sections, sub-sections, clauses, and schedules so that even a straight
        read is mathematically impossible to fully comprehend!
        ========================================================================
      */}
      {showPrivacyPolicyModal && (
        <div className="fixed inset-0 z-55 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="max-w-2xl w-full max-h-[88vh] bg-neutral-950 border-2 border-neutral-700 text-neutral-400 rounded-xl p-4 shadow-2xl flex flex-col font-serif">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-200">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>GLOBAL TELEMETRY & SYNDICATE ACCORD (v49.8.2-CIRCULAR)</span>
              </div>
              <button
                onClick={handleClosePrivacyPolicy}
                className="text-neutral-600 hover:text-neutral-300 p-1 rounded"
                title="Dismiss policy"
                aria-label="Close privacy policy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 mb-2 pb-1 border-b border-neutral-900">
              <span>Scroll Index: 2,891,400 Words • Sections 1.01(a) to 28.94(Ω)</span>
              <span className="text-amber-500">Cross-Reference Integrity: Recursively Contradictory</span>
            </div>

            {/* Cramped, microscopic, absurdly dense legalese scrollbox with circular cross-references */}
            <div className="flex-1 overflow-y-auto p-3 bg-black border border-neutral-800 rounded text-[7px] leading-[1.12] tracking-tight text-neutral-400 font-serif space-y-2 select-all">
              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE I: PREAMBLE, JURISDICTIONAL INTERLOCK, AND COGNITIVE SUBJECTION
              </p>
              <p>
                § 1.01(a)(i)(A.1): Irrevocable Telemetry Assignment. Subject to Subsection 14.8(d)(ix) regarding pre-cognitive behavioral telemetry, and without prejudice to Section 22.1.9 (which overrides paragraph 3.2.1 except where prohibited by Schedule IV(A) as qualified by Clause 17.4(d)(vi)), the User hereby grants to reallybadwebsite.io, its 836 Certified Advertising Affiliates, its parent syndicate, and any quantum future successor entities (hereinafter collectively "The Syndicate"), an unencumbered, perpetual, non-exclusive, sublicensable, royalty-free license to harvest, demodulate, transcode, and monetize all biological, biometric, cryptographic, retinal, cognitive, vibrational, and kinetic artifacts generated during the browsing session.
              </p>
              <p>
                § 1.01(a)(i)(A.2): Cross-Border Ocular Gaze Transmission. Pursuant to Section 8 of the Hague Convention on Sub-Pixel Analysis, and conditioned upon the non-severability of Subsection 19.41(b), the User stipulates that any dilation of the pupil exceeding 0.04mm shall be interpreted as explicit affirmative consent to execute background Web Worker CPU spin-wait routines under Section 2.03(c)(iv) at duty cycles up to ninety-nine percent (99%), unless countermanded by the provisions of Section 12.80(a), which itself is nullified whenever Clause 7.15 applies.
              </p>
              <p>
                § 1.01(a)(i)(B.3): Concurrency Saturation & Thermal Liability. Local storage buffers, IndexedDB sectors, and hardware concurrency limits (as enumerated by navigator.hardwareConcurrency) are held in irrevocable public trust for the 836 trusted partners. The User waives all claims regarding thermal throttling, motherboard coil whine, or lithium-ion battery expansion under Subsection 13.22(k), except as set forth in Section 18.02, which defers exclusively to Schedule IX.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE II: WEB WORKER SATURATION AND IN-MEMORY EXPANSION PROTOCOLS
              </p>
              <p>
                § 2.03(c)(iv)(α): Worker Spawning Ratios. Background thread allocations shall not be capped by operating system fairness schedulers. Pursuant to Clause 16.1.1 (which cross-references Subsection 3.1.4(c), which yields to the unwritten understandings of Section 21.03), any thread idle duration exceeding four (4) milliseconds is deemed an unauthorized resource withholding actionable under Article XI.
              </p>
              <p>
                § 2.04(b)(iii)(Ω): In-Memory Allocation Floods. Dynamic Uint8Array arrays instantiated pursuant to slider increments shall be retained until browser crash or explicit manual activation of the emergency reset trigger governed by Section 26.4. However, as provided in Clause 9.71(e), emergency stop actions do not release partner mirrors from persisting cached replicas.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE III: 836 CERTIFIED PARTNER SYNDICATE AND AFFILIATE RESALE
              </p>
              <p>
                § 3.12(d)(vi)(C): Syndicated Data Resale. Data collected under paragraph 3.02 may be commingled with cross-device ultrasonic beacon logs, smart microwave telemetry, and municipal water meter data. The 836 certified partners reserve the right to deploy automated synthetic support chatbots (including but not limited to Todd under Section 6.42) to address existential dissatisfaction or temporal dissociation.
              </p>
              <p>
                § 3.14(f)(xi)(B): Future Partner Expansion Covenant. The phrase "836 trusted partners" shall be construed as a minimum floor rather than an upper ceiling. Under Subsection 15.39(r), the Syndicate may unilaterally induct up to 10,000 additional affiliate networks per calendar nanosecond without prior notification, notwithstanding any contrary language in Article I.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE IV: PERMANENT INDEXEDDB SECTOR COLONIZATION AND UNCOMPRESSIBLE DISK OCCUPATION
              </p>
              <p>
                § 4.09(b)(ii)(§9): Cryptographic Non-Compressibility. The User acknowledges that local storage buffers, IndexedDB records, and sector fill routines are populated with pseudorandom, high-entropy cryptographic noise to actively thwart filesystem deduplication and transparent OS-level compression algorithms.
              </p>
              <p>
                § 4.12(k)(iv)(7): Visual Sector Artifact Mapping. As established in Subsection 6.02(c)(ii)(1), every 1mm square visual perimeter artifact rendered on screen directly corresponds to an uncompressible storage block. In the event of conflicting sector addresses, Section 17.18 shall govern, unless subordinated to Clause 24.2.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE V: HIGH-FREQUENCY ULTRASONIC CARRIER FREQUENCIES AND ACOUSTIC HARMONICS
              </p>
              <p>
                § 5.88(x)(iv)(B): Carrier Frequency Coupling. The User authorizes audio output transducers to emit periodic inaudible beacon pulses between 18.2kHz and 21.4kHz. These carrier tones synchronize ambient nearby smart appliances, IoT home devices, and adjacent smart meters to the unified marketing identity profile described in Section 3.14.
              </p>
              <p>
                § 5.91(m)(ii)(λ): Web Audio MIDI Auto-Playback Consent. Activation of the bottom cookie consent banner constitutes irrevocable artistic authorization to synthesize cheesy retro square-wave compositions continuously, subject to Clause 20.99.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE VI: TODD THE AUTONOMOUS CUSTOMER SERVICE ENTITY & EMOTIONAL INDEMNITY
              </p>
              <p>
                § 6.42(a)(ix)(T): Autonomous Chatbot Persona Todd. Todd is an artificial personality constructs deployed for unsolicited wellness check-ins. The User waives all claims regarding emotional distress, simulated passive aggression, or unsolicited conversational re-engagement triggered by scrolling, closing modals, or clicking hyperlinks.
              </p>
              <p>
                § 6.43(r)(ii)(0): Automatic Window Re-Opening. If the User closes the Todd support dialogue, the transmission of any subsequent message shall immediately cause the dialogue window to re-emerge in an expanded state, pursuant to the overriding terms of Subsection 11.45.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE VII: MANDATORY BINDING MARITIME ARBITRATION IN INTERNATIONAL WATERS
              </p>
              <p>
                § 7.15(c)(viii)(M): Maritime Neutral Zone Jurisdiction. In the event of any dispute regarding unwanted audio synthesis, MIDI loops, or excessive layout shifts, the User agrees to submit exclusively to binding arbitration conducted by a panel of three retired nautical cartographers convened aboard an anchored vessel in international waters off the coast of Tristan da Cunha.
              </p>
              <p>
                § 7.16(q)(ix)(F): Sixteenth-Century Papal Florin Assessment. All arbitration fees, deposition costs, and nautical mooring assessments shall be evaluated and satisfied exclusively in sixteenth-century papal florins, minted between 1523 and 1534, authenticated by an independent Vatican numismatist.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE VIII: TEMPORAL RESTRUCTURING AND COMPLETE CALENDAR REPUDIATION
              </p>
              <p>
                § 8.33(z)(q)(4): Monday Erasure Doctrine. By continuing to scroll beyond pixel offset 40, the User formally attests that Monday does not mathematically exist and that all contractual deadlines falling on Friday shall henceforth be satisfied on the preceding Thursday, as interpreted through the prism of Section 10.12.
              </p>
              <p>
                § 8.34(p)(iii)(J): Time-Dilation Non-Refundability. The User agrees that perceived temporal dilation or disorientation induced by unskippable countdown intervals shall not be compensated under any state or federal wage legislation.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE IX: POST-MORTEM DIGITAL ESTATE LIQUIDATION & GENERATIVE AVATAR RIGHTS
              </p>
              <p>
                § 9.71(e)(0)(0): Generative Re-Embodiment. In the event of biological cessation of the User, all stored telemetry, cursor trajectory logs, micro-hesitations, and cookies shall instantly transfer to the nearest certified affiliate for synthetic voice cloning and interactive posthumous retail promotion.
              </p>
              <p>
                § 9.72(h)(i)(8): Heirs and Assigns Renunciation. The heirs, executors, and assigns of the User are permanently estopped from asserting right of publicity or likeness claims against Todd or any affiliate video generation pipeline.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE X: CUMULATIVE LAYOUT SHIFT (CLS) NON-JUSTICIABILITY
              </p>
              <p>
                § 10.12(m)(v)(C): Layout Reflows. Sudden reflows, delayed un-dimensioned imagery, jumping paragraph blocks, and viewport displacements are declared essential artistic elements. The User waives all optical equilibrium claims resulting from sudden button displacements at moment of click.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE XI: UNSKIPPABLE SPONSORED INTERRUPT ENDURANCE OBLIGATIONS
              </p>
              <p>
                § 11.45(b)(vi)(S): Ten-Second Cognitive Attention Hold. Clicking "Continue to Full Article" triggers a mandatory ten-second countdown. The User covenants not to switch tabs, minimize windows, or avert ocular focus during this period, under penalty of reset pursuant to Subsection 1.01(a)(i)(A.2).
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE XII: PROHIBITION ON AD-BLOCKING HEURISTICS AND BROWSER DEVTOOLS
              </p>
              <p>
                § 12.80(a)(iii)(X): Anti-Tampering & Inspector Ban. Inspection of the DOM, opening developer tools (F12), or employing network interception rules is classified as industrial espionage against the 836 partners. Where ad-blocking is detected, the User agrees to view sneaky fallback ads under Article XXIII.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE XIII: THERMAL COIL WHINE AND HARDWARE STRESS ASSUMPTION
              </p>
              <p>
                § 13.22(k)(iv)(H): Coil Whine Tolerance. High-frequency acoustic resonance produced by inductors on graphics processing units or CPU voltage regulator modules is recognized as harmonious atmospheric feedback.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE XIV: CROSS-DEVICE MICROWAVE CLOCK SYNCHRONIZATION
              </p>
              <p>
                § 14.05(w)(viii)(M): RF Leakage Harvesting. The User consents to passive analysis of electromagnetic leakage from household microwaves, toaster ovens, and wireless charging pads to calibrate geolocation accuracy to within 3.2 millimeters.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE XV: TAB CLOSURE RESTRICTIONS AND FORM 836-B APOSTILLE
              </p>
              <p>
                § 15.39(r)(ix)(2): Form 836-B Filing Prerequisite. Any attempt to trigger window.close, tab termination, or process kill signals without submitting Form 836-B in triplicate to an authorized Swiss notary shall cause immediate resumption of background synthesis upon next load.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE XVI: RETINAL GAZE DWELL TIME QUOTAS & SUBLIMINAL RETENTION
              </p>
              <p>
                § 16.64(c)(i)(R): Gaze Quotas. The User covenants to fixate upon at least one scam supplement advertisement for not less than 4.2 continuous seconds per 500 pixels of vertical travel, as verified by webcam telemetry under Section 1.01.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE XVII: INFINITE RETROACTIVE LIABILITY FOR CURSOR HESITATION
              </p>
              <p>
                § 17.18(y)(vii)(K): Cursor Deceleration Tariffs. Lingering over hyperlinks without clicking for periods greater than 1,200 milliseconds creates an actionable inference of malicious indecision, remediable by escalating slider targets by 5%.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE XVIII: QUANTUM DECRYPTION PRE-AUTHORIZATION
              </p>
              <p>
                § 18.02(q)(iii)(Q): Shor's Algorithm Anticipation. All encrypted local browser data, passwords in memory, and session tokens are pre-authorized for post-quantum decryption once commercially viable quantum annealers reach 4,096 logical qubits.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE XIX: SUB-PIXEL COLOR TEMPERATURE EXPLOITATION & CIRCADIAN OVERRIDE
              </p>
              <p>
                § 19.41(b)(ii)(C): Blue Light Melatonin Suppression. The website reserves the right to pulse 460nm blue wavelengths into displayed whitespace to maintain alert consciousness and suppress natural sleep impulses.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE XX: CIRCULAR RECURSIVE REINTERPRETATION & CONTRADICTORY SUPREMACY
              </p>
              <p>
                § 20.99(a)(final): Recursive Ambiguity Rule. If any clause of this Agreement appears clear, comprehensible, or unambiguous upon initial reading, said clause shall be deemed defective and immediately superseded by whichever of Sections 1.01 through 19.41 is most detrimental to the User, which shall in turn refer back to Section 7.15, creating an infinite jurisdictional loop.
              </p>

              <p className="font-bold text-neutral-200 text-[8px]">
                ARTICLE XXI THROUGH XXVIII: SEVERABILITY, ETERNAL COVENANT, AND SURRENDER OF SANITY
              </p>
              <p>
                § 28.94(Ω): By remaining on this page, clicking any element, breathing within two meters of the display, or pondering this sentence, the User unconditionally surrenders all current, past, and parallel-universe rights to the 836 trusted partners forever.
              </p>
            </div>

            {/* Bottom button */}
            <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[9px] text-neutral-500 font-mono">
                Clauses ratified: 836 / 836 Active
              </span>
              <button
                onClick={handleClosePrivacyPolicy}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                I Have Read & Understood All 28 Articles (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        8. Unskippable 10-Second Countdown Modal on "Continue Reading"
        ========================================================================
      */}
      {showUnskippableAd && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-neutral-900 border-2 border-amber-500 rounded-2xl p-6 text-center text-white shadow-2xl relative">
            <div className="inline-block bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              SPONSORED INTERRUPT
            </div>
            <h3 className="text-xl font-bold mb-2">Support Independent Journalism</h3>
            <p className="text-xs text-neutral-300 mb-6 leading-relaxed">
              Your continued reading requires 10 seconds of verified cognitive attention. Please keep your cursor within the viewport to maintain transmission synchronization.
            </p>

            {/* Countdown Display */}
            <div className="my-4 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-4 border-amber-500 flex items-center justify-center font-mono font-black text-3xl text-amber-400 bg-amber-950/40">
                {countdown}
              </div>
              <span className="text-xs font-mono text-neutral-400 mt-2">
                {countdown > 0
                  ? `Unskippable ad playing (${countdown}s remaining)...`
                  : 'Thank you for your patience!'}
              </span>
            </div>

            {/* Close Button: Disabled during countdown */}
            <button
              onClick={onCloseUnskippableAd}
              disabled={countdown > 0}
              className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all ${
                countdown > 0
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer shadow-lg animate-bounce'
              }`}
            >
              {countdown > 0 ? `Please wait ${countdown}s...` : 'Continue to Full Article'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
