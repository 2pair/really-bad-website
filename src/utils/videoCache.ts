/**
 * On-demand video loader with aggressive persistent CacheStorage caching.
 * Ensures each video is fetched strictly on demand and stored permanently in page cache.
 */

const VIDEO_CACHE_NAME = 'reallybad-video-store-v1';

// In-memory object URL cache for the current session
const inMemoryBlobUrls = new Map<string, string>();

export async function fetchVideoWithCache(url: string): Promise<string> {
  // Check memory map first for instantaneous re-access
  if (inMemoryBlobUrls.has(url)) {
    return inMemoryBlobUrls.get(url)!;
  }

  if (typeof window === 'undefined' || !('caches' in window)) {
    return url;
  }

  try {
    const cache = await caches.open(VIDEO_CACHE_NAME);
    const cachedResponse = await cache.match(url);

    if (cachedResponse) {
      const blob = await cachedResponse.blob();
      const blobUrl = URL.createObjectURL(blob);
      inMemoryBlobUrls.set(url, blobUrl);
      return blobUrl;
    }

    // Load strictly on demand when requested
    const networkResponse = await fetch(url);
    if (networkResponse.ok) {
      // Aggressively store a clone in CacheStorage
      await cache.put(url, networkResponse.clone());
      const blob = await networkResponse.blob();
      const blobUrl = URL.createObjectURL(blob);
      inMemoryBlobUrls.set(url, blobUrl);
      return blobUrl;
    }
  } catch (err) {
    console.warn('Persistent video cache lookup failed, falling back to direct stream:', err);
  }

  return url;
}
