"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Avatar, Button, Chip, Accordion, AccordionSummary, AccordionDetails, useTheme, useMediaQuery, IconButton, TextField, Grid, Container, Skeleton } from "@mui/material";
import { motion, useScroll, useTransform } from "framer-motion";
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
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import TwitterIcon from "@mui/icons-material/Twitter";
import KycVerificationModal from "./components/KycVerificationModal";
import ProfileUpdateModal from "./components/ProfileUpdateModal";
import ProfileSkeleton from "./ProfileSkeleton";
import PremiumCard from "../../components/ui/PremiumCard";

const getRoleConfig = (role) => {
  const r = (role || 'student').toLowerCase();

  if (r === 'institute' || r === 'organisation') {
    return {
      tabs: [
        { id: "overview", label: "Overview" },
        { id: "institutes", label: "My Institutes" },
        { id: "activity", label: "Activity" }
      ],
      sidebarPrimary: "Expertise / Roles:",
      sidebarSecondary: "Recognitions:",
      statsHeading: "एडमिन आँकड़े",
      metrics: [
        { icon: BusinessCenterOutlinedIcon, title: "1 संस्थान", subtitle: "प्रबंधित" },
        { icon: VerifiedUserOutlinedIcon, title: "एडमिन प्रोफाइल", subtitle: "भूमिका" },
        { icon: TimelineOutlinedIcon, title: "सक्रिय", subtitle: "स्थिति" },
        { icon: ShieldOutlinedIcon, title: "पूर्ण नियंत्रण", subtitle: "अधिकार" }
      ]
    };
  }

  if (r === 'teacher' || r === 'educator') {
    return {
      tabs: [
        { id: "overview", label: "Overview" },
        { id: "my_courses", label: "My Courses" },
        { id: "reviews", label: "Reviews" },
        { id: "activity", label: "Activity" }
      ],
      sidebarPrimary: "Subjects/Expertise:",
      sidebarSecondary: "Qualifications:",
      statsHeading: "शिक्षण आँकड़े",
      metrics: [
        { icon: LibraryBooksOutlinedIcon, title: "18 कुल कोर्स", subtitle: "प्रकाशित कोर्स" },
        { icon: GroupsOutlinedIcon, title: "4,500 कुल छात्र", subtitle: "पढ़ाए गए छात्र" },
        { icon: StarOutlineOutlinedIcon, title: "4.8 औसत रेटिंग", subtitle: "छात्रों द्वारा" },
        { icon: AccessTimeOutlinedIcon, title: "850 शिक्षण घंटे", subtitle: "कुल कंटेंट" }
      ]
    };
  }

  // Default: student
  return {
    tabs: [
      { id: "overview", label: "Overview" },
      { id: "courses", label: "Courses" },
      { id: "achievements", label: "Achievements" },
      { id: "activity", label: "Activity" }
    ],
    sidebarPrimary: "Expert in:",
    sidebarSecondary: "Recognitions:",
    statsHeading: "सीखने के आँकड़े",
    metrics: [
      { icon: LibraryBooksOutlinedIcon, title: "12 नामांकित कोर्स", subtitle: "सक्रिय पाठ्यक्रम" },
      { icon: CheckCircleOutlineOutlinedIcon, title: "8 पूर्ण कोर्स", subtitle: "100% सफलता दर" },
      { icon: AccessTimeOutlinedIcon, title: "240 सीखने के घंटे", subtitle: "पिछले 30 दिनों में" },
      { icon: StarOutlineOutlinedIcon, title: "7,420 कुल अंक", subtitle: "शीर्ष 5% छात्रों में" },
      { icon: TrendingUpOutlinedIcon, title: "1450 ग्लोबल रेटिंग", subtitle: "विशेषज्ञ स्तर" },
      { icon: CardMembershipOutlinedIcon, title: "15 प्रमाणपत्र", subtitle: "सत्यापित प्रमाणपत्र" }
    ]
  };
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isKycModalOpen, setKycModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [uploading, setUploading] = useState({ profile: false, banner: false });
  const profileInputRef = React.useRef(null);
  const bannerInputRef = React.useRef(null);
  const bannerWrapperRef = React.useRef(null);
  const sidebarRef = React.useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  React.useEffect(() => {
    let frameId;

    const updateParallax = () => {
      if (bannerWrapperRef.current) {
        const bgElement = bannerWrapperRef.current.querySelector('.parallax-bg');
        const rect = bannerWrapperRef.current.getBoundingClientRect();
        const currentTop = rect.top;

        // Normal rect.top without scroll is roughly 72 (from DashboardLayout pt: 9).
        if (bgElement) {
          const bannerOffset = (72 - currentTop) * 0.4;
          // Apply a subtle rubber-band expansion effect when scrolling past top
          const scale = currentTop > 72 ? 1 + ((currentTop - 72) * 0.001) : 1;

          bgElement.style.transform = `translate3d(0, ${bannerOffset}px, 0) scale(${scale})`;
        }

        if (sidebarRef.current) {
          if (window.innerWidth >= 600) {
            // Because wrapper mt is 0, rect.top starts at 72.
            const rawScrollAmount = 72 - rect.top;

            // Left sidebar has mt: -12 (-96px), Right content tabs have pt: 4 (32px) on desktop
            // Left sidebar has mt: -8 (-64px), Right content tabs have pt: 3 (24px) on tablet
            const isDesktop = window.innerWidth >= 900;
            const mtOffset = isDesktop ? 96 : 64;
            const rightPadding = isDesktop ? 32 : 24;
            const cap = mtOffset + rightPadding;

            // Apply a smooth wait delay until right content catches up.
            // (We fix the scroll cut-off by adding mb to the sidebar box below).
            const sidebarOffset = Math.max(0, Math.min(rawScrollAmount, cap));
            sidebarRef.current.style.transform = `translate3d(0, ${sidebarOffset}px, 0)`;
          } else {
            sidebarRef.current.style.transform = `translate3d(0, 0, 0)`;
          }
        }
      }
      frameId = requestAnimationFrame(updateParallax);
    };
    frameId = requestAnimationFrame(updateParallax);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Removed broken window.scroll listener; Auto-scroll is now handled in the requestAnimationFrame loop.

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

  const config = profile ? getRoleConfig(profile.role) : getRoleConfig('student');

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpload = async (file, type) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      const { data } = await apiClient.get(`/s3/sign`, {
        params: {
          user_id: profile.id,
          type: type,
          mime: file.type
        }
      });

      await fetch(data.upload_url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type
        }
      });

      const endpoint = type === "profile" ? "/user/profile/update-pic" : "/user/profile/update-banner";
      await apiClient.post(endpoint, {
        user_id: profile.id,
        url: data.file_url
      });

      await fetchProfile();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const StatBox = ({ label, value }) => (
    <Box sx={{
      px: 0.5,
      py: 2.5,
      height: "var(--size-full)",
      bgcolor: "white",
      borderRadius: { xs: "12px", sm: "16px", md: "20px" },
      border: "var(--border-thin) solid rgba(30, 79, 163, 0.15)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <Typography fontSize={{ xs: 13, xl: 14 }} fontWeight={700} color="var(--color-slate-500)" sx={{ mb: 0.5, textAlign: "center", lineHeight: 1.3 }}>{label}</Typography>
      <Typography fontSize={{ xs: 16, xl: 18 }} fontWeight={900} color="var(--color-primary)" sx={{ textAlign: "center", mt: 0.5 }}>{value}</Typography>
    </Box>
  );

  if (loading || !profile) {
    return <ProfileSkeleton />;
  }

  return (
    <Box sx={{ height: "calc(100vh - 72px)", overflow: "hidden", display: "flex" }}>

      {/* LEFT SIDEBAR — independently scrollable */}
      <Box sx={{
        width: { xs: '100%', sm: 420, md: 480 },
        flexShrink: 0,
        overflowY: "auto",
        height: "100%",
        display: { xs: 'none', sm: 'block' },
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        pl: { sm: 2, md: 4, lg: 6 },
        pr: { sm: 2, md: 3, lg: 4 },
        py: { sm: 3, md: 4 },
      }}>
        <Box ref={sidebarRef} sx={{ width: "var(--size-full)" }}>

              {/* Profile Card */}
              <PremiumCard variant="profile" sx={{ pt: 0, pb: 4, px: 4, textAlign: "left", overflow: "hidden" }}>

                {/* Banner Area */}
                <Box sx={{
                  height: 120,
                  mx: -4,
                  mb: 0,
                  backgroundImage: profile.banner_url ? `url(${profile.banner_url})` : "linear-gradient(135deg, #0056b3 0%, #0056b3 100%)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative"
                }}>
                  <Box onClick={() => bannerInputRef.current?.click()} sx={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255, 255, 255, 0.3)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "var(--border-thin) solid rgba(255, 255, 255, 0.6)", borderRadius: 'var(--radius-full)', cursor: "pointer", zIndex: 3, "&:hover": { background: "rgba(255, 255, 255, 0.5)", transform: "scale(1.05)" }, transition: "all 0.2s" }}>
                    {uploading.banner ? null : <EditOutlinedIcon sx={{ fontSize: 16, color: "var(--color-slate-900)" }} />}
                  </Box>
                  <input type="file" ref={bannerInputRef} style={{ display: "none" }} accept="image/*" onChange={(e) => handleUpload(e.target.files[0], "banner")} />
                </Box>

                {/* Avatar and Action Button Row */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: -5, mb: 3 }}>

                  {/* Avatar */}
                  <Box sx={{ position: "relative", display: "inline-block", p: 0.5, bgcolor: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(10px)", borderRadius: 'var(--radius-full)', zIndex: 2 }}>
                    <Avatar
                      sx={{
                        width: 100, height: 100, position: "relative", zIndex: 2,
                        background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)", color: "var(--color-white)",
                        fontSize: 36, fontWeight: 900,
                        border: "none",
                        "& img": { objectFit: "cover" }
                      }}
                      src={profile.profile_pic_url}
                    >
                      {!profile.profile_pic_url && (profile.full_name?.charAt(0).toUpperCase() || profile.username?.charAt(0).toUpperCase() || "यू")}
                    </Avatar>
                    <Box onClick={() => profileInputRef.current?.click()} sx={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255, 255, 255, 0.3)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "var(--border-thin) solid rgba(255, 255, 255, 0.6)", borderRadius: 'var(--radius-full)', cursor: "pointer", zIndex: 3, "&:hover": { background: "rgba(255, 255, 255, 0.5)", transform: "scale(1.05)" }, transition: "all 0.2s" }}>
                      {uploading.profile ? null : <EditOutlinedIcon sx={{ fontSize: 14, color: "var(--color-slate-900)" }} />}
                    </Box>
                    <input type="file" ref={profileInputRef} style={{ display: "none" }} accept="image/*" onChange={(e) => handleUpload(e.target.files[0], "profile")} />
                  </Box>

                  {/* Verify Button */}
                  <Box sx={{ pb: 1, zIndex: 2 }}>
                    {profile.kyc_status === "verified" ? (
                      <Button variant="contained" size="small" disabled sx={{ borderRadius: 'var(--radius-lg)', px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 'var(--font-medium)', fontSize: 'var(--font-sm)', background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%) !important", color: "white !important", whiteSpace: 'nowrap', minWidth: 0 }}>
                        सत्यापित
                      </Button>
                    ) : (
                      <Button variant="contained" size="small" startIcon={<VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} />} onClick={() => setKycModalOpen(true)} sx={{ background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', whiteSpace: 'nowrap', minWidth: 0 }}>
                        सत्यापित करें
                      </Button>
                    )}
                  </Box>
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', mb: 0.5, fontSize: '1.4rem', textTransform: 'capitalize' }}>
                  {profile.full_name || profile.username}
                </Typography>
                <Typography variant="body1" sx={{ color: 'var(--color-slate-700)', fontWeight: 'var(--font-medium)', mb: 0.5, fontSize: 'var(--font-base)', textTransform: 'capitalize' }}>
                  {profile.role === 'institute' || profile.role === 'organisation' ? 'Admin' : (profile.role || "Owner and Principal at Nasim Management")}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', mb: 2, fontSize: 'var(--font-sm)', textTransform: 'capitalize' }}>
                  {profile.location || "Toronto, Ontario, Canada"}
                </Typography>
              </PremiumCard>

              {/* Skills/Expertise Card */}
              {((profile.skills && profile.skills.length > 0) || (profile.recognitions && profile.recognitions.length > 0) || true) && (
                <PremiumCard variant="profile" sx={{ p: { xs: 2.5, sm: 4 }, mt: 3 }}>
                  <Box sx={{ mb: profile.recognitions && profile.recognitions.length > 0 ? 4 : 0 }}>
                    <Typography variant="subtitle1" fontWeight={500} color="var(--color-slate-900)" sx={{ mb: 2.5 }}>
                      {config.sidebarPrimary}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                      {(profile.skills && profile.skills.length > 0 ? profile.skills : (
                        (profile.role === 'institute' || profile.role === 'organisation')
                          ? ["Administration", "Leadership", "Management", "Operations", "Strategy"]
                          : ["Capital Raising", "Marketing & Sales", "Consulting", "Asset Management", "Business Development"]
                      )).map((skill, i) => (
                      <Chip key={i} label={skill} sx={{ borderRadius: 'var(--radius-lg)', fontWeight: 'var(--font-regular)', bgcolor: "var(--card-inner-bg)", color: "var(--color-slate-900)", border: "var(--border-thin) solid var(--card-inner-border)", px: 1, fontSize: 'var(--font-sm)', backdropFilter: "var(--card-blur)", transition: "var(--transition-slow)", '&:hover': { transform: 'translateY(-2px)' } }} />
                      ))}
                    </Box>
                  </Box>
                  {profile.recognitions && profile.recognitions.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight={500} color="var(--color-slate-900)" sx={{ mb: 2.5 }}>
                        {config.sidebarSecondary}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                        {profile.recognitions.map((rec, i) => (
                          <Chip key={i} label={rec} icon={<EmojiEventsOutlinedIcon sx={{ color: 'var(--color-slate-500)' }} />} sx={{ borderRadius: 'var(--radius-lg)', fontWeight: 'var(--font-regular)', bgcolor: "var(--card-inner-bg)", color: "var(--color-slate-900)", border: "var(--border-thin) solid var(--card-inner-border)", px: 1, py: 2.5, fontSize: 'var(--font-sm)', backdropFilter: "var(--card-blur)", transition: "var(--transition-slow)", '&:hover': { transform: 'translateY(-2px)' } }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                </PremiumCard>
              )}

        </Box>
      </Box>

      {/* RIGHT MAIN CONTENT — independently scrollable */}
      <Box sx={{
        flexGrow: 1,
        display: { xs: 'block', sm: 'flex' },
        flexDirection: 'column',
        height: "100%",
        overflowY: { xs: 'auto', sm: 'hidden' },
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        pl: { xs: 2, md: 3, lg: 4 },
        pr: { xs: 2, md: 4, lg: 6 },
        pt: { xs: 3, md: 4 },
        pb: { xs: 4, sm: 0 },
      }}>
        {/* Mobile: show sidebar cards inline — single scroll with rest of page */}
        <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 3 }}>

          {/* Profile Card */}
          <PremiumCard variant="profile" sx={{ pt: 0, pb: 4, px: 4, textAlign: "left", overflow: "hidden", mb: 3 }}>

            {/* Banner Area */}
            <Box sx={{
              height: 120,
              mx: -4,
              mb: 0,
              backgroundImage: profile.banner_url ? `url(${profile.banner_url})` : "linear-gradient(135deg, #0056b3 0%, #0056b3 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative"
            }}>
              <Box onClick={() => bannerInputRef.current?.click()} sx={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255, 255, 255, 0.3)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "var(--border-thin) solid rgba(255, 255, 255, 0.6)", borderRadius: 'var(--radius-full)', cursor: "pointer", zIndex: 3, "&:hover": { background: "rgba(255, 255, 255, 0.5)", transform: "scale(1.05)" }, transition: "all 0.2s" }}>
                {uploading.banner ? null : <EditOutlinedIcon sx={{ fontSize: 16, color: "var(--color-slate-900)" }} />}
              </Box>
              <input type="file" ref={bannerInputRef} style={{ display: "none" }} accept="image/*" onChange={(e) => handleUpload(e.target.files[0], "banner")} />
            </Box>

            {/* Avatar and Action Button Row */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: -5, mb: 3 }}>

              {/* Avatar */}
              <Box sx={{ position: "relative", display: "inline-block", p: 0.5, bgcolor: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(10px)", borderRadius: 'var(--radius-full)', zIndex: 2 }}>
                <Avatar
                  sx={{
                    width: 100, height: 100, position: "relative", zIndex: 2,
                    background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)", color: "var(--color-white)",
                    fontSize: 36, fontWeight: 900,
                    border: "none",
                    "& img": { objectFit: "cover" }
                  }}
                  src={profile.profile_pic_url}
                >
                  {!profile.profile_pic_url && (profile.full_name?.charAt(0).toUpperCase() || profile.username?.charAt(0).toUpperCase() || "यू")}
                </Avatar>
                <Box onClick={() => profileInputRef.current?.click()} sx={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255, 255, 255, 0.3)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "var(--border-thin) solid rgba(255, 255, 255, 0.6)", borderRadius: 'var(--radius-full)', cursor: "pointer", zIndex: 3, "&:hover": { background: "rgba(255, 255, 255, 0.5)", transform: "scale(1.05)" }, transition: "all 0.2s" }}>
                  {uploading.profile ? null : <EditOutlinedIcon sx={{ fontSize: 14, color: "var(--color-slate-900)" }} />}
                </Box>
                <input type="file" ref={profileInputRef} style={{ display: "none" }} accept="image/*" onChange={(e) => handleUpload(e.target.files[0], "profile")} />
              </Box>

              {/* Verify Button */}
              <Box sx={{ pb: 1, zIndex: 2, alignSelf: 'flex-end', display: 'flex', alignItems: 'flex-end' }}>
                {profile.kyc_status === "verified" ? (
                  <Button variant="contained" size="small" disabled sx={{ borderRadius: 'var(--radius-lg)', px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 'var(--font-medium)', fontSize: 'var(--font-sm)', background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%) !important", color: "white !important", whiteSpace: 'nowrap', minWidth: 0 }}>
                    सत्यापित
                  </Button>
                ) : (
                  <Button variant="contained" size="small" startIcon={<VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} />} onClick={() => setKycModalOpen(true)} sx={{ background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', whiteSpace: 'nowrap', minWidth: 0 }}>
                    सत्यापित करें
                  </Button>
                )}
              </Box>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', mb: 0.5, fontSize: '1.4rem', textTransform: 'capitalize' }}>
              {profile.full_name || profile.username}
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--color-slate-700)', fontWeight: 'var(--font-medium)', mb: 0.5, fontSize: 'var(--font-base)', textTransform: 'capitalize' }}>
              {profile.role === 'institute' || profile.role === 'organisation' ? 'Admin' : (profile.role || "Owner and Principal at Nasim Management")}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', mb: 2, fontSize: 'var(--font-sm)', textTransform: 'capitalize' }}>
              {profile.location || "Toronto, Ontario, Canada"}
            </Typography>
          </PremiumCard>

          {/* Skills/Expertise Card (Mobile) */}
          {((profile.skills && profile.skills.length > 0) || (profile.recognitions && profile.recognitions.length > 0) || true) && (
            <PremiumCard variant="profile" sx={{ p: { xs: 2.5, sm: 4 }, mb: 3 }}>
              <Box sx={{ mb: profile.recognitions && profile.recognitions.length > 0 ? 4 : 0 }}>
                <Typography variant="subtitle1" fontWeight={500} color="var(--color-slate-900)" sx={{ mb: 2.5 }}>
                  {config.sidebarPrimary}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                  {(profile.skills && profile.skills.length > 0 ? profile.skills : (
                    (profile.role === 'institute' || profile.role === 'organisation')
                      ? ["Administration", "Leadership", "Management", "Operations", "Strategy"]
                      : ["Capital Raising", "Marketing & Sales", "Consulting", "Asset Management", "Business Development"]
                  )).map((skill, i) => (
                    <Chip key={i} label={skill} sx={{ borderRadius: 'var(--radius-lg)', fontWeight: 'var(--font-regular)', bgcolor: "var(--card-inner-bg)", color: "var(--color-slate-900)", border: "var(--border-thin) solid var(--card-inner-border)", px: 1, fontSize: 'var(--font-sm)', backdropFilter: "var(--card-blur)", transition: "var(--transition-slow)", '&:hover': { transform: 'translateY(-2px)' } }} />
                  ))}
                </Box>
              </Box>
              {profile.recognitions && profile.recognitions.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={500} color="var(--color-slate-900)" sx={{ mb: 2.5 }}>
                    {config.sidebarSecondary}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    {profile.recognitions.map((rec, i) => (
                      <Chip key={i} label={rec} icon={<EmojiEventsOutlinedIcon sx={{ color: 'var(--color-slate-500)' }} />} sx={{ borderRadius: 'var(--radius-lg)', fontWeight: 'var(--font-regular)', bgcolor: "var(--card-inner-bg)", color: "var(--color-slate-900)", border: "var(--border-thin) solid var(--card-inner-border)", px: 1, py: 2.5, fontSize: 'var(--font-sm)', backdropFilter: "var(--card-blur)", transition: "var(--transition-slow)", '&:hover': { transform: 'translateY(-2px)' } }} />
                    ))}
                  </Box>
                </Box>
              )}
            </PremiumCard>
          )}
        </Box>

            {/* Navigation Tabs */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "var(--border-thin) solid rgba(0, 86, 179, 0.15)", pt: 0, pb: 1.5, mb: 2 }}>
              <Box sx={{ display: "flex", gap: 4, overflowX: "auto" }}>
                {config.tabs.map(tab => (
                  <Typography
                    component="div"
                    key={tab.id}
                    sx={{
                      fontWeight: 'var(--font-bold)',
                      color: activeTab === tab.id ? "var(--color-primary)" : "var(--color-slate-500)",
                      position: "relative",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "color 0.2s",
                      '&:hover': { color: "var(--color-primary)" }
                    }}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <Box sx={{ position: "absolute", bottom: -13, left: 0, right: 0, height: 3, bgcolor: "var(--color-primary)", borderRadius: "3px 3px 0 0" }} />
                    )}
                  </Typography>
                ))}
              </Box>

              <Button
                variant="outlined"
                startIcon={<EditOutlinedIcon />}
                onClick={() => setUpdateModalOpen(true)}
                sx={{
                  borderRadius: 'var(--radius-lg)',
                  textTransform: "none",
                  fontWeight: 'var(--font-semibold)',
                  borderColor: "rgba(0, 86, 179, 0.3)",
                  color: "var(--color-primary)",
                  display: { xs: 'none', sm: 'flex' },
                  '&:hover': {
                    borderColor: "var(--color-primary)",
                    backgroundColor: "rgba(0, 86, 179, 0.05)"
                  }
                }}
              >
                Edit Profile
              </Button>
            </Box>

            {/* Tab Content — scrollable on desktop only, flows naturally on mobile */}
            <Box sx={{
              flex: { xs: 'none', sm: 1 },
              overflowY: { xs: 'visible', sm: 'auto' },
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              pt: 3,
              pb: 4,
            }}>
            <Grid container spacing={4}>
              {/* Main Content Area */}
              <Grid size={{ xs: 12 }}>

                {activeTab === "overview" && (
                  <Box>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 2 }}>
                        मेरे बारे में
                      </Typography>
                      <Typography sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-base)', lineHeight: 1.8 }}>
                        {profile.bio || "कोई विवरण उपलब्ध नहीं है।"}
                      </Typography>
                    </Box>

                    {/* Metrics Styled as Separate Boards */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 2 }}>
                        {config.statsHeading}
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
                        {config.metrics.map((metric, idx) => {
                          const IconComp = metric.icon;
                          return (
                            <PremiumCard variant="stat" key={idx} sx={{ width: "var(--size-full)", height: "var(--size-full)", display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}>
                              <Box sx={{ color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <IconComp sx={{ fontSize: 26 }} />
                              </Box>
                              <Box>
                                <Typography sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', fontSize: 'var(--font-base)' }}>{metric.title}</Typography>
                                <Typography sx={{ fontSize: 'var(--font-xs)', color: 'var(--color-slate-500)' }}>{metric.subtitle}</Typography>
                              </Box>
                            </PremiumCard>
                          );
                        })}
                      </Box>
                    </Box>
                  </Box>
                )}

                {activeTab === "courses" && (
                  <Box sx={{ textAlign: "center", py: 10 }}>
                    <LibraryBooksOutlinedIcon sx={{ fontSize: 48, color: "var(--color-slate-500)", mb: 2 }} />
                    <Typography variant="h6" sx={{ color: "var(--color-slate-500)", fontWeight: 'var(--font-semibold)' }}>कोई कोर्स नहीं</Typography>
                    <Typography variant="body2" sx={{ color: "var(--color-slate-500)" }}>अभी तक किसी कोर्स में नामांकन नहीं किया है।</Typography>
                  </Box>
                )}

                {activeTab === "achievements" && (
                  <Box sx={{ textAlign: "center", py: 10 }}>
                    <EmojiEventsOutlinedIcon sx={{ fontSize: 48, color: "var(--color-slate-500)", mb: 2 }} />
                    <Typography variant="h6" sx={{ color: "var(--color-slate-500)", fontWeight: 'var(--font-semibold)' }}>उपलब्धियां</Typography>
                    <Typography variant="body2" sx={{ color: "var(--color-slate-500)" }}>अभी तक कोई उपलब्धि नहीं।</Typography>
                  </Box>
                )}

                {activeTab === "activity" && (
                  <Box sx={{ textAlign: "center", py: 10 }}>
                    <TrendingUpOutlinedIcon sx={{ fontSize: 48, color: "var(--color-slate-500)", mb: 2 }} />
                    <Typography variant="h6" sx={{ color: "var(--color-slate-500)", fontWeight: 'var(--font-semibold)' }}>कोई गतिविधि नहीं</Typography>
                    <Typography variant="body2" sx={{ color: "var(--color-slate-500)" }}>हाल में कोई गतिविधि नहीं हुई है।</Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
            </Box>{/* end tab content scroll box */}

          {/* Modals */}
          {profile && <KycVerificationModal open={isKycModalOpen} onClose={() => setKycModalOpen(false)} userId={profile.id} onSuccess={() => setProfile(prev => ({ ...prev, kyc_status: "verified" }))} />}
          {profile && <ProfileUpdateModal open={isUpdateModalOpen} onClose={() => setUpdateModalOpen(false)} profile={profile} onSuccess={fetchProfile} />}
      </Box>
    </Box>
  );
}