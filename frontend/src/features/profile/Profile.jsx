"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Avatar, Button, Chip, Accordion, AccordionSummary, AccordionDetails, useTheme, useMediaQuery, IconButton, TextField, Grid, Container, Skeleton, Tooltip, Dialog, DialogContent, DialogTitle } from "@mui/material";
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
import Loader from "../../components/common/Loader";
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
import AttachFileIcon from "@mui/icons-material/AttachFile";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import TwitterIcon from "@mui/icons-material/Twitter";
import KycVerificationModal from "./components/KycVerificationModal";
import ProfileUpdateModal from "./components/ProfileUpdateModal";
import { useParams } from 'next/navigation';
import { useAppRouter as useRouter } from '../../hooks/useAppRouter';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import Navbar from '../../components/navbar/Navbar';
import EmptyState from "../../components/ui/EmptyState";
import EmptyBioIllustration from "./EmptyBioIllustration";
import EmptyEducationIllustration from "./EmptyEducationIllustration";
import EmptyAddressIllustration from "./EmptyAddressIllustration";
import EmptyPersonalIllustration from "./EmptyPersonalIllustration";
import EmptyCoursesIllustration from "./EmptyCoursesIllustration";
import EmptyAchievementsIllustration from "./EmptyAchievementsIllustration";
import EmptyActivityIllustration from "./EmptyActivityIllustration";
import ProfileSkeleton from "./ProfileSkeleton";
import PremiumCard from "../../components/ui/PremiumCard";

const getRoleConfig = (role) => {
  const r = (role || 'student').toLowerCase();

  if (r === 'institute' || r === 'organisation') {
    return {
      tabs: [
        { id: "overview", label: "सारांश" },
        { id: "personal", label: "व्यक्तिगत जानकारी" },
        { id: "address", label: "पता" },
        { id: "academic", label: "शैक्षिक अभिलेख" },
        { id: "institutes", label: "मेरे संस्थान" },
        { id: "activity", label: "गतिविधियां" }
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
        { id: "overview", label: "सारांश" },
        { id: "personal", label: "व्यक्तिगत जानकारी" },
        { id: "address", label: "पता" },
        { id: "academic", label: "शैक्षिक अभिलेख" },
        { id: "my_courses", label: "मेरी पाठ्यश्रृंखला" },
        { id: "reviews", label: "समीक्षाएं" },
        { id: "activity", label: "गतिविधियां" }
      ],
      sidebarPrimary: "Subjects/Expertise:",
      sidebarSecondary: "Qualifications:",
      statsHeading: "शिक्षण आँकड़े",
      metrics: [
        { icon: LibraryBooksOutlinedIcon, title: "18 कुल पाठ्यश्रृंखला", subtitle: "प्रकाशित पाठ्यश्रृंखला" },
        { icon: GroupsOutlinedIcon, title: "4,500 कुल छात्र", subtitle: "पढ़ाए गए छात्र" },
        { icon: StarOutlineOutlinedIcon, title: "4.8 औसत रेटिंग", subtitle: "छात्रों द्वारा" },
        { icon: AccessTimeOutlinedIcon, title: "850 शिक्षण घंटे", subtitle: "कुल कंटेंट" }
      ]
    };
  }

  // Default: student
  return {
    tabs: [
      { id: "overview", label: "सारांश" },
      { id: "personal", label: "व्यक्तिगत जानकारी" },
      { id: "address", label: "पता" },
      { id: "academic", label: "शैक्षिक अभिलेख" },
      { id: "courses", label: "पाठ्यश्रृंखला" },
      { id: "achievements", label: "उपलब्धियां" },
      { id: "activity", label: "गतिविधियां" }
    ],
    sidebarPrimary: "Expert",
    sidebarSecondary: "Recognitions:",
    statsHeading: "आँकड़े",
    metrics: [
      { icon: LibraryBooksOutlinedIcon, title: "0 नामांकित पाठ्यश्रृंखला", subtitle: "सक्रिय पाठ्यक्रम" },
      { icon: CheckCircleOutlineOutlinedIcon, title: "0 पूर्ण पाठ्यश्रृंखला", subtitle: "0% सफलता दर" },
      { icon: AccessTimeOutlinedIcon, title: "0 सीखने के घंटे", subtitle: "पिछले 30 दिनों में" },
      { icon: StarOutlineOutlinedIcon, title: "0 कुल अंक", subtitle: "शुरुआती स्तर" },
      { icon: TrendingUpOutlinedIcon, title: "0 ग्लोबल रेटिंग", subtitle: "शुरुआती स्तर" },
      { icon: CardMembershipOutlinedIcon, title: "0 प्रमाणपत्र", subtitle: "सत्यापित प्रमाणपत्र" }
    ]
  };
};

