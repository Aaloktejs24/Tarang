"use client";
import { useState, useEffect } from "react";
import { getProfile } from "../features/auth/authService";

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        // Backend doesn't have is_profile_completed field — compute it
        // A profile is considered complete when essential fields are filled
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
  }, []);

  return { profile, loading, error };
};
