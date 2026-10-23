import React, { useState, useEffect } from 'react';
import { 
  normalizeImagePath, 
  getCacheBustedUrl, 
  getAlternateExtensionUrls, 
  getCinematicPlaceholderSvg 
} from '../utils/imageUtils';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

/**
 * SmartImage Component
 * - Automatically attempts alternative extensions (.png, .webp, .jpeg, .jpg, .avif, .gif) if an image fails.
 * - Adds cache-busting to prevent Vercel / browser stale image cache.
 * - Smooth fade-in once loaded.
 * - Always falls back to a sleek cinematic placeholder if no image file is found.
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle = 'DARK VIDEOS',
  ...props
}) => {
  const normalizedSrc = normalizeImagePath(src);
  const [currentSrc, setCurrentSrc] = useState<string>(() => getCacheBustedUrl(normalizedSrc));
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Re-initialize when original src prop changes
  useEffect(() => {
    const clean = normalizeImagePath(src);
    setCurrentSrc(getCacheBustedUrl(clean));
    setAttemptIndex(0);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const handleError = () => {
    const alternatives = getAlternateExtensionUrls(normalizedSrc);

    if (attemptIndex < alternatives.length) {
      const nextAlt = alternatives[attemptIndex];
      setAttemptIndex((prev) => prev + 1);
      setCurrentSrc(getCacheBustedUrl(nextAlt));
    } else {
      // If all extensions fail, use the cinematic default image or SVG placeholder
      if (!currentSrc.includes('hero_cinematic_noir.jpg') && !currentSrc.startsWith('data:')) {
        setCurrentSrc(getCacheBustedUrl('/images/hero_cinematic_noir.jpg'));
      } else {
        setHasError(true);
        setCurrentSrc(getCinematicPlaceholderSvg(fallbackTitle));
      }
    }
  };

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onLoad={() => setIsLoaded(true)}
      onError={handleError}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-90'} transition-opacity duration-300`}
    />
  );
};
