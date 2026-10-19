import axios from "axios";
import { getToken, setToken, removeToken } from "./auth";

/* global process */
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";


export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token and Idempotency keys
apiClient.interceptors.request.use(
  async (config) => {
    config.metadata = { startTime: Date.now() };

    // Persistent token for logged in users
    const token = getToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Automatically inject Idempotency-Key for mutating requests
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      if (!config.headers["Idempotency-Key"]) {
        const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : Date.now().toString(36) + Math.random().toString(36).substring(2);
        config.headers["Idempotency-Key"] = uuid;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  async (response) => {


    if (response.config?.metadata?.startTime) {
      const elapsed = Date.now() - response.config.metadata.startTime;
      if (elapsed >= 50 && elapsed < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
      }
    }


    // // Artificial delay for testing loaders/skeletons
    // await new Promise(resolve => setTimeout(resolve, 5000));

    // Automatically detect profile/data mutations and emit a global event
    const method = response.config?.method?.toLowerCase();
    const url = response.config?.url || "";

    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      if (url.includes("/profile")) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("tarang:profile-mutated"));
        }
      }
      if (url.includes("/applications/") || url.includes("/application/")) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("tarang:application-mutated"));
        }
      }
    }
    return response;
  },
  async (error) => {
    // Also extend errors if they fall in the flicker window
    if (error.config?.metadata?.startTime) {
      const elapsed = Date.now() - error.config.metadata.startTime;
      if (elapsed >= 250 && elapsed < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
      }
    }

    const originalRequest = error.config;

    // 1. If we get a 401 and haven't tried refreshing yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {


      // If we are currently logging in or registering, a 401 means invalid credentials/OTP, not an expired token.
      const isAuthFlow = typeof window !== "undefined" && sessionStorage.getItem("auth_flow_in_progress") === "true";
      const isLoginOrRegister = originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/registration-sessions");
      const isLogout = originalRequest.url?.includes("/auth/logout");

      if (isAuthFlow || isLoginOrRegister || isLogout) {
        return Promise.reject(error);
      }

      // If this IS the refresh request failing, don't loop/refresh
      if (originalRequest.url.includes("/auth/refresh")) {
        isRefreshing = false;
        handleLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call our Next.js proxy route to swallow 401 errors from backend
        const refreshResp = await fetch(`/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });

        const data = await refreshResp.json();

        if (data.authenticated === false) {
          throw new Error("Refresh failed");
        }

        const newToken = data.access_token;

        if (newToken) {
          setToken(newToken);
          apiClient.defaults.headers.common["Authorization"] = "Bearer " + newToken;
          originalRequest.headers["Authorization"] = "Bearer " + newToken;

          processQueue(null, newToken);
          return apiClient(originalRequest);
        }
      } catch (err) {
        processQueue(err, null);
        handleLogout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function handleLogout() {
  const isWindowAvailable = typeof window !== "undefined";
  if (isWindowAvailable) {
    removeToken();
    sessionStorage.removeItem("registration_token");
    sessionStorage.removeItem("auth_flow_in_progress");
    // We let the application/components decide if they want to redirect the user
    // (e.g., protected routes will redirect if user is null).
    // Public routes can remain accessible for guests.
  }
}
