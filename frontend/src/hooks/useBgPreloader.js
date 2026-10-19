import { useEffect, useState } from 'react';
import { useLoading } from '../contexts/LoadingContext';

/**
 * Preloads a background image and drives the global loading spinner.
 *
 * Handles edge-cases:
 *  - Cached images that fire onload synchronously (race-condition guard via flag).
 *  - Component unmount before load completes (stopLoading only called once).
 *  - Null/undefined imageUrl (treated as already loaded).
 *
 * @param {string|null} imageUrl — URL of the background image to preload.
 * @returns {boolean} bgLoaded  — true once the image is available.
 */
export function useBgPreloader(imageUrl, loading = false) {
  const [bgLoaded, setBgLoaded] = useState(false);
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    let isLoaderActive = false;

    const safeStartLoading = () => {
      if (!isLoaderActive) {
        startLoading();
        isLoaderActive = true;
      }
    };

    const safeStopLoading = () => {
      if (isLoaderActive) {
        stopLoading();
        isLoaderActive = false;
      }
    };

    if (loading) {
      safeStartLoading();
      return safeStopLoading;
    }

    if (!imageUrl) {
      setBgLoaded(true);
      return;
    }

    setBgLoaded(false);
    safeStartLoading();

    const img = new window.Image();

    img.onload = () => {
      setBgLoaded(true);
      safeStopLoading();
    };

    img.onerror = () => {
      setBgLoaded(true);
      safeStopLoading();
    };

    // assign src AFTER handlers to avoid sync-fire race
    img.src = imageUrl;

    return safeStopLoading;
  }, [imageUrl, loading, startLoading, stopLoading]);

  return bgLoaded;
}
