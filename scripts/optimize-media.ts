import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Build-time media optimizer script.
 * 
 * Automatically checks and converts:
 * 1. Images (src/assets/images/*.jpg) -> WebP Q65 in public/assets/images-webp/
 * 2. Videos (public/assets/aistudio/*.mp4) -> H.264 540p CRF 29 in public/assets/videos-optimized/
 * 
 * Preserves all original source media without overwriting.
 * Skips files if the optimized version is already up to date.
 */

const rootDir = process.cwd();

// --- 1. OPTIMIZE IMAGES (WebP Q65) ---
export function optimizeImages() {
  const imgDir = path.resolve(rootDir, 'src/assets/images');
  const outDir = path.resolve(rootDir, 'public/assets/images-webp');

  if (!fs.existsSync(imgDir)) return;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(imgDir).filter((f) => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
  console.log(`[Media Optimizer] Checking ${files.length} images...`);

  let convertedCount = 0;
  for (const f of files) {
    const src = path.join(imgDir, f);
    const base = f.replace(/\.(jpg|jpeg|png)$/i, '');
    const out = path.join(outDir, `${base}.webp`);

    // Check if target exists and is newer than source
    if (fs.existsSync(out)) {
      const srcMtime = fs.statSync(src).mtimeMs;
      const outMtime = fs.statSync(out).mtimeMs;
      if (outMtime >= srcMtime) {
        continue;
      }
    }

    try {
      execSync(`convert "${src}" -quality 65 -define webp:method=6 "${out}"`, { stdio: 'ignore' });
      convertedCount++;
    } catch (err) {
      console.warn(`[Media Optimizer] Image conversion failed for ${f}:`, err);
    }
  }

  if (convertedCount > 0) {
    console.log(`[Media Optimizer] Optimized ${convertedCount} new/modified images to WebP Q65.`);
  } else {
    console.log('[Media Optimizer] All WebP images up to date.');
  }
}

// --- 2. OPTIMIZE VIDEOS (H.264 540p CRF 29) ---
export function optimizeVideos() {
  const videoDir = path.resolve(rootDir, 'public/assets/aistudio');
  const outDir = path.resolve(rootDir, 'public/assets/videos-optimized');

  if (!fs.existsSync(videoDir)) return;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(videoDir).filter((f) => f.endsWith('.mp4'));
  console.log(`[Media Optimizer] Checking ${files.length} videos...`);

  let convertedCount = 0;
  for (const f of files) {
    const src = path.join(videoDir, f);
    const out = path.join(outDir, f);

    // Check if target exists and is newer than source
    if (fs.existsSync(out)) {
      const srcMtime = fs.statSync(src).mtimeMs;
      const outMtime = fs.statSync(out).mtimeMs;
      if (outMtime >= srcMtime) {
        continue;
      }
    }

    try {
      const cmd = `ffmpeg -y -i "${src}" -vf "scale=-2:540" -c:v libx264 -crf 29 -preset fast -c:a aac -b:a 64k -movflags +faststart "${out}"`;
      execSync(cmd, { stdio: 'ignore' });
      convertedCount++;
    } catch (err) {
      console.warn(`[Media Optimizer] Video conversion failed for ${f}:`, err);
    }
  }

  if (convertedCount > 0) {
    console.log(`[Media Optimizer] Optimized ${convertedCount} new/modified videos to H.264 540p CRF 29.`);
  } else {
    console.log('[Media Optimizer] All optimized videos up to date.');
  }
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('optimize-media.ts')) {
  optimizeImages();
  optimizeVideos();
}
