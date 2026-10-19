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

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };

    // Persistent token for logged in users
    const token = getToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // Add artificial delay for GET requests to prevent skeleton UI flashing
    const isGet = response.config.method?.toLowerCase() === 'get';
    const MINIMUM_DELAY = 1000; // 3000ms for smooth skeleton viewing
    const startTime = response.config.metadata?.startTime;

    if (isGet && startTime) {
      const elapsed = new Date() - startTime;
      if (elapsed < MINIMUM_DELAY) {
        await new Promise(resolve => setTimeout(resolve, MINIMUM_DELAY - elapsed));
      }
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 1. If we get a 401 and haven't tried refreshing yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {

      // If we're already on the landing page, don't try to refresh, just clear and stay there
      if (typeof window !== "undefined" && window.location.pathname === "/") {
        removeToken();
        return Promise.reject(error);
      }

      // If this IS the refresh request failing, don't loop
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
        // We use fetch here to avoid circular dependency with apiClient/authService
        const refreshResp = await fetch(`${baseURL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include" // Crucial for sending/receiving HttpOnly cookies
        });

        if (!refreshResp.ok) throw new Error("Refresh failed");

        const data = await refreshResp.json();
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
  if (isWindowAvailable && window.location.pathname !== "/") {
    removeToken();
    sessionStorage.removeItem("registration_token");
    sessionStorage.removeItem("auth_flow_in_progress");
    window.location.href = "/";
  }
}
