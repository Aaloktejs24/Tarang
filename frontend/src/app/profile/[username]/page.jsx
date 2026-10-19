"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Box, Typography, Paper, Avatar, Chip, 
  Container, Divider, IconButton, Button, Skeleton 
} from "@mui/material";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { apiClient } from "../../../lib/apiClient";
import Loader from "../../../components/common/Loader";
import VerifiedIcon from "@mui/icons-material/Verified";
import ShareIcon from "@mui/icons-material/Share";
import LanguageIcon from "@mui/icons-material/Language";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import { useLoading } from '../../../contexts/LoadingContext';

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
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f1f5f9", pb: 10 }}>
        <Box sx={{ bgcolor: "white", py: 2, px: 4, mb: 0, borderBottom: "1px solid #e2e8f0" }}>
          <Container maxWidth="lg">
            <Typography variant="h6" fontWeight={900} color="#0056b3" sx={{ letterSpacing: "-1px" }}>
              TARANG <span style={{ color: "#64748b", fontWeight: 500, fontSize: "14px" }}>• PUBLIC PROFILE</span>
            </Typography>
          </Container>
        </Box>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper elevation={0} sx={{ borderRadius: { xs: "16px", sm: "20px", md: "24px" }, overflow: "hidden", border: "1px solid rgba(30, 79, 163, 0.1)" }}>
            <Skeleton variant="rectangular" height={260} />
            <Box sx={{ px: { xs: 3, md: 5 }, pb: 5, position: "relative", mt: -10 }}>
              <Box sx={{ display: "flex", alignItems: "flex-end", flexWrap: "wrap", gap: 3 }}>
                <Skeleton variant="circular" width={160} height={160} sx={{ border: "6px solid white" }} />
                <Box sx={{ mb: 2, flex: 1 }}>
                  <Skeleton variant="text" width={250} height={40} />
                  <Skeleton variant="text" width={200} height={30} />
                  <Skeleton variant="text" width={150} height={20} />
                </Box>
                <Skeleton variant="rounded" width={100} height={40} sx={{ borderRadius: "50px", mb: 2 }} />
              </Box>
              <Divider sx={{ my: 4, opacity: 0.5 }} />
              <Box sx={{ maxWidth: "800px" }}>
                <Skeleton variant="text" width={100} height={30} mb={2} />
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
              <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                <Skeleton variant="rounded" width={120} height={36} sx={{ borderRadius: "16px" }} />
                <Skeleton variant="rounded" width={100} height={36} sx={{ borderRadius: "16px" }} />
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ p: 5, textAlign: "center", mt: 10 }}>
        <Typography variant="h5" color="error">{error || "User not found"}</Typography>
        <Button variant="contained" disableElevation href="/" sx={{ mt: 3, bgcolor: "#0056b3" }}>Return Home</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f1f5f9", pb: 10 }}>
      {/* Navbar / Branding */}
      <Box sx={{ bgcolor: "white", py: 2, px: 4, mb: 0, borderBottom: "1px solid #e2e8f0" }}>
        <Container maxWidth="lg">
          <Typography variant="h6" fontWeight={900} color="#0056b3" sx={{ letterSpacing: "-1px" }}>
            TARANG <span style={{ color: "#64748b", fontWeight: 500, fontSize: "14px" }}>• PUBLIC PROFILE</span>
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: { xs: "16px", sm: "20px", md: "24px" }, overflow: "hidden", 
            border: "1px solid rgba(30, 79, 163, 0.1)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
          }}
        >
          {/* Banner */}
          <Box sx={{ height: 260, position: "relative", bgcolor: "#0056b3" }}>
            {profile.banner_url ? (
              <img 
                src={profile.banner_url} 
                alt="Banner" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            ) : (
              <Box sx={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #0056b3 0%, #0056b3 100%)" }} />
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
                    width: 160, height: 160, border: "6px solid white", 
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    bgcolor: "#cbd5e1"
                  }}
                >
                  {!profile.profile_pic_url && profile.username?.[0]?.toUpperCase()}
                </Avatar>
              </motion.div>

              <Box sx={{ mb: 2, flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h4" fontWeight={900} color="#0f172a">
                    {profile.full_name || profile.username}
                  </Typography>
                  {profile.kyc_status === "verified" && (
                    <VerifiedIcon sx={{ color: "#0056b3", fontSize: 24 }} />
                  )}
                </Box>
                <Typography variant="h6" color="#64748b" fontWeight={500}>
                  {profile.role || "Tarang Member"} • Digital Education Enthusiast
                </Typography>
                <Typography color="#94a3b8" fontSize={14} mt={0.5}>
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
                    borderRadius: "50px", textTransform: "none", fontWeight: 700, 
                    px: 3, bgcolor: "#0056b3", "&:hover": { bgcolor: "#153b7a" } 
                  }}
                >
                  Share
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 4, opacity: 0.5 }} />

            {/* About Section */}
            <Box sx={{ maxWidth: "800px" }}>
              <Typography variant="h6" fontWeight={800} color="#0056b3" mb={2}>
                About
              </Typography>
              <Typography color="#334155" lineHeight={1.8}>
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
                  bgcolor: profile.kyc_status === "verified" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                  color: profile.kyc_status === "verified" ? "#28a745" : "#f59e0b",
                  fontWeight: 700, p: 2
                }}
              />
              <Chip 
                icon={<BusinessCenterOutlinedIcon sx={{ fontSize: 18 }} />}
                label={profile.role || "Student"} 
                variant="outlined"
                sx={{ fontWeight: 700, p: 2, borderColor: "#e2e8f0" }}
              />
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography color="#94a3b8" fontSize={13}>
            © 2026 Tarang Ecosystem • Secure DigiLocker Verified Profile
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
