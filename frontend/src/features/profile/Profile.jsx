"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Avatar, Button, Chip, CircularProgress, Accordion, AccordionSummary, AccordionDetails, useTheme, useMediaQuery, IconButton, TextField, Grid } from "@mui/material";
import { motion } from "framer-motion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { apiClient } from "../../lib/apiClient";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import CardMembershipOutlinedIcon from "@mui/icons-material/CardMembershipOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Link from "next/link";
import Loader from "../../components/common/Loader";
import StarIcon from "@mui/icons-material/Star";
import LanguageIcon from "@mui/icons-material/Language";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import VerifiedIcon from "@mui/icons-material/Verified";
import AddIcon from "@mui/icons-material/Add";
import ShareIcon from "@mui/icons-material/Share";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import CloseIcon from "@mui/icons-material/Close";
import KycVerificationModal from "./components/KycVerificationModal";
import ProfileUpdateModal from "./components/ProfileUpdateModal";
import ResponsiveSection from "../../components/ui/ResponsiveSection";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isKycModalOpen, setKycModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);

  const [uploading, setUploading] = useState({ profile: false, banner: false });
  const profileInputRef = React.useRef(null);
  const bannerInputRef = React.useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get("/user/profile");
      setProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);



const handleUpload = async (file, type) => {
  if (!file) return;

  setUploading(prev => ({ ...prev, [type]: true }));

  try {
    // 1. Get signed URL
    const { data } = await apiClient.get(`/s3/sign`, {
      params: {
        user_id: profile.id,
        type: type,
        mime: file.type
      }
    });

    // 2. Upload to S3
    await fetch(data.upload_url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type
      }
    });

    // 3. Update profile record
    const endpoint = type === "profile" ? "/user/profile/update-pic" : "/user/profile/update-banner";
    await apiClient.post(endpoint, {
      user_id: profile.id,
      url: data.file_url
    });

    // 4. Refresh
    await fetchProfile();
  } catch (error) {
    console.error("Upload failed:", error);
    alert("Upload failed. Please try again.");
  } finally {
    setUploading(prev => ({ ...prev, [type]: false }));
  }
};



  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
  };

  // eslint-disable-next-line no-unused-vars
  const InfoRow = ({ icon: Icon, label, value }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4, "&:last-child": { mb: 0 } }}>
      <Box sx={{
        p: 1.5,
        borderRadius: "12px",
        bgcolor: "rgba(30, 79, 163, 0.05)",
        color: "#0056b3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 42,
        height: 42,
        border: "1px solid rgba(30, 79, 163, 0.1)"
      }}>
        <Icon sx={{ fontSize: 20 }} />
      </Box>
      <Box>
        <Typography fontSize={14} fontWeight={700} color="#0f172a" sx={{ mb: 0.2 }}>{label}</Typography>
        <Typography fontSize={13} fontWeight={500} color="#64748b">
          {value || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>निर्दिष्ट नहीं</span>}
        </Typography>
      </Box>
    </Box>
  );

  const StatBox = ({ label, value }) => (
    <Box sx={{
      px: 0.5,
      py: 2.5,
      height: "100%",
      bgcolor: "white",
      borderRadius: { xs: "12px", sm: "16px", md: "20px" },
      border: "1px solid rgba(30, 79, 163, 0.15)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
    }}>
      <Typography fontSize={{ xs: 13, xl: 14 }} fontWeight={700} color="#475569" sx={{ mb: 0.5, textAlign: "center", lineHeight: 1.3 }}>{label}</Typography>
      <Typography fontSize={{ xs: 16, xl: 18 }} fontWeight={900} color="#0056b3" sx={{ textAlign: "center", mt: 0.5 }}>{value}</Typography>
    </Box>
  );

  const PerformanceBar = ({ label, value, color }) => (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, alignItems: "center" }}>
        <Typography fontSize={13} fontWeight={600} color="#334155">{label}</Typography>
        <Typography fontSize={13} fontWeight={700} color="#0f172a">{value}</Typography>
      </Box>
      <Box sx={{ height: 6, bgcolor: "#f1f5f9", borderRadius: "12px", overflow: "hidden" }}>
        <Box sx={{ height: "100%", width: `${(value / 200) * 100}%`, bgcolor: color, borderRadius: "12px" }} />
      </Box>
    </Box>
  );



  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 64px)" }}>
        <Loader fullPage />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3, textAlign: "center", minHeight: "calc(100vh - 64px)" }}>
        <Typography color="error" variant="h6">प्रोफ़ाइल जानकारी लोड करने में असमर्थ</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        position: "relative",
        background: `radial-gradient(at 0% 0%, rgba(30, 79, 163, 0.45) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.3) 0, transparent 50%), radial-gradient(at 80% 90%, #28a74526 0, transparent 50%), radial-gradient(at 20% 80%, rgba(30, 79, 163, 0.2) 0, transparent 50%), #ffffff`,
        backgroundAttachment: "fixed",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: { 
          xs: 2, 
          sm: 3, 
          md: 4, 
          lg: "min(max(32px, calc((100% - 1200px) / 2)), 64px)" 
        },
        pb: { 
          xs: 2, 
          sm: 3, 
          md: 4, 
          lg: "min(max(32px, calc((100% - 1200px) / 2)), 64px)" 
        },
        px: { xs: 2, sm: 3, md: 4 },
        "& .MuiTypography-root, & .MuiButton-root, & .MuiChip-root": {
          fontFamily: "inherit !important"
        }
      }}
    >
      {/* Decorative Blur Element for depth */}
      <Box
        sx={{
          position: "absolute",
          width: "40vw",
          height: "40vw",
          top: "-10%",
          left: "-10%",
          background: "rgba(30, 79, 163, 0.1)",
          filter: "blur(100px)",
          borderRadius: "50%",
          zIndex: 0
        }}
      />

      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{ width: "100%", maxWidth: "1200px", zIndex: 1 }}
      >
        {/* Main Hiredrop-Style Header Card */}
        <Paper
          component={motion.div}
          variants={itemVariants}
          elevation={0}
          sx={{
            borderRadius: { xs: "16px", sm: "20px", md: "24px" },

            background: "rgba(255, 255, 255, 0.75)", border: "1px solid #0056b3",
            backdropFilter: "blur(20px)",
            overflow: "hidden",
            mb: { xs: 2, sm: 3, md: 4 }
          }}
        >
          {/* Cover Banner with premium generated mesh */}
          {/* Cover Banner */}
            <Box
              sx={{
                height: "200px",
                position: "relative",
                overflow: "hidden",
                bgcolor: "#0056b3",
                backgroundImage: profile.banner_url ? `url(${profile.banner_url})` : `
                  radial-gradient(at 0% 0%, rgba(30, 79, 163, 0.9) 0, transparent 50%), 
                  radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.8) 0, transparent 50%),
                  linear-gradient(135deg, #0056b3 0%, #0f172a 100%)
                `,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat"
              }}
            >
            {/* Hidden Input */}
            <input
              type="file"
              ref={bannerInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files[0], "banner")}
            />

            {/* Banner Edit Overlay */}
            <Box
              onClick={() => bannerInputRef.current?.click()}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                bgcolor: "rgba(255,255,255,0.9)",
                borderRadius: "50%",
                p: 1.5,
                cursor: "pointer",
                "&:hover": { bgcolor: "#ffffff", transform: "scale(1.05)" },
                transition: "all 0.2s ease",
                display: "flex",
                zIndex: 5
              }}
            >
              {uploading.banner ? (
                <Loader mini />
              ) : (
                <EditOutlinedIcon fontSize="small" sx={{ color: "#0056b3" }} />
              )}
            </Box>
          </Box>

          <Box sx={{ px: { xs: 2, sm: 4, md: 5 }, pb: { xs: 3, sm: 4, md: 5 }, position: "relative" }}>
            
            {/* Top Section: Avatar & Action Buttons */}
            <Box sx={{ 
              display: "flex", 
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between", 
              alignItems: { xs: "center", sm: "flex-end" }, 
              mt: { xs: -7, sm: -8 }, 
              mb: { xs: 2.5, sm: 2 },
              gap: { xs: 2, sm: 2 }
            }}>
              
              {/* Avatar Box */}
              <Box sx={{ position: "relative", zIndex: 2 }}>
                <Avatar
                  sx={{
                    width: { xs: 120, sm: 130, md: 150 },
                    height: { xs: 120, sm: 130, md: 150 },
                    background: "linear-gradient(135deg, #0056b3 0%, #0056b3 100%)",
                    color: "#ffffff",
                    fontSize: { xs: 44, md: 56 },
                    fontWeight: 900,
                    border: "4px solid #ffffff",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
                    "& img": { objectFit: "cover" }
                  }}
                  src={profile.profile_pic_url}
                >
                  {!profile.profile_pic_url && (profile.full_name?.charAt(0).toUpperCase() || profile.username?.charAt(0).toUpperCase() || "यू")}
                </Avatar>

                {/* Avatar Edit Overlay */}
                <Box
                  onClick={() => profileInputRef.current?.click()}
                  sx={{
                    position: "absolute",
                    bottom: 6,
                    right: 6,
                    bgcolor: "white",
                    borderRadius: "50%",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    p: 1.2,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#f8fafc", transform: "scale(1.05)" },
                    display: "flex",
                    transition: "all 0.2s"
                  }}
                >
                  {uploading.profile ? (
                    <Loader mini />
                  ) : (
                    <EditOutlinedIcon sx={{ fontSize: 18, color: "#0056b3" }} />
                  )}
                </Box>
                <input type="file" ref={profileInputRef} style={{ display: "none" }} accept="image/*" onChange={(e) => handleUpload(e.target.files[0], "profile")} />
              </Box>

              {/* Actions & Social Icons */}
              <Box sx={{ 
                display: "flex", 
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center", 
                gap: 2, 
                width: { xs: "100%", sm: "auto" }
              }}>
                {/* Social Media Icons */}
                {profile.social_links && Object.values(profile.social_links).some(v => v) && (
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
                    {profile.social_links.linkedin && (
                      <IconButton size="small" component="a" href={profile.social_links.linkedin} target="_blank"
                        sx={{ color: "#0077b5", bgcolor: "rgba(0,119,181,0.07)", border: "1px solid rgba(0,119,181,0.15)", "&:hover": { bgcolor: "rgba(0,119,181,0.15)" } }}>
                        <LinkedInIcon fontSize="small" />
                      </IconButton>
                    )}
                    {profile.social_links.github && (
                      <IconButton size="small" component="a" href={profile.social_links.github} target="_blank"
                        sx={{ color: "#333", bgcolor: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.1)", "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>
                        <GitHubIcon fontSize="small" />
                      </IconButton>
                    )}
                    {profile.social_links.twitter && (
                      <IconButton size="small" component="a" href={profile.social_links.twitter} target="_blank"
                        sx={{ color: "#1DA1F2", bgcolor: "rgba(29,161,242,0.07)", border: "1px solid rgba(29,161,242,0.15)", "&:hover": { bgcolor: "rgba(29,161,242,0.15)" } }}>
                        <TwitterIcon fontSize="small" />
                      </IconButton>
                    )}
                    {profile.social_links.instagram && (
                      <IconButton size="small" component="a" href={profile.social_links.instagram} target="_blank"
                        sx={{ color: "#E4405F", bgcolor: "rgba(228,64,95,0.07)", border: "1px solid rgba(228,64,95,0.15)", "&:hover": { bgcolor: "rgba(228,64,95,0.15)" } }}>
                        <InstagramIcon fontSize="small" />
                      </IconButton>
                    )}
                    {/* Vertical Divider for desktop */}
                    <Box sx={{ display: { xs: "none", sm: "block" }, width: "1px", height: 24, bgcolor: "rgba(0,0,0,0.1)", mx: 1 }} />
                  </Box>
                )}

                {/* Buttons Component */}
                <Box sx={{ display: "flex", gap: 1.5, width: { xs: "100%", sm: "auto" }, justifyContent: "center" }}>
                  <Button
                    variant="outlined"
                    onClick={() => setUpdateModalOpen(true)}
                    sx={{
                      color: "#0056b3", borderColor: "rgba(30, 79, 163, 0.5)",
                      "&:hover": { bgcolor: "rgba(30, 79, 163, 0.05)", borderColor: "#0056b3" },
                      textTransform: "none", borderRadius: "8px", fontWeight: 700,
                      px: { xs: 2, sm: 2.5 }, py: 1, flex: { xs: 1, sm: "initial" },
                      fontSize: { xs: 14, sm: 14 },
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                    }}
                  >
                    <EditOutlinedIcon sx={{ fontSize: 20, mr: 1 }} />
                    प्रोफ़ाइल अपडेट
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      const url = `${window.location.origin}/profile/${profile.username}`;
                      navigator.clipboard.writeText(url);
                      alert("Public profile link copied to clipboard!");
                    }}
                    sx={{ 
                      color: "#0056b3", borderColor: "rgba(30, 79, 163, 0.5)",
                      "&:hover": { bgcolor: "rgba(30, 79, 163, 0.05)", borderColor: "#0056b3" },
                      textTransform: "none", borderRadius: "8px", fontWeight: 700, 
                      px: { xs: 2, sm: 2.5 }, py: 1,
                      flex: { xs: 1, sm: "initial" },
                      fontSize: { xs: 14, sm: 14 },
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                    }}
                  >
                    <ShareIcon sx={{ fontSize: 20, mr: 1 }} />
                    साझा करें
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Profile Info Row: Name & Bio */}
            <Box sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: { xs: "center", sm: "flex-start" }, 
              textAlign: { xs: "center", sm: "left" },
              mt: { xs: 0.5, sm: 0 },
              px: { xs: 1, sm: 0 }
            }}>
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: { xs: "center", sm: "flex-start" }, gap: 1, width: "100%", mb: 0.5 }}>
                <Typography 
                  variant="h4" 
                  fontWeight={900} 
                  color="#0f172a" 
                  sx={{ 
                    letterSpacing: "-0.5px",
                    fontSize: { xs: "1.75rem", sm: "2rem", md: "2.125rem" },
                    lineHeight: 1.5, py: 0.5,
                    display: "flex",
                    alignItems: "baseline",
                    flexWrap: "wrap",
                    gap: 1
                  }}
                >
                  {profile.full_name || profile.username}
                  <Box component="span" sx={{ fontSize: "0.55em", fontWeight: 700, color: "#64748b", letterSpacing: "normal" }}>
                    ({profile.role || "छात्र"})
                  </Box>
                </Typography>
                {profile.kyc_status === "verified" ? (
                  <Chip 
                    icon={<VerifiedIcon sx={{ fontSize: 18 }} />} 
                    label="Verified" 
                    size="small"
                    sx={{ bgcolor: "rgba(16, 185, 129, 0.1)", color: "#28a745", fontWeight: 700, borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.2)" }} 
                  />
                ) : (
                  <Button 
                    size="small"
                    onClick={() => setKycModalOpen(true)}
                    startIcon={<ShieldOutlinedIcon />}
                    sx={{ 
                      bgcolor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", 
                      fontWeight: 700, borderRadius: "8px", px: { xs: 1.5, sm: 2 },
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      "&:hover": { bgcolor: "rgba(245, 158, 11, 0.2)" },
                      textTransform: "none",
                      fontSize: { xs: "0.75rem", sm: "0.8125rem" }
                    }}
                  >
                    अभी सत्यापित करें (Verify Now)
                  </Button>
                )}
              </Box>

              <Box sx={{ width: "100%", mt: { xs: 1.5, sm: 1 } }}>
                <Typography 
                  fontSize={{ xs: 14, sm: 15 }} 
                  color="#475569" 
                  sx={{ 
                    lineHeight: 1.6, 
                    fontWeight: 500, 
                    maxWidth: "800px",
                    mx: { xs: "auto", sm: 0 },
                    textAlign: "left"
                  }}
                >
                  {profile.bio || "कोई विवरण उपलब्ध नहीं है। (No description available.)"}
                </Typography>
              </Box>
            </Box>

          </Box>
        </Paper>

        {/* Two Column Flex Layout */}
        <Box sx={{ display: "flex", gap: { xs: 2, sm: 3, md: 4 }, alignItems: "flex-start", flexWrap: { xs: "wrap", md: "nowrap" }, mt: { xs: 2, sm: 3, md: 4 } }}>

          {/* Left Column: Personal Details + Analytics */}
          <Box sx={{ flex: { xs: "1 1 100%", md: 7 }, minWidth: 0, display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3, md: 4 } }}>


            {/* Skills & Recognition Section */}
            {( (profile.skills && profile.skills.length > 0) || (profile.recognitions && profile.recognitions.length > 0) ) && (
              <ResponsiveSection 
                isMobile={isMobile}
                title="कौशल और उपलब्धियां (Skills & Achievements)"
              >
                <Grid container spacing={4}>
                  {profile.skills && profile.skills.length > 0 && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#0056b3" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                        <StarIcon sx={{ fontSize: 18 }} /> कौशल (Skills)
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {profile.skills.map((skill, i) => (
                          <Chip 
                            key={i} 
                            label={skill} 
                            size="small" 
                            sx={{ 
                              borderRadius: "8px", fontWeight: 700, bgcolor: "rgba(15, 23, 42, 0.05)", color: "#334155",
                              border: "1px solid rgba(15, 23, 42, 0.1)",
                              "&:hover": { bgcolor: "rgba(15, 23, 42, 0.08)" }
                            }} 
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
                  {profile.recognitions && profile.recognitions.length > 0 && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#f59e0b" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                        <EmojiEventsOutlinedIcon sx={{ fontSize: 18 }} /> पहचान (Recognitions)
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {profile.recognitions.map((rec, i) => (
                          <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#f59e0b", mt: 1.2 }} />
                            <Typography fontSize={14} fontWeight={600} color="#475569">{rec}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </ResponsiveSection>
            )}



            {/* Consolidated Analytics Sidebar */}
            <ResponsiveSection
              isMobile={isMobile}
              title="रेटिंग (Rating)"
            >
              <Box sx={{ textAlign: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2.5, mb: 3 }}>
                  <Typography variant="h1" fontWeight={700} color="#28a745" sx={{ fontSize: "64px", letterSpacing: "-2px", lineHeight: 1 }}>1450</Typography>
                  <Typography fontSize={14} fontWeight={800} color="#0056b3" sx={{ bgcolor: "#f0f6ff", border: "1px solid rgba(30, 79, 163, 0.2)", px: 2, py: 1, borderRadius: "12px", display: "inline-flex", alignItems: "center" }}>विशेषज्ञ (Specialist)</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between", overflowX: "auto", pb: 2, "&::-webkit-scrollbar": { height: "6px" }, "&::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.02)", borderRadius: "8px" }, "&::-webkit-scrollbar-thumb": { background: "rgba(30, 79, 163, 0.15)", borderRadius: "8px" }, "& > div": { flex: "1 0 auto", minWidth: "115px" } }}>
                  <StatBox label="कुल कोर्स" value="12 कोर्स" />
                  <StatBox label="पूर्ण बैच" value="5 बैच" />
                  <StatBox label="सक्रिय प्रोजेक्ट" value="4 प्रोजेक्ट" />
                  <StatBox label="कुल अंक" value="7,420" />
                </Box>
              </Box>
            </ResponsiveSection>

          </Box>

          {/* Right Column: Resources */}
          <Box sx={{ flex: { xs: "1 1 100%", md: 5 }, minWidth: 0 }}>
            <ResponsiveSection
              isMobile={isMobile}
              title="संसाधन (Resources)"
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { icon: EmojiEventsOutlinedIcon, text: "उत्कृष्टता तालिका", color: "#f59e0b", path: "/dashboard/leaderboard" },
                  { icon: TrendingUpOutlinedIcon, text: "आपकी प्रगति", color: "#28a745", path: "/dashboard/progress" },
                  { icon: CardMembershipOutlinedIcon, text: "आपके प्रमाण-पत्र", color: "#f97316", path: "/dashboard/certificate" },
                  { icon: BookmarkBorderOutlinedIcon, text: "सुरक्षित सामग्री", color: "#ef4444", path: "/dashboard/saved-content" },
                  { icon: FlagOutlinedIcon, text: "प्रतियोगिता", color: "#64748b", path: "/dashboard/competition" },
                  { icon: AssessmentOutlinedIcon, text: "परिणाम", color: "#0056b3", path: "/dashboard/results" },
                  { icon: GroupsOutlinedIcon, text: "संगोष्ठी", color: "#6366f1", path: "/dashboard/forum" },
                  { icon: HistoryOutlinedIcon, text: "इतिहास", color: "#a855f7", path: "/dashboard/saved-content" },
                  { icon: TimelineOutlinedIcon, text: "क्रमबद्धता", color: "#f97316", path: "/dashboard/ranking" }
                ].map((item, index) => (
                  <Link key={index} href={item.path} passHref style={{ textDecoration: "none", display: "block", width: "100%" }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: "16px",
                        background: "rgba(30, 79, 163, 0.04)",
                        border: "1px solid transparent",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 2.5,
                        cursor: "pointer",
                        "&:hover": { background: "rgba(30, 79, 163, 0.08)" }
                      }}
                    >
                      <item.icon sx={{ color: item.color, fontSize: 24 }} />
                      <Typography fontSize={15} fontWeight={700} color="#334155">{item.text}</Typography>
                    </Paper>
                  </Link>
                ))}
              </Box>
            </ResponsiveSection>
          </Box>

        </Box>
      </Box>

      {/* KYC Modal */}
      {profile && (
        <KycVerificationModal 
          open={isKycModalOpen} 
          onClose={() => setKycModalOpen(false)} 
          userId={profile.id}
          onSuccess={() => {
            // Optimistically update the UI to show verified
            setProfile(prev => ({ ...prev, kyc_status: "verified" }));
          }}
        />
      )}

      {profile && (
        <ProfileUpdateModal
          open={isUpdateModalOpen}
          onClose={() => setUpdateModalOpen(false)}
          profile={profile}
          onSuccess={fetchProfile}
        />
      )}
    </Box>
  );
}