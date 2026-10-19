"use client";

import { useContext, useEffect } from "react";
import { useAppRouter } from './/useAppRouter';
import { AuthContext } from "../contexts/AuthContext";
import { getAuthFlowInProgress } from "../lib/auth";

export const useAuth = (requireAuth = true) => {
  const { isAuthenticated, isLoading, checkAuth } = useContext(AuthContext);
  const router = useAppRouter();

  useEffect(() => {
    if (isLoading) return;

    const inProgress = getAuthFlowInProgress();

    if (requireAuth && !isAuthenticated) {
      router.push("/");
    } else if (!requireAuth && isAuthenticated && !inProgress) {
      router.push("/dashboard/home/institute");
    }
  }, [isLoading, isAuthenticated, requireAuth, router]);

  return { isAuthenticated, isLoading, checkAuth };
};
