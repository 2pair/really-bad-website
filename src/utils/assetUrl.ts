/**
 * Resolves a public asset path so that it works seamlessly both in
 * local development / AI Studio preview (hosted at root /)
 * and on GitHub Pages (hosted at /really-bad-website/).
 */
export function resolvePublicAsset(assetPath: string): string {
  const clean = assetPath.replace(/^(\.\/|\/)+/, '');

  if (typeof window !== 'undefined') {
    const { pathname, hostname } = window.location;

    // Detect GitHub Pages hosting (e.g. 2pair.github.io/really-bad-website/)
    if (hostname.endsWith('github.io')) {
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const repo = segments[0];
        return `/${repo}/${clean}`;
      }
    }
  }

  // Fallback to Vite BASE_URL or relative path
  const base = import.meta.env.BASE_URL || './';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${clean}`;
}
