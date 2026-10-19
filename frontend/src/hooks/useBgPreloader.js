import { useState, useEffect } from 'react';
import { useLoading } from '../contexts/LoadingContext';

export function useBgPreloader(url, loading = false) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    if (!url || loading) {
      setTimeout(() => setIsLoaded(false), 0);
      return;
    }

    // Check if we are running in the browser
    if (typeof window === 'undefined') {
      return;
    }

    const img = new Image();
    img.src = url;

    const handleLoad = () => setIsLoaded(true);

    if (img.complete) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
      img.onload = handleLoad;
      img.onerror = handleLoad; // Consider it loaded even on error so it doesn't block UI forever
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url, loading]);

  const shouldLoad = loading || (url && !isLoaded);

  useEffect(() => {
    if (shouldLoad) {
      startLoading();
      return () => {
        stopLoading();
      };
    }
  }, [shouldLoad, startLoading, stopLoading]);

  return isLoaded;
}
