import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function dynamicScamVideosPlugin(): Plugin {
  const virtualModuleId = 'virtual:scam-videos';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  const KNOWN_METADATA: Record<string, { title: string; badge: string }> = {
    'Person_winning_online_casino_jac__e49d53fd_8f465546.mp4': {
      title: 'JACKPOT!! INSTANT MILLIONAIRE (PLAY NOW)',
      badge: 'VIP CASINO LOOPHOLE',
    },
    'Woman_makes_pet_live_forever_a81f1f47_b7146928.mp4': {
      title: 'LIMITED TIME: ETERNAL LIFE REVOLUTIONARY PET TECH',
      badge: 'IMMORTAL TECH OFFER',
    },
    'Man_creating_supplement_advertis__6967b17b_b34ffed8.mp4': {
      title: 'DOCTORS CONFIRM: BE 2.5X SMARTER IN 10 DAYS',
      badge: 'CLINICAL BRAIN BREAKTHROUGH',
    },
    'Pilot_reveals_air_travel_secret_962389df_752224e6.mp4': {
      title: 'PILOT REVEALS: SECRET AIRLINE PASS FOR UNLIMITED FLIGHTS',
      badge: 'AIRLINE INSIDER LEAK',
    },
    'Creating_scammy_advertisement_video_c42fdb99_ee51c543.mp4': {
      title: 'AI BEST FRIEND BFF TODAY: NEVER DOUBT YOURSELF AGAIN!',
      badge: 'REVOLUTIONARY AI BFF',
    },
    'Make_aggressive_scammy_sales_video_53a44362_3f838ddc.mp4': {
      title: 'BEAT THE BANKS! BREAK THE WALL STREET CORRUPTION CYCLE',
      badge: 'OPTIONS TRADING GURU',
    },
    'Trader_promoting_options_on_margin_4ff05103_3b2ed35f.mp4': {
      title: 'STILL EATING SANDWICHES LIKE A LOSER? TRADE OPTIONS ON MARGIN!',
      badge: 'WALL STREET TRADER SECRETS',
    },
    'Creating_scammy_credit_card_adve__6d4b6615_22fe5d09.mp4': {
      title: 'TIRED OF CREDIT CARD BILLS? THROW IT AWAY & GET A NEW ONE!',
      badge: 'FREE CREDIT CARD SECRETS',
    },
    'Create_scammy_precious_metals_ad__84b3498d_31908e1e.mp4': {
      title: "DON'T LET THE GOVERNMENT STEAL YOUR MINERAL RIGHTS! (URGENT WARNING)",
      badge: 'BURIED GOLD WEALTH',
    },
    'Creating_scammy_government_horse__76670e5a_90551197.mp4': {
      title: 'US GOVERNMENT SURPLUS HORSES - DIRT CHEAP & READY TO GO!',
      badge: 'LIMITED EQUINE CLEARANCE',
    },
    'Creating_scammy_sales_video_news_5a1cced2_f3d0f1d1.mp4': {
      title: 'BREAKING NEWS: DIRE CONSUMER WARNING',
      badge: 'URGENT NEWS BULLET',
    },
    'Make_aggressive_scammy_sales_video_a61f6d50_1c9c8031.mp4': {
      title: 'STOP SCROLLING! $10,000 MADE WHILE YOU WATCHED',
      badge: 'GUARANTEED ROI NOTICE',
    },
    'Creating_scammy_sales_video_news_a01c3c94_d96df73c.mp4': {
      title: 'CONSUMER ALERT: BUY THIS BEFORE IT IS BANNED',
      badge: 'CRITICAL INVENTORY ALERT',
    },
    'Official_selling_Bitcoin_8c2a20d4_751d360f.mp4': {
      title: 'TREASURY MANDATE: LIQUIDATE ALL BITCOIN BEFORE MIDNIGHT',
      badge: 'OFFICIAL TREASURY DIRECTIVE',
    },
    'Creating_scammy_wealth_advertise__2353c364_710370af.mp4': {
      title: '7-FIGURE PASSIVE CASH ENGINE: LEAKED WALL STREET BOT',
      badge: 'PASSIVE WEALTH HACK',
    },
    'Casino_ad_featuring_family_agent_5921c0ef_124684d7.mp4': {
      title: 'CASINO FAMILY AGENT EXPOSES PRIVATE HIGH-ROLLER SYSTEM',
      badge: 'CONFIDENTIAL CASINO PASS',
    },
  };

  const scanVideos = () => {
    const videoDir = path.resolve(import.meta.dirname, 'public/assets/aistudio');
    let files: string[] = [];
    try {
      if (fs.existsSync(videoDir)) {
        files = fs.readdirSync(videoDir).filter((f) => f.endsWith('.mp4'));
      }
    } catch (e) {
      files = [];
    }

    return files.map((filename) => {
      if (KNOWN_METADATA[filename]) {
        return {
          filename,
          src: `/assets/aistudio/${filename}`,
          ...KNOWN_METADATA[filename],
        };
      }
      const cleanName = filename
        .replace(/\.mp4$/i, '')
        .replace(/_+[a-f0-9]{8}_+[a-f0-9]{8}$/i, '')
        .replace(/_+/g, ' ')
        .trim();
      return {
        filename,
        src: `/assets/aistudio/${filename}`,
        title: cleanName.toUpperCase() || 'EXCLUSIVE SPONSORED DISCLOSURE',
        badge: 'NEW TRANSMISSION',
      };
    });
  };

  return {
    name: 'dynamic-scam-videos',
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        const videos = scanVideos();
        return `export const SCAM_VIDEOS = ${JSON.stringify(videos, null, 2)};\n`;
      }
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      dynamicScamVideosPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'favicon-32x32.png',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: './',
          name: 'Really Bad Website',
          short_name: 'ReallyBadWeb',
          description:
            'An interactive showcase and crucible of terrible modern web UX, extreme content shifts, and controllable hardware resource saturation.',
          theme_color: '#7aaab3',
          background_color: '#7aaab3',
          display: 'standalone',
          start_url: './',
          scope: './',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      // Split the code into a ton of small chunks to maximize web requests
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Split node_modules into individual vendor packages
            if (id.includes('node_modules')) {
              if (id.includes('lucide-react')) return 'vendor-lucide';
              if (id.includes('react-dom')) return 'vendor-react-dom';
              if (id.includes('react/')) return 'vendor-react-core';
              const match = id.match(/node_modules\/([^/]+)/);
              if (match) {
                return `vendor-${match[1].replace(/[@.]/g, '-')}`;
              }
              return 'vendor-misc';
            }
            // Split components into separate chunks
            if (id.includes('/src/components/')) {
              const compMatch = id.match(/\/src\/components\/([^/.]+)/);
              if (compMatch) {
                return `chunk-comp-${compMatch[1].toLowerCase()}`;
              }
            }
            // Split utils & context into individual chunks
            if (id.includes('/src/utils/')) {
              const utilMatch = id.match(/\/src\/utils\/([^/.]+)/);
              if (utilMatch) {
                return `chunk-util-${utilMatch[1].toLowerCase()}`;
              }
            }
            if (id.includes('/src/context/')) {
              const ctxMatch = id.match(/\/src\/context\/([^/.]+)/);
              if (ctxMatch) {
                return `chunk-ctx-${ctxMatch[1].toLowerCase()}`;
              }
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
