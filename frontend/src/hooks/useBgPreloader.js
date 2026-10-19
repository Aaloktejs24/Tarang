import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { useLoading } from '../contexts/LoadingContext';

/**
 * Preloads a background image and manages the global full-screen loader.
 *
 * Rule: Show the full-window loader from the moment the component mounts
 * until BOTH the data AND the image are ready. No skeleton is shown during this time.
 *
 * @param {string}  imageUrl    - The background image URL (empty/null while data is still loading).
 * @param {boolean} dataLoading - True while API data is still being fetched.
 * @returns {boolean}           - True when the image is fully loaded and ready to display.
 */
export function useBgPreloader(imageUrl, dataLoading = false) {
  const [imageReady, setImageReady] = useState(false);
  const { startLoading, stopLoading } = useLoading();

  // Whether we are still waiting — either data OR the image isn't ready yet.
  const isWaiting = dataLoading || (!!imageUrl && !imageReady);

  // Keep a ref to avoid double start/stop calls across re-renders
  const activeRef = useRef(false);

  useLayoutEffect(() => {
    if (isWaiting) {
      if (!activeRef.current) {
        activeRef.current = true;
        startLoading();
      }
    } else {
      if (activeRef.current) {
        activeRef.current = false;
        stopLoading();
      }
    }
  }, [isWaiting, startLoading, stopLoading]);

  // Cleanup on unmount — always release the lock
  // useLayoutEffect fires before browser paint — loader appears on the very first frame
  useLayoutEffect(() => {
    return () => {
      if (activeRef.current) {
        activeRef.current = false;
        stopLoading();
      }
    };
  }, [stopLoading]);

  // Preload the image whenever the URL changes
  useEffect(() => {
    if (!imageUrl || dataLoading) {
      setImageReady(false);
      return;
    }

    if (typeof window === 'undefined') return;

    const img = new window.Image();
    img.src = imageUrl;

    if (img.complete) {
      setImageReady(true);
    } else {
      setImageReady(false);
      img.onload = () => setImageReady(true);
      img.onerror = () => setImageReady(true); // Don't block UI forever on error
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, dataLoading]);

  return imageReady;
}