export default function Profile() {
  const { locationName } = useAccessibility();
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

    // Optimistic UI Update for instant feedback
    const objectUrl = URL.createObjectURL(file);
    const urlField = type === "profile" ? "profile_pic_url" : "banner_url";
    setProfile(prev => ({ ...prev, [urlField]: objectUrl }));

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
      bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)",
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
        pr: { sm: 1, md: 1.5, lg: 1.5 },
        pt: { sm: 3, md: 4 },
        pb: { sm: 6, md: 8 },
      }}>
        <Box ref={sidebarRef} sx={{ width: "var(--size-full)" }}>

          {/* Profile Card */}
          <PremiumCard variant="profile" sx={{ pt: 0, pb: 4, px: 4, textAlign: "left", overflow: "hidden" }}>

            {/* Banner Area */}
            <Box sx={{
              height: 120,
              mx: -4,
              mb: 0,
              backgroundImage: profile.banner_url ? `url(${profile.banner_url})` : "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative"
            }}>
              <Box onClick={() => bannerInputRef.current?.click()} sx={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-white)", color: "var(--color-primary)", border: "1px solid var(--color-slate-200)", borderRadius: 'var(--radius-full)', cursor: "pointer", zIndex: 3, "&:hover": { background: "var(--color-slate-50)", transform: "scale(1.05)" }, transition: "all var(--transition-base)" }}>
                {uploading.banner ? <Loader mini /> : <EditOutlinedIcon sx={{ fontSize: 16, color: "var(--color-primary)" }} />}
              </Box>
              <input type="file" ref={bannerInputRef} style={{ display: "none" }} accept="image/*" onChange={(e) => handleUpload(e.target.files[0], "banner")} />
            </Box>

            {/* Avatar and Action Button Row */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: -5, mb: 3 }}>

              {/* Avatar */}
              <Box sx={{ position: "relative", display: "inline-block", p: "2px", border: "2px solid var(--color-primary)", borderRadius: 'var(--radius-full)', zIndex: 2 }}>
                <Avatar
                  sx={{
                    width: 100, height: 100, position: "relative", zIndex: 2,
                    background: "var(--theme-green)", color: "var(--color-white)",
                    fontSize: 36, fontWeight: 900,
                    border: "none",
                    "& img": { objectFit: "cover" }
                  }}
                  src={profile.profile_pic_url}
                >
                  {!profile.profile_pic_url && (profile.full_name?.charAt(0).toUpperCase() || profile.username?.charAt(0).toUpperCase() || "यू")}
                </Avatar>
                <Box onClick={() => profileInputRef.current?.click()} sx={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-white)", color: "var(--color-primary)", border: "1px solid var(--color-slate-200)", borderRadius: 'var(--radius-full)', cursor: "pointer", zIndex: 3, "&:hover": { background: "var(--color-slate-50)", transform: "scale(1.05)" }, transition: "all var(--transition-base)" }}>
                  {uploading.profile ? <Loader mini /> : <EditOutlinedIcon sx={{ fontSize: 14, color: "var(--color-primary)" }} />}
                </Box>
                <input type="file" ref={profileInputRef} style={{ display: "none" }} accept="image/*" onChange={(e) => handleUpload(e.target.files[0], "profile")} />
              </Box>

              {/* Verify Button */}
              <Box sx={{ pb: 1, zIndex: 2 }}>
                {profile.kyc_status === "verified" ? (
                  <Button variant="contained" size="small" disabled sx={{ borderRadius: 'var(--radius-md)', px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 'var(--font-medium)', fontSize: 'var(--font-sm)', background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%)", color: "var(--color-white)", whiteSpace: 'nowrap', minWidth: 0 }}>
                    सत्यापित
                  </Button>
                ) : (
                  <Button variant="contained" size="small" startIcon={<VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} />} onClick={() => setKycModalOpen(true)} sx={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%)', color: 'var(--color-white)', borderRadius: 'var(--radius-md)', px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', whiteSpace: 'nowrap', minWidth: 0 }}>
                    सत्यापित करें
                  </Button>
                )}
              </Box>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', mb: 0.5, fontSize: '1.4rem', textTransform: 'capitalize' }}>
              {profile.full_name || profile.username}
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--color-slate-900)', fontWeight: 'var(--font-medium)', mb: 0.5, fontSize: 'var(--font-base)', textTransform: 'capitalize' }}>
              {profile.role === 'institute' || profile.role === 'organisation' ? 'Admin' : (profile.role || "Owner and Principal at Nasim Management")}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', mb: 2, fontSize: 'var(--font-sm)', textTransform: 'capitalize' }}>
              {profile.location || locationName || "No location provided"}
            </Typography>
          </PremiumCard>

          {/* Skills/Expertise Card */}
          {((profile.skills && profile.skills.length > 0) || (profile.recognitions && profile.recognitions.length > 0) || true) && (
            <PremiumCard variant="profile" sx={{ p: { xs: 2.5, sm: 4 }, mt: 3 }}>
              <Box sx={{ mb: profile.recognitions && profile.recognitions.length > 0 ? 4 : 0 }}>
                <Typography variant="subtitle1" fontWeight={500} color="var(--color-slate-900)" sx={{ mb: 1.5 }}>
                  {config.sidebarPrimary}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                  {(profile.skills && profile.skills.length > 0 ? profile.skills : (
                    (profile.role === 'institute' || profile.role === 'organisation')
                      ? ["Administration", "Leadership", "Management", "Operations", "Strategy"]
                      : ["Capital Raising", "Marketing & Sales", "Consulting", "Asset Management", "Business Development"]
                  )).map((skill, i) => (
                    <Chip key={i} label={skill} sx={{ borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-regular)', bgcolor: "transparent", color: "var(--color-slate-900)", border: "var(--border-thin) solid var(--card-border)", px: 1, fontSize: 'var(--font-sm)', backdropFilter: "var(--card-blur)", transition: "var(--transition-slow)", '&:hover': { transform: 'translateY(-2px)' } }} />
                  ))}
                </Box>
              </Box>
              {profile.recognitions && profile.recognitions.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={500} color="var(--color-slate-900)" sx={{ mb: 1.5 }}>
                    {config.sidebarSecondary}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    {profile.recognitions.map((rec, i) => (
                      <Chip key={i} label={rec} icon={<EmojiEventsOutlinedIcon sx={{ color: 'var(--color-slate-500)' }} />} sx={{ borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-regular)', bgcolor: "transparent", color: "var(--color-slate-900)", border: "var(--border-thin) solid var(--card-border)", px: 1, py: 2.5, fontSize: 'var(--font-sm)', backdropFilter: "var(--card-blur)", transition: "var(--transition-slow)", '&:hover': { transform: 'translateY(-2px)' } }} />
                    ))}
                  </Box>
                </Box>
              )}
            </PremiumCard>
          )}

          {/* Social Links Card (Left Sidebar) */}
          {profile.social_links && Object.keys(profile.social_links).length > 0 && (
            <PremiumCard variant="profile" sx={{ p: { xs: 2.5, sm: 4 }, mt: 3 }}>
              <Typography variant="subtitle1" fontWeight={500} color="var(--color-slate-900)" sx={{ mb: 1.5 }}>
                Connect
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {Object.entries(profile.social_links).map(([platform, url]) => {
                  const getBrandColor = (p) => {
                    const lower = p.toLowerCase();
                    if (lower === 'linkedin') return '#0077b5';
                    if (lower === 'github') return '#333333';
                    if (lower === 'twitter') return '#1DA1F2';
                    if (lower === 'instagram') return '#E1306C';
                    return 'var(--color-primary)';
                  };
                  const brandColor = getBrandColor(platform);

                  return (
                    <Tooltip key={platform} title={platform} placement="top" arrow>
                      <Box
                        component="a"
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          color: brandColor,
                          transition: 'opacity 0.2s',
                          '&:hover': { opacity: 0.8 }
                        }}
                      >
                        {platform.toLowerCase() === 'linkedin' ? <LinkedInIcon sx={{ fontSize: 28 }} /> :
                          platform.toLowerCase() === 'github' ? <GitHubIcon sx={{ fontSize: 28 }} /> :
                            platform.toLowerCase() === 'twitter' ? <TwitterIcon sx={{ fontSize: 28 }} /> :
                              platform.toLowerCase() === 'instagram' ? <InstagramIcon sx={{ fontSize: 28 }} /> :
                                <ShareIcon sx={{ fontSize: 28 }} />}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
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
        pl: { xs: 2, sm: 1, md: 1.5, lg: 1.5 },
        pr: { xs: 2, sm: 2, md: 4, lg: 6 },
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
              backgroundImage: profile.banner_url ? `url(${profile.banner_url})` : "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative"
            }}>
              <Box onClick={() => bannerInputRef.current?.click()} sx={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-white)", color: "var(--color-primary)", border: "1px solid var(--color-slate-200)", borderRadius: 'var(--radius-full)', cursor: "pointer", zIndex: 3, "&:hover": { background: "var(--color-slate-50)", transform: "scale(1.05)" }, transition: "all var(--transition-base)" }}>
                {uploading.banner ? <Loader mini /> : <EditOutlinedIcon sx={{ fontSize: 16, color: "var(--color-primary)" }} />}
              </Box>
              <input type="file" ref={bannerInputRef} style={{ display: "none" }} accept="image/*" onChange={(e) => handleUpload(e.target.files[0], "banner")} />
            </Box>

            {/* Avatar and Action Button Row */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: -5, mb: 3 }}>

              {/* Avatar */}
              <Box sx={{ position: "relative", display: "inline-block", p: "2px", border: "2px solid var(--color-primary)", borderRadius: 'var(--radius-full)', zIndex: 2 }}>
                <Avatar
                  sx={{
                    width: 100, height: 100, position: "relative", zIndex: 2,
                    background: "var(--theme-green)", color: "var(--color-white)",
                    fontSize: 36, fontWeight: 900,
                    border: "none",
                    "& img": { objectFit: "cover" }
                  }}
                  src={profile.profile_pic_url}
                >
                  {!profile.profile_pic_url && (profile.full_name?.charAt(0).toUpperCase() || profile.username?.charAt(0).toUpperCase() || "यू")}
                </Avatar>
                <Box onClick={() => profileInputRef.current?.click()} sx={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-white)", color: "var(--color-primary)", border: "1px solid var(--color-slate-200)", borderRadius: 'var(--radius-full)', cursor: "pointer", zIndex: 3, "&:hover": { background: "var(--color-slate-50)", transform: "scale(1.05)" }, transition: "all var(--transition-base)" }}>
                  {uploading.profile ? <Loader mini /> : <EditOutlinedIcon sx={{ fontSize: 14, color: "var(--color-primary)" }} />}
                </Box>
                <input type="file" ref={profileInputRef} style={{ display: "none" }} accept="image/*" onChange={(e) => handleUpload(e.target.files[0], "profile")} />
              </Box>

              {/* Verify Button */}
              <Box sx={{ pb: 1, zIndex: 2, alignSelf: 'flex-end', display: 'flex', alignItems: 'flex-end' }}>
                {profile.kyc_status === "verified" ? (
                  <Button variant="contained" size="small" disabled sx={{ borderRadius: 'var(--radius-md)', px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 'var(--font-medium)', fontSize: 'var(--font-sm)', background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%)", color: "var(--color-white)", whiteSpace: 'nowrap', minWidth: 0 }}>
                    सत्यापित
                  </Button>
                ) : (
                  <Button variant="contained" size="small" startIcon={<VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} />} onClick={() => setKycModalOpen(true)} sx={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%)', color: 'var(--color-white)', borderRadius: 'var(--radius-md)', px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', whiteSpace: 'nowrap', minWidth: 0 }}>
                    सत्यापित करें
                  </Button>
                )}
              </Box>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', mb: 0.5, fontSize: '1.4rem', textTransform: 'capitalize' }}>
              {profile.full_name || profile.username}
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--color-slate-900)', fontWeight: 'var(--font-medium)', mb: 0.5, fontSize: 'var(--font-base)', textTransform: 'capitalize' }}>
              {profile.role === 'institute' || profile.role === 'organisation' ? 'Admin' : (profile.role || "Owner and Principal at Nasim Management")}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', mb: 2, fontSize: 'var(--font-sm)', textTransform: 'capitalize' }}>
              {profile.location || locationName || "No location provided"}
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
                    <Chip key={i} label={skill} sx={{ borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-regular)', bgcolor: "transparent", color: "var(--color-slate-900)", border: "var(--border-thin) solid var(--card-border)", px: 1, fontSize: 'var(--font-sm)', backdropFilter: "var(--card-blur)", transition: "var(--transition-slow)", '&:hover': { transform: 'translateY(-2px)' } }} />
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
                      <Chip key={i} label={rec} icon={<EmojiEventsOutlinedIcon sx={{ color: 'var(--color-slate-500)' }} />} sx={{ borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-regular)', bgcolor: "transparent", color: "var(--color-slate-900)", border: "var(--border-thin) solid var(--card-border)", px: 1, py: 2.5, fontSize: 'var(--font-sm)', backdropFilter: "var(--card-blur)", transition: "var(--transition-slow)", '&:hover': { transform: 'translateY(-2px)' } }} />
                    ))}
                  </Box>
                </Box>
              )}
            </PremiumCard>
          )}
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 0, pb: 0, mb: 0 }}>
          <Box sx={{
            display: "flex",
            gap: 0.5,
            overflowX: "auto",
            overflowY: "hidden",
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            bgcolor: "var(--card-bg)",
            backdropFilter: "var(--card-blur)",
            border: "var(--border-thin) solid var(--card-border)",
            p: 0.5,
            borderRadius: 'var(--radius-md)',
            mr: { xs: 0, sm: 2 },
            flex: { xs: 1, xl: 'none' },
            maxWidth: '100%',
            height: '44px',
            alignItems: 'center',
          }}>
            {config.tabs.map(tab => (
              <Box
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  px: { xs: 1.5, sm: 2 },
                  py: 0,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 'var(--radius-md)',
                  color: "var(--color-slate-500)",
                  fontWeight: 'var(--font-semibold)',
                  fontSize: 'var(--font-sm)',
                  transition: "color var(--transition-base)",
                  '&:hover': {
                    // No text color change on hover
                  },
                  zIndex: 1,
                  flex: 1,
                }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeProfileTab"
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "transparent",
                      backdropFilter: "var(--card-blur)",
                      border: "var(--border-thin) solid var(--card-border)",
                      borderRadius: "var(--radius-md)",
                      zIndex: -1,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </Box>
            ))}
          </Box>

          <Button
            variant="outlined"
            startIcon={<EditOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={() => setUpdateModalOpen(true)}
            sx={{
              borderRadius: 'var(--radius-md)',
              textTransform: "none",
              fontWeight: 'var(--font-semibold)',
              borderColor: "rgba(0, 86, 179, 0.3)",
              color: "var(--color-primary)",
              display: { xs: 'none', sm: 'flex' },
              flexShrink: 0,
              whiteSpace: 'nowrap',
              px: 3,
              py: 0,
              height: '44px',
              '&:hover': {
                borderColor: "var(--color-primary)",
                backgroundColor: "rgba(0, 86, 179, 0.05)"
              }
            }}
          >
            एडिट प्रोफ़ाइल
          </Button>
        </Box>

        {/* Tab Content — scrollable on desktop only, flows naturally on mobile */}
        <Box sx={{
          flex: { xs: 'none', sm: 1 },
          display: 'flex',
          flexDirection: 'column',
          overflowY: { xs: 'visible', sm: 'auto' },
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          pt: 3,
          pb: 4,
        }}>
          <Grid container spacing={4} sx={{ flexGrow: 1, m: 0, width: '100%' }}>
            {/* Main Content Area */}
            <Grid size={{ xs: 12 }} sx={{ display: 'flex', flexDirection: 'column' }}>

              {activeTab === "overview" && (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 2 }}>
                      मेरे बारे में
                    </Typography>
                    <Box sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)", borderRadius: "var(--radius-lg)", border: "var(--border-thin) solid var(--card-border)" }}>
                      {profile.bio ? (
                        <Typography sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-base)', lineHeight: 1.8 }}>
                          {profile.bio}
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: { xs: '30vh', md: '40vh' } }}>
                          <EmptyState
                            illustration={<EmptyBioIllustration />}
                            title="कोई विवरण उपलब्ध नहीं है"
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Personal Details */}
              {activeTab === 'personal' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  {(!profile.phone && !profile.gender && !profile.dob && !profile.religion && !profile.caste && !profile.nationality && !profile.language) ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minHeight: '40vh' }}>
                      <EmptyState
                        illustration={<EmptyPersonalIllustration />}
                        title="कोई व्यक्तिगत जानकारी नहीं है"
                        description="अपनी प्रोफ़ाइल पूरी करने के लिए अपनी व्यक्तिगत जानकारी (जैसे जन्म तिथि, लिंग, धर्म आदि) जोड़ें।"
                        actionButton={{
                          label: "जानकारी जोड़ें",
                          onClick: () => setIsEditing(true)
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)", borderRadius: "var(--radius-lg)", border: "var(--border-thin) solid var(--card-border)" }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {[
                          { label: 'पूरा नाम', value: profile.full_name },
                          { label: 'यूज़रनेम', value: profile.username },
                          { label: 'ईमेल', value: profile.email },
                          { label: 'फ़ोन नंबर', value: profile.phone },
                          { label: 'लिंग', value: profile.gender },
                          { label: 'जन्म तिथि', value: profile.dob ? new Date(profile.dob).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null },
                          { label: 'धर्म', value: profile.religion },
                          { label: 'जाति (उपजाति)', value: (profile.caste || profile.subcaste) ? `${profile.caste || ""}${profile.subcaste ? ` (${profile.subcaste})` : ""}` : null },
                          { label: 'राष्ट्रीयता', value: profile.nationality },
                          { label: 'भाषा', value: (profile.languages && profile.languages.length > 0) ? profile.languages.join(", ") : profile.language }
                        ].map((item, idx, arr) => (
                          <Box key={idx} sx={{ display: 'flex', pt: idx === 0 ? 0 : 2, pb: idx === arr.length - 1 ? 0 : 2, '&:not(:last-of-type)': { borderBottom: 'var(--border-thin) solid rgba(0, 0, 0, 0.06)' } }}>
                            <Typography sx={{ width: '40%', fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)' }}>{item.label}</Typography>
                            <Typography sx={{ width: '60%', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-slate-900)' }}>{item.value || "—"}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Addresses */}
              {activeTab === 'address' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  {profile.addresses && profile.addresses.length > 0 ? (
                    <Grid container spacing={3}>
                      {profile.addresses.map((addr, idx) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                          <Box sx={{ p: { xs: 2.5, sm: 4 }, height: '100%', bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)", borderRadius: "var(--radius-lg)", border: "var(--border-thin) solid var(--card-border)" }}>
                            <Typography sx={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-primary)', mb: 1, textTransform: 'capitalize' }}>
                              {addr.type === 'permanent' ? 'स्थायी पता' : 'पत्राचार पता'}
                            </Typography>
                            {(() => {
                              if (!addr.address_line) return (
                                <Typography sx={{ fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)' }}>विवरण उपलब्ध नहीं है।</Typography>
                              );

                              let displayLine = addr.address_line;
                              try {
                                const parsed = JSON.parse(addr.address_line);
                                displayLine = [
                                  parsed.houseNoAndName,
                                  parsed.street,
                                  parsed.landmark,
                                  parsed.wardOrSector,
                                  parsed.localBodyName
                                ].filter(Boolean).join(", ");
                              } catch (e) {
                                // Not JSON, render as is
                              }

                              return (
                                <Typography sx={{ fontSize: 'var(--font-sm)', color: 'var(--color-slate-900)', whiteSpace: 'pre-line' }}>
                                  {displayLine}, {addr.district}, {addr.state} - {addr.pincode}
                                </Typography>
                              );
                            })()}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minHeight: '40vh' }}>
                      <EmptyState
                        size="large"
                        title="कोई पता नहीं जोड़ा गया है।"
                        subtitle="अपनी प्रोफ़ाइल पूरी करने के लिए अपना पता जोड़ें।"
                        illustration={<EmptyAddressIllustration />}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {/* Academic Records */}
              {activeTab === 'academic' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  {profile.academic_records && profile.academic_records.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {profile.academic_records.map((rec, idx) => (
                        <Box key={idx} sx={{ p: { xs: 2.5, sm: 3 }, bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)", borderRadius: "var(--radius-lg)", border: "var(--border-thin) solid var(--card-border)", display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography sx={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--color-slate-900)' }}>{rec.qualification || "अज्ञात योग्यता"}</Typography>
                              <Typography sx={{ fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)' }}>{rec.board_university || "—"}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {rec.document_url && (
                                  <Tooltip title="दस्तावेज़ देखें">
                                    <IconButton 
                                      size="small" 
                                      sx={{ p: 0.5, bgcolor: 'var(--color-slate-100)', color: 'var(--color-primary)' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`/viewer/${rec.document_url}`, '_blank');
                                      }}
                                    >
                                      <AttachFileIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Typography sx={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>
                                  {(() => {
                                    if (!rec.percentage_cgpa) return "—";
                                    let score = "";
                                    let max = "";

                                    if (rec.percentage_cgpa.includes('/')) {
                                      const parts = rec.percentage_cgpa.split('/');
                                      score = parts[0].replace(/[^0-9.]/g, '');
                                      max = parts[1].replace(/[^0-9.]/g, '');
                                    } else {
                                      score = rec.percentage_cgpa.replace(/[^0-9.]/g, '');
                                      const num = parseFloat(score);
                                      if (!isNaN(num)) {
                                        max = num <= 10 ? '10' : '100';
                                      }
                                    }

                                    if (!score) return "—";
                                    if (!max) return score;
                                    return `${score} / ${max}`;
                                  })()}
                                </Typography>
                              </Box>
                              <Typography sx={{ fontSize: 'var(--font-xs)', color: 'var(--color-slate-500)' }}>उत्तीर्ण वर्ष: {rec.passing_year || "—"}</Typography>
                            </Box>
                          </Box>

                          {rec.achievements && rec.achievements.length > 0 && (
                            <Box sx={{ mt: 2.5 }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.5 }}>
                                  {rec.achievements.map((ach, achIdx) => (
                                    <Box key={achIdx} sx={{
                                      p: 2,
                                      bgcolor: 'transparent',
                                      borderRadius: 'var(--radius-md)',
                                      border: 'var(--border-thin) solid var(--card-border)',
                                      backdropFilter: 'var(--card-blur)',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 0.5
                                    }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, width: '100%' }}>
                                        <Typography sx={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                                          {ach.type || 'उपलब्धि'}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {ach.recognizedBy && (
                                          <Typography sx={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-slate-900)', bgcolor: 'transparent', border: 'var(--border-thin) solid var(--card-border)', px: 1, py: 0.25, borderRadius: 'var(--radius-sm)' }}>
                                            {ach.recognizedBy}
                                          </Typography>
                                        )}
                                        {ach.document_url && (
                                          <Tooltip title="दस्तावेज़ देखें">
                                            <IconButton 
                                              size="small" 
                                              sx={{ p: 0.5, bgcolor: 'var(--color-slate-100)', color: 'var(--color-primary)' }}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(`/viewer/${ach.document_url}`, '_blank');
                                              }}
                                            >
                                              <AttachFileIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                          </Tooltip>
                                        )}
                                      </Box>
                                    </Box>

                                    {ach.details ? (
                                      <Typography sx={{ fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)', mt: 0.5 }}>
                                        {ach.details}
                                      </Typography>
                                    ) : (
                                      <Typography sx={{ fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)', fontStyle: 'italic', mt: 0.5 }}>
                                        कोई विवरण उपलब्ध नहीं है
                                      </Typography>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minHeight: '40vh' }}>
                      <EmptyState
                        illustration={<EmptyEducationIllustration />}
                        title="कोई शैक्षिक अभिलेख नहीं जोड़ा गया है"
                      />
                    </Box>
                  )}
                </Box>
              )}


              {/* Metrics Styled as Separate Boards */}
              {activeTab === 'overview' && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 2 }}>
                    {config.statsHeading}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
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
              )}

              {activeTab === "courses" && (
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
                  <Box sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minHeight: '40vh' }}>
                      <EmptyState
                        title="कोई पाठ्यश्रृंखला नहीं"
                        subtitle="अभी तक किसी पाठ्यश्रृंखला में नामांकन नहीं किया है।"
                        illustration={<EmptyCoursesIllustration />}
                      />
                    </Box>
                  </Box>
                </Box>
              )}

              {activeTab === "achievements" && (
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
                  <Box sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minHeight: '40vh' }}>
                      <EmptyState
                        title="उपलब्धियां"
                        subtitle="अभी तक कोई उपलब्धि नहीं।"
                        illustration={<EmptyAchievementsIllustration />}
                      />
                    </Box>
                  </Box>
                </Box>
              )}

              {activeTab === "activity" && (
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
                  <Box sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minHeight: '40vh' }}>
                      <EmptyState
                        title="कोई गतिविधि नहीं"
                        subtitle="हाल में कोई गतिविधि नहीं हुई है।"
                        illustration={<EmptyActivityIllustration />}
                      />
                    </Box>
                  </Box>
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