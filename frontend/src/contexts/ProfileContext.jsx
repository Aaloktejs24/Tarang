"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { getProfile } from "../features/auth/authService";
import { AuthContext } from "./AuthContext";

export const ProfileContext = createContext({
  profile: null,
  loading: true,
  error: null,
  refreshProfile: async () => {},
});

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isLoading: authLoading } = useContext(AuthContext);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // First try /user/profile to get the role
      const userData = await getProfile();
      let data = userData;
      
      // If institute/admin, re-fetch from /institute/profile for full institute_profile data
      if (data && (data.role === 'institute' || data.role === 'admin')) {
        try {
          const { apiClient } = await import('../lib/apiClient');
          const instResp = await apiClient.get("/institute/profile");
          data = instResp.data;
        } catch (e) {
          // fallback: use the /user/profile data
        }
      }
      
      if (data) {
        if (data.role === 'institute' || data.role === 'admin') {
          data.is_profile_completed = !!(data.primary_name && data.location);
        } else {
          data.is_profile_completed = !!(data.full_name && data.location && data.dob);
        }
      }
      setProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait until auth state is resolved
    if (authLoading) return;

    // If not authenticated, don't fetch
    if (!isAuthenticated) {
      setLoading(false);
      setProfile(null);
      return;
    }

    fetchProfile();

    // Auto-update mechanism: listen for global mutations
    const handleProfileMutated = async (e) => {
      const forceUpdate = e?.detail?.forceUpdate;
      try {
        // Fetch profile silently without triggering the global loading state
        let data = await getProfile();
        
        // If institute/admin, re-fetch from /institute/profile for full data
        if (data && (data.role === 'institute' || data.role === 'admin')) {
          try {
            const { apiClient } = await import('../lib/apiClient');
            const instResp = await apiClient.get("/institute/profile");
            data = instResp.data;
          } catch (err) {
            // fallback: use the /user/profile data
          }
        }
        
        if (data) {
          if (data.role === 'institute' || data.role === 'admin') {
            data.is_profile_completed = !!(data.primary_name && data.location);
          } else {
            data.is_profile_completed = !!(data.full_name && data.location && data.dob);
          }
          setProfile(data);
        }
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener("tarang:profile-mutated", handleProfileMutated);
    return () => window.removeEventListener("tarang:profile-mutated", handleProfileMutated);
  }, [isAuthenticated, authLoading]);

  return (
    <ProfileContext.Provider value={{ profile, loading, error, refreshProfile: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
