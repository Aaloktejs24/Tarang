"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Box, Typography, Paper, Avatar, Chip,
  Container, Divider, IconButton, Button, Skeleton
} from "@mui/material";

import { motion } from "framer-motion";
import { apiClient } from "../../../lib/apiClient";
import { preserveSignedUrls } from "../../../utils/imageUtils";
import VerifiedIcon from "@mui/icons-material/Verified";
import ShareIcon from "@mui/icons-material/Share";
import LanguageIcon from "@mui/icons-material/Language";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import PublicProfileSkeleton from "../../../features/profile/PublicProfileSkeleton";
import ProfileLayout from "../../../features/profile/components/ProfileLayout";
import { useToast } from "../../../contexts/ToastContext";

export default function PublicProfile() {
  const { username } = useParams();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const response = await apiClient.get(`/public/profile/${username}`);
        setProfile(prev => preserveSignedUrls(prev, response.data, [
          'profile_pic_url',
          'banner_url',
          'institute_profile.logo_url',
          'institute_profile.banner_url'
        ]));
      } catch (err) {
        console.error("Failed to fetch public profile:", err);
        setError("User not found or profile is private.");
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchPublicProfile();
  }, [username]);

  if (loading) {
    return <PublicProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <Box sx={{ p: 5, textAlign: "center", mt: 10 }}>
        <Typography variant="h5" color="error">{error || "User not found"}</Typography>
        <Button variant="contained" disableElevation href="/" sx={{ mt: 3, bgcolor: "var(--color-primary)" }}>Return Home</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", bgcolor: "var(--color-slate-50)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Navbar / Branding */}
      <Box sx={{ flexShrink: 0, bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)", py: 2, px: 4, mb: 0, borderBottom: "var(--border-thin) solid var(--color-slate-200)" }}>
        <Container maxWidth="lg">
          <Typography variant="h6" fontWeight={900} color="var(--color-primary)" sx={{ letterSpacing: "-1px" }}>
            TARANG <span style={{ color: "var(--color-slate-500)", fontWeight: 'var(--font-medium)', fontSize: 'var(--font-sm)' }}>• PUBLIC PROFILE</span>
          </Typography>
        </Container>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        <ProfileLayout
          profile={profile}
          config={{ sidebarPrimary: "Skills", sidebarSecondary: "Recognitions" }}
          editable={false}
          stats={[]}
          tabs={[{ label: "About", value: "about", icon: null }]}
          currentTab="about"
          onTabChange={() => {}}
          actionButtons={
            <Button
              variant="contained" disableElevation
              startIcon={<ShareIcon />}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast("Profile link copied!", "success");
              }}
              sx={{
                borderRadius: "var(--radius-full)", textTransform: "none", fontWeight: 'var(--font-bold)',
                px: 3, bgcolor: "var(--color-primary)", "&:hover": { bgcolor: "var(--color-primary-hover)" }
              }}
            >
              Share
            </Button>
          }
          tabPanels={{
            about: (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)", borderRadius: "var(--radius-lg)", border: "var(--border-thin) solid var(--card-border)" }}>
                  <Typography variant="h6" fontWeight={800} color="var(--color-primary)" mb={2}>
                    About
                  </Typography>
                  <Typography color="var(--color-slate-900)" lineHeight={1.8}>
                    A passionate learner on the Tarang platform dedicated to excellence in digital education.
                    Focusing on building a professional portfolio and contributing to the digital education ecosystem.
                    {profile.kyc_status === "verified" && " Identity verified and certified by Tarang authorities."}
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: "center", mt: 4 }}>
                  <Typography color="var(--color-slate-500)" fontSize={13}>
                    © 2026 Tarang Ecosystem • Secure DigiLocker Verified Profile
                  </Typography>
                </Box>
              </Box>
            )
          }}
        />
      </Box>
    </Box>
  );
}
