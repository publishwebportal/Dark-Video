/**
 * Universal Image Utility for DarkVideos
 * Resolves images, handles cache-busting, and provides multi-format fallbacks
 * (jpg, png, webp, jpeg, avif, gif, svg) for Vercel & GitHub deployments.
 */

// Common image extensions to try when an image fails to load
export const COMMON_IMAGE_EXTENSIONS = ['jpg', 'png', 'webp', 'jpeg', 'avif', 'svg', 'gif', 'JPG', 'PNG', 'JPEG', 'WEBP'];

// Unique build timestamp to ensure newly pushed GitHub images aren't cached stale by browsers
export const APP_BUILD_ID = typeof window !== 'undefined' 
  ? (window as any).__DARK_VIDEOS_BUILD_ID__ || String(Date.now()).slice(0, 8)
  : 'v1';

/**
 * Normalizes an image path from GitHub or user input.
 * Handles:
 * - External URLs (https://...)
 * - Data URLs (data:image/...)
 * - Relative paths (images/foo.png -> /images/foo.png)
 * - Misplaced src paths (src/assets/images/foo.png -> /images/foo.png)
 */
export function normalizeImagePath(rawUrl: string | undefined | null): string {
  if (!rawUrl) return '/images/hero_cinematic_noir.jpg';
  
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Remove leading './' or '.'
  let clean = trimmed.replace(/^\.?\//, '/');
  if (!clean.startsWith('/')) {
    clean = '/' + clean;
  }

  // Normalize /src/assets/images/ or /public/images/ to /images/
  clean = clean.replace(/^\/src\/assets\/images\//, '/images/');
  clean = clean.replace(/^\/public\/images\//, '/images/');
  clean = clean.replace(/^\/public\//, '/');

  return clean;
}

/**
 * Appends a cache-busting parameter to prevent Vercel / browser stale caching.
 */
export function getCacheBustedUrl(url: string, customVersion?: string): string {
  if (!url) return '';
  if (url.startsWith('data:')) return url;

  const version = customVersion || APP_BUILD_ID;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_v=${encodeURIComponent(version)}`;
}

/**
 * Given a URL, generates alternative URLs with different extensions.
 * e.g. "/images/video.jpg" -> ["/images/video.png", "/images/video.webp", "/images/video.jpeg", "/images/video.avif"]
 */
export function getAlternateExtensionUrls(originalUrl: string): string[] {
  if (!originalUrl || originalUrl.startsWith('data:')) return [];

  // Remove existing query string if any
  const [basePath] = originalUrl.split('?');
  
  // Find extension
  const dotIndex = basePath.lastIndexOf('.');
  const slashIndex = basePath.lastIndexOf('/');

  if (dotIndex <= slashIndex) {
    // No extension found, try adding extensions
    return COMMON_IMAGE_EXTENSIONS.map(ext => `${basePath}.${ext}`);
  }

  const baseWithoutExt = basePath.substring(0, dotIndex);
  const currentExt = basePath.substring(dotIndex + 1);

  const alternatives: string[] = [];
  for (const ext of COMMON_IMAGE_EXTENSIONS) {
    if (ext.toLowerCase() !== currentExt.toLowerCase()) {
      alternatives.push(`${baseWithoutExt}.${ext}`);
    }
  }

  // Also include root /images/ fallback if path was in root or vice-versa
  if (!basePath.startsWith('/images/') && basePath.includes('/')) {
    const filename = basePath.split('/').pop();
    if (filename) {
      alternatives.push(`/images/${filename}`);
    }
  }

  return alternatives;
}

/**
 * Generates an SVG placeholder data URL with dark cinematic branding.
 */
export function getCinematicPlaceholderSvg(title: string = 'DARK VIDEOS', width = 640, height = 360): string {
  const safeTitle = title.replace(/[<>&"]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#011C40" />
        <stop offset="50%" stop-color="#023859" />
        <stop offset="100%" stop-color="#01142E" />
      </linearGradient>
      <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#26658C" />
        <stop offset="50%" stop-color="#54ACBF" />
        <stop offset="100%" stop-color="#A7EBF2" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" />
    <circle cx="${width / 2}" cy="${height / 2 - 18}" r="38" fill="#011C40" stroke="#54ACBF" stroke-width="2" opacity="0.85" />
    <polygon points="${width / 2 - 10},${height / 2 - 32} ${width / 2 + 16},${height / 2 - 18} ${width / 2 - 10},${height / 2 - 4}" fill="#A7EBF2" />
    <text x="50%" y="${height / 2 + 42}" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#A7EBF2" text-anchor="middle" letter-spacing="1.5">${safeTitle}</text>
    <rect x="${width / 2 - 40}" y="${height / 2 + 54}" width="80" height="2" rx="1" fill="url(#glow)" />
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
