"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Box, Typography, Paper, Avatar, Chip,
  Container, Divider, IconButton, Button, Skeleton
} from "@mui/material";

import { motion } from "framer-motion";
import { apiClient } from "../../../lib/apiClient";
import VerifiedIcon from "@mui/icons-material/Verified";
import ShareIcon from "@mui/icons-material/Share";
import LanguageIcon from "@mui/icons-material/Language";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import PublicProfileSkeleton from "../../../features/profile/PublicProfileSkeleton";

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const response = await apiClient.get(`/public/profile/${username}`);
        setProfile(response.data);
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
    <Box sx={{ minHeight: "var(--size-screen-h)", bgcolor: "var(--color-slate-50)", pb: 10 }}>
      {/* Navbar / Branding */}
      <Box sx={{ bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)", py: 2, px: 4, mb: 0, borderBottom: "var(--border-thin) solid var(--color-slate-200)" }}>
        <Container maxWidth="lg">
          <Typography variant="h6" fontWeight={900} color="var(--color-primary)" sx={{ letterSpacing: "-1px" }}>
            TARANG <span style={{ color: "var(--color-slate-500)", fontWeight: 'var(--font-medium)', fontSize: 'var(--font-sm)' }}>• PUBLIC PROFILE</span>
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: "16px", sm: "20px", md: "24px" }, overflow: "hidden",
            border: "var(--border-thin) solid rgba(30, 79, 163, 0.1)",
          }}
        >
          {/* Banner */}
          <Box sx={{ height: 260, position: "relative", bgcolor: "var(--color-primary)" }}>
            {profile.banner_url ? (
              <img
                src={profile.banner_url}
                alt="Banner"
                style={{ width: "var(--size-full)", height: "var(--size-full)", objectFit: "cover" }}
              />
            ) : (
              <Box sx={{ width: "var(--size-full)", height: "var(--size-full)", background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)" }} />
            )}
          </Box>

          {/* Profile Header Info */}
          <Box sx={{ px: { xs: 3, md: 5 }, pb: 5, position: "relative", mt: -10 }}>
            <Box sx={{ display: "flex", alignItems: "flex-end", flexWrap: "wrap", gap: 3 }}>
              {/* Avatar */}
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Avatar
                  src={profile.profile_pic_url}
                  sx={{
                    width: 160, height: 160, border: "6px solid var(--card-inner-border)",
                    bgcolor: "var(--color-slate-200)"
                  }}
                >
                  {!profile.profile_pic_url && profile.username?.[0]?.toUpperCase()}
                </Avatar>
              </motion.div>

              <Box sx={{ mb: 2, flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h4" fontWeight={900} color="var(--color-slate-900)">
                    {profile.full_name || profile.username}
                  </Typography>
                  {profile.kyc_status === "verified" && (
                    <VerifiedIcon sx={{ color: "var(--color-primary)", fontSize: 24 }} />
                  )}
                </Box>
                <Typography variant="h6" color="var(--color-slate-500)" fontWeight={500}>
                  {profile.role || "Tarang Member"} • Digital Education Enthusiast
                </Typography>
                <Typography color="var(--color-slate-500)" fontSize={14} mt={0.5}>
                  Tarang Professional Profile
                </Typography>
              </Box>

              <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
                <Button
                  variant="contained" disableElevation
                  startIcon={<ShareIcon />}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Profile link copied!");
                  }}
                  sx={{
                    borderRadius: "var(--radius-full)", textTransform: "none", fontWeight: 'var(--font-bold)',
                    px: 3, bgcolor: "var(--color-primary)", "&:hover": { bgcolor: "var(--color-primary-hover)" }
                  }}
                >
                  Share
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 4, opacity: 0.5 }} />

            {/* About Section */}
            <Box sx={{ maxWidth: "800px" }}>
              <Typography variant="h6" fontWeight={800} color="var(--color-primary)" mb={2}>
                About
              </Typography>
              <Typography color="var(--color-slate-900)" lineHeight={1.8}>
                A passionate learner on the Tarang platform dedicated to excellence in digital education.
                Focusing on building a professional portfolio and contributing to the digital education ecosystem.
                {profile.kyc_status === "verified" && " Identity verified and certified by Tarang authorities."}
              </Typography>
            </Box>

            {/* Verification Status */}
            <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
              <Chip
                icon={<ShieldOutlinedIcon sx={{ fontSize: 18 }} />}
                label={profile.kyc_status === "verified" ? "ID Verified" : "Verification Pending"}
                sx={{
                  bgcolor: profile.kyc_status === "verified" ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 193, 7, 0.1)",
                  color: profile.kyc_status === "verified" ? "var(--color-success)" : "var(--color-warning)",
                  fontWeight: 'var(--font-bold)', p: 2
                }}
              />
              <Chip
                icon={<BusinessCenterOutlinedIcon sx={{ fontSize: 18 }} />}
                label={profile.role || "Student"}
                variant="outlined"
                sx={{ fontWeight: 'var(--font-bold)', p: 2, borderColor: "var(--color-slate-200)" }}
              />
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography color="var(--color-slate-500)" fontSize={13}>
            © 2026 Tarang Ecosystem • Secure DigiLocker Verified Profile
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
