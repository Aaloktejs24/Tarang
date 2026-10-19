"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getAuthFlowInProgress } from "../lib/auth";

export const useAuth = (requireAuth = true) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const inProgress = getAuthFlowInProgress();

      console.log("useAuth Check:", { token: !!token, inProgress, requireAuth });

      if (requireAuth && !token) {
        // Protected route, no token -> kick to landing page
        console.log("useAuth: Redirecting to landing (unauthorized)");
        // Temporary bypass auth check for debugging
        router.push("/");
      } else if (!requireAuth && token && !inProgress) {
        // Public route (like login), has token and NOT in middle of a flow -> kick to dashboard
        console.log("useAuth: Redirecting to dashboard (authorized)");
        router.push("/dashboard/home/institute");
      } else {
        // Authorized access or flow in progress
        setIsAuthenticated(!!token);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requireAuth]);

  return { isAuthenticated, isLoading };
};
