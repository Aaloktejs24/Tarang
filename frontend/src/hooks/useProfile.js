"use client";
import { useState, useEffect, useContext } from "react";
import { getProfile } from "../features/auth/authService";
import { AuthContext } from "../contexts/AuthContext";

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isLoading: authLoading } = useContext(AuthContext);

  useEffect(() => {
    // Wait until auth state is resolved
    if (authLoading) return;

    // If not authenticated, don't fetch
    if (!isAuthenticated) {
      setLoading(false);
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        if (data) {
          if (data.role === 'institute' || data.role === 'organisation') {
            data.is_profile_completed = !!(data.institution_name && data.location);
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

    fetchProfile();
  }, [isAuthenticated, authLoading]);

  return { profile, loading, error };
};
