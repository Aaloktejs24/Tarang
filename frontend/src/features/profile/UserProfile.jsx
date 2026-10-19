"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Avatar, Button, Chip, Accordion, AccordionSummary, AccordionDetails, useTheme, useMediaQuery, IconButton, TextField, Grid, Container, Skeleton, Tooltip, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { uploadToMinIO } from "../../utils/uploadUtils";
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
import UserProfileUpdateModal from "./components/UserProfileUpdateModal";
import { useParams, useSearchParams } from 'next/navigation';
import { useAppRouter as useRouter } from '../../hooks/useAppRouter';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import Navbar from '../../components/navbar/Navbar';
import EmptyState from "../../components/ui/EmptyState";
import {
  EmptyBioIllustration,
  EmptyEducationIllustration,
  EmptyAddressIllustration,
  EmptyPersonalIllustration,
  EmptyCoursesIllustration,
  EmptyAchievementsIllustration,
  EmptyActivityIllustration,
} from "./illustrations";
import UserProfileSkeleton from "./UserProfileSkeleton";
import PremiumCard from "../../components/ui/GlassCard";
import ProfileLayout from "./components/ProfileLayout";
import { useToast } from "../../contexts/ToastContext";

const getRoleConfig = (role) => {
  const r = (role || 'student').toLowerCase();

  if (r === 'institute' || r === 'admin') {
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

import { CustomAccordion, CustomAccordionSummary, CustomAccordionDetails } from '../../components/common/Accordion';
import { CustomTooltip } from '../../components/common/Tooltip';


export default function Profile() {
  const { locationName } = useAccessibility();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isKycModalOpen, setKycModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || "overview");
  const [uploading, setUploading] = useState({ profile: false, banner: false });

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));


  // Removed broken window.scroll listener; Auto-scroll is now handled in the requestAnimationFrame loop.

  const fetchProfile = async (forceUpdate = false) => {
    try {
      const response = await apiClient.get("/user/profile");
      const newData = response.data;

      setProfile(newData);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const config = profile ? getRoleConfig(profile.role) : getRoleConfig('student');

  useEffect(() => {
    fetchProfile();

    const handleProfileMutated = () => fetchProfile();
    window.addEventListener("tarang:profile-mutated", handleProfileMutated);

    return () => {
      window.removeEventListener("tarang:profile-mutated", handleProfileMutated);
    };
  }, []);

  const handleUpload = async (file, type) => {
    if (!file) return;

    // Optimistic UI Update for instant feedback
    const objectUrl = URL.createObjectURL(file);
    const urlField = type === "profile" ? "profile_pic_url" : "banner_url";
    setProfile(prev => ({ ...prev, [urlField]: objectUrl }));

    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      const filename = type === 'profile' ? 'profilePic' : 'banner';
      const oldURL = type === 'profile' ? profile.profile_pic_url : profile.banner_url;
      const fileUrl = await uploadToMinIO(file, profile, type, filename, oldURL);

      const endpoint = type === "profile" ? "/user/profile/update-pic" : "/user/profile/update-banner";
      await apiClient.post(endpoint, {
        user_id: profile.id,
        url: fileUrl
      });

      await fetchProfile();
    } catch (error) {
      console.error("Upload failed:", error);
      showToast("Upload failed. Please try again.");
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
    return <UserProfileSkeleton />;
  }

  return (
    <>
      <ProfileLayout
        profile={profile}
        profileType="user"
        config={config}
        editable={true}
        uploading={uploading}
        onUpload={handleUpload}
        onVerifyClick={() => setKycModalOpen(true)}
        tabs={config.tabs.map(t => ({ label: t.label, value: t.id, icon: null }))}
        currentTab={activeTab}
        onTabChange={(e, val) => setActiveTab(val)}
        actionButtons={
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
              display: 'flex',
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
            Edit Profile
          </Button>
        }
        tabPanels={{
          [activeTab]: (
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
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minHeight: { xs: '50vh', md: '65vh' } }}>
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
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minHeight: { xs: '50vh', md: '65vh' } }}>
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
                          <CustomAccordion key={idx}>
                            <CustomAccordionSummary
                              expandIcon={rec.achievements && rec.achievements.length > 0 ? <ExpandMoreIcon sx={{ color: 'var(--color-primary)' }} /> : null}
                              disabled={!rec.achievements || rec.achievements.length === 0}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 1.5, pr: (rec.achievements && rec.achievements.length > 0) ? 1 : 0 }}>
                                <Box>
                                  <Typography sx={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--color-slate-900)' }}>{rec.qualification || "अज्ञात योग्यता"}</Typography>
                                  <Typography sx={{ fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)' }}>{rec.board_university || "—"}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {rec.document_url && (
                                      <CustomTooltip title="दस्तावेज़ देखें">
                                        <IconButton
                                          size="small"
                                          component={Link}
                                          href={`/viewer/${rec.document_url}`}
                                          target="_blank"
                                          prefetch={true}
                                          sx={{ p: 0.5, bgcolor: 'var(--color-slate-100)', color: 'var(--color-primary)' }}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <AttachFileIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                      </CustomTooltip>
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
                            </CustomAccordionSummary>

                            {rec.achievements && rec.achievements.length > 0 && (
                              <CustomAccordionDetails>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.5 }}>
                                  {rec.achievements.map((ach, achIdx) => (
                                    <Box key={achIdx} sx={{
                                      p: 2,
                                      bgcolor: 'var(--glass-bg)',
                                      borderRadius: 'var(--radius-md)',
                                      border: 'var(--border-thin) solid var(--card-border)',
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
                                            <CustomTooltip title="दस्तावेज़ देखें">
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
                                            </CustomTooltip>
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
                              </CustomAccordionDetails>
                            )}
                          </CustomAccordion>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minHeight: { xs: '50vh', md: '65vh' } }}>
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
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                      {config.metrics.map((metric, idx) => {
                        const IconComp = metric.icon;
                        return (
                          <PremiumCard variant="stat" key={idx} sx={{ width: "var(--size-full)", height: "var(--size-full)", display: "flex", flexDirection: "row", alignItems: "center", gap: 1.5 }}>
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
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minHeight: { xs: '50vh', md: '65vh' } }}>
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
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minHeight: { xs: '50vh', md: '65vh' } }}>
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
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minHeight: { xs: '50vh', md: '65vh' } }}>
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
          )
        }}
      />


      {/* Modals */}
      {profile && <KycVerificationModal open={isKycModalOpen} onClose={() => setKycModalOpen(false)} userId={profile.id} onSuccess={() => setProfile(prev => ({ ...prev, kyc_status: "verified" }))} />}
      {profile && <UserProfileUpdateModal open={isUpdateModalOpen} onClose={() => setUpdateModalOpen(false)} profile={profile} onSuccess={fetchProfile} />}
    </>
  );
}