"use client";

import React, { createContext, useEffect, useState } from "react";
import { getToken, getAuthFlowInProgress } from "../lib/auth";
import { refreshAuthToken } from "../features/auth/authService";

export const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: true,
  checkAuth: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    let token = getToken();
    const inProgress = getAuthFlowInProgress();

    if (!token && !inProgress) {
      try {
        await refreshAuthToken();
        token = getToken();
      } catch (err) {
        token = null;
      }
    }

    setIsAuthenticated(!!token);
    setIsLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const doCheck = async () => {
      let token = getToken();
      const inProgress = getAuthFlowInProgress();

      if (!token && !inProgress) {
        try {
          await refreshAuthToken();
          token = getToken();
        } catch (err) {
          token = null;
        }
      }

      if (isMounted) {
        setIsAuthenticated(!!token);
        setIsLoading(false);
      }
    };

    doCheck();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
