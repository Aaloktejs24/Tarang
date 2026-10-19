import { useState, useEffect, useRef } from 'react';

/**
 * Smart loading hook to prevent spinner flashes.
 * 
 * Rules:
 * 1. If `isLoading` is true, wait `delayMs` before showing the spinner.
 * 2. If `isLoading` becomes false BEFORE `delayMs`, never show the spinner.
 * 3. If the spinner IS shown, force it to stay visible for AT LEAST `minDisplayMs`,
 *    even if `isLoading` becomes false during that time.
 *
 * @param {boolean} isLoading - The actual loading state from API/logic.
 * @param {number} delayMs - Wait time before showing spinner (default: 100ms).
 * @param {number} minDisplayMs - Minimum time to show spinner once it appears (default: 1000ms).
 * @returns {boolean} - The debounced/smart loading state to pass to UI components.
 */
export function useDebouncedLoading(isLoading, delayMs = 100, minDisplayMs = 2500) {
  const [showLoader, setShowLoader] = useState(false);
  const timerRef = useRef(null);
  const showStartTimeRef = useRef(0);

  useEffect(() => {
    // Clear any existing timers on state change
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isLoading) {
      if (showLoader) {
        // Already showing, do nothing (keep showing)
        return;
      } else {
        // Not showing yet, start delay timer
        timerRef.current = setTimeout(() => {
          showStartTimeRef.current = Date.now();
          setShowLoader(true);
        }, delayMs);
      }
    } else {
      if (showLoader) {
        // Need to hide, but check minDisplayMs
        const timeElapsed = Date.now() - showStartTimeRef.current;
        if (timeElapsed < minDisplayMs) {
          timerRef.current = setTimeout(() => {
            setShowLoader(false);
          }, minDisplayMs - timeElapsed);
        } else {
          setShowLoader(false);
        }
      } else {
        // Not showing, and not loading, nothing to do (timer already cleared)
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isLoading, delayMs, minDisplayMs, showLoader]);

  return showLoader;
}

export const useSmartLoading = useDebouncedLoading;
export default useDebouncedLoading;
