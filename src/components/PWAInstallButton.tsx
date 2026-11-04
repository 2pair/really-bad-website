import React from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall.ts';
import { resolvePublicAsset } from '../utils/assetUrl.ts';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const iconSrc = resolvePublicAsset('header-logo.png');

  // If already running in standalone PWA mode, or not installable, hide button
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <button
      onClick={install}
      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-500 hover:to-cyan-600 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer border border-teal-400/40"
      title="Install Really Bad Website as native Progressive Web App"
    >
      <img src={iconSrc} alt="App Icon" className="w-4 h-4 object-contain shadow-xs" />
      <Download className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
      <span>Install App</span>
    </button>
  );
};
