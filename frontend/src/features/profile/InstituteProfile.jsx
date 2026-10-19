"use client";
import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper, Avatar, Button, Chip, Accordion, AccordionSummary, AccordionDetails, useTheme, useMediaQuery, IconButton, TextField, Grid, Container, Skeleton } from "@mui/material";
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { uploadToMinIO } from '../../utils/uploadUtil';
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
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EmptyState from "../../components/ui/EmptyState";
import EmptyCoursesIllustration from "./EmptyCoursesIllustration";
import EmptyAchievementsIllustration from "./EmptyAchievementsIllustration";
import EmptyActivityIllustration from "./EmptyActivityIllustration";
import EmptyEducationIllustration from "./EmptyEducationIllustration";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import Loader from "../../components/common/Loader";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import TwitterIcon from "@mui/icons-material/Twitter";
import { useParams } from 'next/navigation';
import { useAppRouter as useRouter } from '../../hooks/useAppRouter';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import Navbar from '../../components/navbar/Navbar';
import KycVerificationModal from "./components/KycVerificationModal";
import InstituteUpdateModal from "./components/InstituteUpdateModal";
import InstituteProfileSkeleton from "./InstituteProfileSkeleton";
import PremiumCard from "../../components/ui/PremiumCard";
import ProfileLayout from "../../components/profile/ProfileLayout";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useToast } from "../../contexts/ToastContext";

