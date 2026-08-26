/**
 * Utility functions for image URL optimization and automatic WebP conversion
 * via Cloudinary Dynamic URL Transformations.
 */

export type MediaType = 'product' | 'logo' | 'banner' | 'qris' | 'raw';

interface OptimizeOptions {
  width?: number;
  height?: number;
  crop?: 'limit' | 'fill' | 'fit' | 'scale' | 'pad';
  gravity?: 'auto' | 'face' | 'center';
  quality?: 'auto' | 'auto:good' | 'auto:eco' | 'auto:best' | number;
  format?: 'webp' | 'auto';
}

/**
 * Default preset configurations per media type
 */
const MEDIA_PRESETS: Record<MediaType, OptimizeOptions | null> = {
  product: {
    format: 'webp',
    quality: 'auto',
    width: 800,
    crop: 'limit',
  },
  logo: {
    format: 'webp',
    quality: 'auto',
    width: 300,
    height: 300,
    crop: 'fill',
    gravity: 'auto',
  },
  banner: {
    format: 'webp',
    quality: 'auto',
    width: 1200,
    crop: 'limit',
  },
  // QRIS is deliberately kept raw/uncompressed to ensure 100% scanning accuracy
  qris: null,
  raw: null,
};

/**
 * Optimizes a Cloudinary image URL by inserting transformation parameters (WebP, quality, max-dimensions).
 * If the URL is not a Cloudinary URL or already contains transformation parameters, it handles it safely.
 *
 * @param url The raw or existing image URL
 * @param mediaType The type of media ('product', 'logo', 'banner', 'qris', 'raw')
 * @param customOptions Optional custom overrides for width, height, crop, format, etc.
 * @returns The optimized WebP image URL
 */
export function optimizeCloudinaryUrl(
  url: string | null | undefined,
  mediaType: MediaType = 'product',
  customOptions?: Partial<OptimizeOptions>
): string {
  if (!url || typeof url !== 'string') return '';

  const trimmedUrl = url.trim();
  if (!trimmedUrl) return '';

  // If mediaType is raw or qris, do not transform
  if (mediaType === 'qris' || mediaType === 'raw') {
    return trimmedUrl;
  }

  // Only transform Cloudinary upload URLs
  if (!trimmedUrl.includes('res.cloudinary.com') || !trimmedUrl.includes('/upload/')) {
    return trimmedUrl;
  }

  // Check if URL already has transformation segment right after /upload/
  // Format: .../upload/[transformations]/v12345/... or .../upload/v12345/...
  const uploadIndex = trimmedUrl.indexOf('/upload/');
  const afterUpload = trimmedUrl.substring(uploadIndex + 8); // string after '/upload/'

  const preset = MEDIA_PRESETS[mediaType] || MEDIA_PRESETS.product;
  const config: OptimizeOptions = {
    ...preset,
    ...customOptions,
  };

  const transformParts: string[] = [];

  if (config.format) transformParts.push(`f_${config.format}`);
  if (config.quality) transformParts.push(`q_${config.quality}`);
  if (config.width) transformParts.push(`w_${config.width}`);
  if (config.height) transformParts.push(`h_${config.height}`);
  if (config.crop) transformParts.push(`c_${config.crop}`);
  if (config.gravity) transformParts.push(`g_${config.gravity}`);

  const transformString = transformParts.join(',');

  // If there's already an existing transformation segment (e.g. /upload/w_256,h_256/... or /upload/f_webp/...)
  // We check if the next segment does not start with 'v' followed by digits (version indicator)
  const isDirectVersionOrPublicId = /^v\d+\//.test(afterUpload) || /^[^/]+\.[a-zA-Z0-9]+$/.test(afterUpload);

  if (isDirectVersionOrPublicId) {
    // Normal raw URL: insert transformation
    return trimmedUrl.replace('/upload/', `/upload/${transformString}/`);
  } else {
    // If it already has some transformation segment, replace or update it safely
    const firstSlashAfterUpload = afterUpload.indexOf('/');
    if (firstSlashAfterUpload !== -1) {
      const existingTransform = afterUpload.substring(0, firstSlashAfterUpload);
      // If existing transform doesn't look like version tag (e.g. v1740000)
      if (!/^v\d+$/.test(existingTransform)) {
        return trimmedUrl.replace(`/upload/${existingTransform}/`, `/upload/${transformString}/`);
      }
    }
    return trimmedUrl.replace('/upload/', `/upload/${transformString}/`);
  }
}

/**
 * Shorthand helper for product image rendering with specific responsive width
 *
 * @param url The product image URL
 * @param width Target max width in pixels (defaults to 800)
 * @returns WebP optimized product image URL
 */
export function getProductImageWebp(url: string | null | undefined, width = 800): string {
  if (!url) return '';
  return optimizeCloudinaryUrl(url, 'product', { width });
}
