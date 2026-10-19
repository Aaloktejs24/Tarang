"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { usePathname, useSearchParams } from "next/navigation";

const LoadingContext = createContext({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

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
  const [isLoading, setIsLoading] = useState(false);
  const loadingCountRef = React.useRef(0);
  const timeoutRef = React.useRef(null);

  const startLoading = () => {
    loadingCountRef.current += 1;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoading(true);
  };

  const stopLoading = () => {
    loadingCountRef.current = Math.max(0, loadingCountRef.current - 1);
    if (loadingCountRef.current === 0) {
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 200);
    }
  };

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      <Backdrop
        sx={(theme) => ({ 
          color: "#0056b3", 
          zIndex: theme.zIndex.drawer + 9999,
          background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.25) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.2) 0, transparent 50%), 
            radial-gradient(at 80% 100%, rgba(40, 167, 69, 0.2) 0, transparent 50%),
            radial-gradient(at 20% 100%, rgba(0, 86, 179, 0.2) 0, transparent 50%),
            rgba(255, 255, 255, 0.35)
          `,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        })}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </LoadingContext.Provider>
  );
};