const getRoleConfig = (role) => {
  const r = (role || 'student').toLowerCase();

  if (r === 'institute' || r === 'admin') {
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
    statsHeading: "आँकड़े",
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

export default function InstituteProfile() {
  const { locationName } = useAccessibility();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
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


  // Removed broken window.scroll listener; Auto-scroll is now handled in the requestAnimationFrame loop.

  const [error, setError] = useState(null);

  const fetchProfile = async (forceUpdate = false) => {
    try {
      let newData = null;
      try {
        const response = await apiClient.get("/institute/profile");
        newData = response.data;
      } catch (err) {
        const fallbackResponse = await apiClient.get("/user/profile");
        newData = fallbackResponse.data;
      }

      setProfile(newData);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setError(true);
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

    // Use unique S3 folder paths so institute images don't overwrite admin's personal images in MinIO
    const s3Type = type === "profile" ? "institute_logo" : "institute_banner";

    // Optimistic UI Update for instant feedback
    const objectUrl = URL.createObjectURL(file);
    const instField = type === "profile" ? "logo_url" : "banner_url";

    // Set ONLY institute_profile to ensure it doesn't couple with personal profile
    setProfile(prev => ({
      ...prev,
      institute_profile: {
        ...(prev.institute_profile || {}),
        [instField]: objectUrl
      }
    }));

    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      const filename = type === 'profile' ? 'instituteLogo' : 'instituteBanner';
      const oldURL = type === 'profile' ? profile.institute_profile?.logo_url : profile.institute_profile?.banner_url;
      const fileUrl = await uploadToMinIO(file, profile, s3Type, filename, oldURL);

      // Save to institutes table via updateProfile call
      const ip = { ...(profile.institute_profile || {}) };
      if (type === "profile") {
        ip.logo_url = fileUrl;
      } else {
        ip.banner_url = fileUrl;
      }
      const { updateProfile } = await import("../../features/auth/authService");
      await updateProfile({
        user_id: profile.id,
        primary_name: profile.primary_name || "",
        institute_profile: {
          institute_type: ip.institute_type || "school",
          established_year: ip.established_year || 2000,
          registration_number: ip.registration_number || "N/A",
          website_url: ip.website_url || "",
          short_description: ip.short_description || "",
          logo_url: ip.logo_url ? ip.logo_url.split('?')[0] : "",
          banner_url: ip.banner_url ? ip.banner_url.split('?')[0] : "",
          license_certificate_url: ip.license_certificate_url || "",
          official_phone: ip.official_phone || "",
          official_email: ip.official_email || "",
          alternate_contact: ip.alternate_contact || "",
          courses_offered: (ip.courses_offered && ip.courses_offered.length > 0) ? ip.courses_offered : ["General"],
          education_levels: (ip.education_levels && ip.education_levels.length > 0) ? ip.education_levels : ["Primary"],
          student_count: ip.student_count || 0,
          faculty_count: ip.faculty_count || 0,
          campus_type: ip.campus_type || "",
          operating_hours: ip.operating_hours || "",
          address_line: ip.address_line || "",
          pincode: ip.pincode || "",
          accreditation_docs: ip.accreditation_docs || []
        }
      });

      // Fetch immediately to ensure timely UI update, similar to Admin Profile.jsx
      await fetchProfile();
    } catch (error) {
      console.error("Upload failed:", error);
      showToast("Upload failed. Please try again.");
      await fetchProfile(); // Revert on failure
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };


  if (loading) {
    return <InstituteProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <Box sx={{ height: "calc(100vh - 72px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="h6" color="error">
          Failed to load institute profile.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <ProfileLayout
        profile={profile}
        profileType="institute"
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
                        <Typography sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-base)', lineHeight: 1.8 }}>
                          {profile.institute_profile?.short_description || profile.bio || "कोई विवरण उपलब्ध नहीं है।"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Metrics Styled as Separate Boards */}
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
                  </Box>
                )}

                {activeTab === "institutes" && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
                    {profile?.institutes && profile.institutes.length > 0 ? (
                      <Box sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 3 }}>
                          प्रबंधित संस्थान
                        </Typography>
                        <Grid container spacing={3}>
                          {profile.institutes.map((inst, idx) => (
                            <Grid size={{ xs: 12, md: 6, lg: 6, xl: 5 }} key={idx}>
                              <PremiumCard sx={{ 
                                p: 0, 
                                overflow: 'hidden', 
                                display: 'flex', 
                                flexDirection: 'column',
                                transition: 'var(--transition-base)',
                                cursor: 'pointer',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 'var(--shadow-md)' }
                              }}>
                                {/* Banner */}
                                <Box sx={{ 
                                  height: 150, 
                                  width: '100%', 
                                  backgroundImage: `url(${inst?.institute_profile?.banner_url || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200"})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  position: 'relative'
                                }}>
                                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                                </Box>
                                
                                {/* Content */}
                                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative' }}>
                                  {/* Logo overlay */}
                                  <Box sx={{ 
                                    width: 72, 
                                    height: 72, 
                                    borderRadius: '50%', 
                                    border: '4px solid var(--card-bg)',
                                    bgcolor: 'white',
                                    backgroundImage: `url(${inst?.institute_profile?.logo_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(inst?.primary_name || "Institute") + "&background=0D8ABC&color=fff"})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'absolute',
                                    top: -36,
                                    left: 24,
                                    boxShadow: 'var(--shadow-sm)'
                                  }} />
                                  
                                  <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-slate-900)', lineHeight: 1.3 }}>
                                      {inst?.primary_name || inst?.full_name || "संस्थान"}
                                    </Typography>
                                    <Typography sx={{ fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
                                      {inst?.location || "India"}
                                    </Typography>
                                  </Box>
                                  
                                  <Box sx={{ mt: 3, pt: 2.5, borderTop: 'var(--border-thin) dashed var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                                      <Typography sx={{ 
                                        fontSize: '10px', 
                                        color: 'var(--color-primary)', 
                                        fontWeight: 800, 
                                        bgcolor: 'rgba(0, 86, 179, 0.1)', 
                                        px: 1, 
                                        py: 0.5, 
                                        borderRadius: '4px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '100%'
                                      }}>
                                        {inst?.institute_profile?.institute_type?.toUpperCase() || "INSTITUTE"}
                                      </Typography>
                                    </Box>
                                    <Button 
                                      size="small" 
                                      variant="contained" 
                                      endIcon={<ArrowForwardIosIcon sx={{ fontSize: '10px !important' }} />}
                                      sx={{ 
                                        borderRadius: 'var(--radius-md)', 
                                        textTransform: 'none', 
                                        fontSize: 'var(--font-xs)',
                                        fontWeight: 700,
                                        bgcolor: 'var(--color-primary)',
                                        boxShadow: 'none',
                                        px: 2,
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        '&:hover': { boxShadow: 'none' }
                                      }}
                                      onClick={() => window.open(`/dashboard/explore/${inst?.username}`, '_blank')}
                                    >
                                      पोर्टल देखें
                                    </Button>
                                  </Box>
                                </Box>
                              </PremiumCard>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    ) : (
                      <Box sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minHeight: { xs: '50vh', md: '65vh' } }}>
                          <EmptyState
                            title="कोई संस्थान नहीं"
                            subtitle="आपने अभी तक कोई संस्थान नहीं जोड़ा है।"
                            illustration={<EmptyEducationIllustration />}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}

                {activeTab === "courses" && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
                    <Box sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, minHeight: { xs: '50vh', md: '65vh' } }}>
                        <EmptyState
                          title="कोई कोर्स नहीं"
                          subtitle="अभी तक किसी कोर्स में नामांकन नहीं किया है।"
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
      {isUpdateModalOpen && profile && <InstituteUpdateModal profile={profile} onClose={() => setUpdateModalOpen(false)} onSuccess={fetchProfile} />}
    </>
  );
}