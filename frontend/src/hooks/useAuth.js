"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../contexts/AuthContext";
import { getAuthFlowInProgress } from "../lib/auth";

export const useAuth = (requireAuth = true) => {
  const { isAuthenticated, isLoading, checkAuth } = useContext(AuthContext);
  const router = useRouter();

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
