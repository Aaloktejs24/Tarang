"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import BackdropBlur from "../components/common/BackdropBlur";
import { useSmartLoading } from "../hooks/useSmartLoading";

/**
 * Global loading context.
 * Supports concurrent callers via a ref-counted counter:
 *   - startLoading() increments the counter and shows the spinner.
 *   - stopLoading()  decrements the counter; spinner hides only when count reaches 0.
 *   - resetLoading() force-resets the counter (emergency/cleanup use).
 */
const LoadingContext = createContext({
  isLoading: false,
  startLoading: () => { },
  stopLoading: () => { },
  resetLoading: () => { },
});

export const useLoading = () => useContext(LoadingContext);

/** Declarative helper — syncs an external boolean into the loading context. */
export function SyncLoading({ isLoading }) {
  const { startLoading, stopLoading } = useLoading();
  useEffect(() => {
    if (isLoading) startLoading();
    else stopLoading();
    return () => stopLoading();
  }, [isLoading, startLoading, stopLoading]);
  return null;
}

export const LoadingProvider = ({ children }) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const countRef = React.useRef(0);

  const startLoading = React.useCallback(() => {
    countRef.current += 1;
    if (countRef.current === 1) {
      setInternalLoading(true);
    }
  }, []);

  const stopLoading = React.useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1);
    if (countRef.current === 0) {
      setInternalLoading(false);
    }
  }, []);

  // Use the global smart delay: wait 100ms before showing full-window loader, minimum 1000ms
  const isLoading = useSmartLoading(internalLoading, 100, 1000);

  /** Force-reset — use when you suspect the counter got out of sync. */
  const resetLoading = React.useCallback(() => {
    clearDebounce();
    countRef.current = 0;
    setIsLoading(false);
  }, []);

  // Safety valve: auto-reset if spinner has been visible for > 30s (stuck guard)
  useEffect(() => {
    if (!isLoading) return;
    const safetyTimer = setTimeout(() => {
      if (countRef.current > 0) {
        console.warn("[LoadingContext] Spinner stuck for 30s — force-resetting.");
        countRef.current = 0;
        setIsLoading(false);
      }
    }, 30_000);
    return () => clearTimeout(safetyTimer);
  }, [isLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, resetLoading }}>
      {children}
      <BackdropBlur open={isLoading} zIndex={99998}>
        <CircularProgress key={isLoading ? 'spinning' : 'idle'} sx={{ color: 'var(--color-primary)' }} />
      </BackdropBlur>
    </LoadingContext.Provider>
  );
};
