import React from 'react';
import { resolvePublicAsset } from '../utils/assetUrl.ts';

interface OptimizedPictureProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string; // The original JPEG import / source path
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Extracts the file basename without extension.
 * Handles both Vite hashed asset imports (e.g., "/assets/diagram_xxx-a1b2c3d4.jpg" or "assets/images/diagram_xxx.jpg")
 * and raw filenames.
 */
function getWebpSrc(src: string): string | null {
  if (!src) return null;

  // Extract filename portion
  const clean = src.split('?')[0].split('#')[0];
  const filename = clean.split('/').pop() || '';

  // Extract base name before hash or extension (e.g. "diagram_microwave_spectrum_1793549251709")
  const match = filename.match(/^([a-zA-Z0-9_]+?)(?:-[a-zA-Z0-9_-]{8,})?\.(jpg|jpeg|png)$/i);
  if (!match) return null;

  const baseName = match[1];
  return resolvePublicAsset(`assets/images-webp/${baseName}.webp`);
}

/**
 * High-performance progressive picture element:
 * - Attempts to load lightweight WebP Q65 format first (91%+ bandwidth reduction)
 * - The browser only fetches the source JPEG fallback if WebP is unsupported or fails to load
 */
export const OptimizedPicture: React.FC<OptimizedPictureProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  ...rest
}) => {
  const webpUrl = getWebpSrc(src);

  if (!webpUrl) {
    // If not matching pattern, render standard img
    return <img src={src} alt={alt} className={className} loading={loading} {...rest} />;
  }

  return (
    <picture className="contents">
      <source srcSet={webpUrl} type="image/webp" />
      <img src={src} alt={alt} className={className} loading={loading} {...rest} />
    </picture>
  );
};
