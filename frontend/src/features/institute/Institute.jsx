"use client";
import React from "react";
import { Box, Typography, Grid, Card, CardContent, Avatar, Button, Container, alpha, Breadcrumbs, Link, Skeleton, CircularProgress } from "@mui/material";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import LocalLibraryOutlinedIcon from "@mui/icons-material/LocalLibraryOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FilterListIcon from '@mui/icons-material/FilterList';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ExploreIcon from '@mui/icons-material/Explore';
import EmptyState from '../../components/ui/EmptyState';
import HubIcon from '@mui/icons-material/Hub';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PremiumCard from '../../components/ui/PremiumCard';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import DirectionsBusOutlinedIcon from "@mui/icons-material/DirectionsBusOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import DomainOutlinedIcon from "@mui/icons-material/DomainOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useSearchParams, usePathname } from 'next/navigation';

import InstituteSetupModal from "../auth/components/InstituteSetupModal";

import { useAppRouter as useRouter } from '../../hooks/useAppRouter';
import { useProfile } from "../../hooks/useProfile";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import { useTranslation } from "../../hooks/useTranslation";
import UniversalHero from '../../components/hero/UniversalHero';
import { formatBreadcrumbName, getNoNamePlaceholder, parseBilingualName } from "../../utils/stringUtils";
import { getHeroPropsFromProfile } from '../../utils/heroUtils';
import { useBreadcrumbs } from "../../contexts/BreadcrumbContext";
import { getUserApplications } from "../admission/admissionService";
import { apiClient } from "../../lib/apiClient";
import Chip from '@mui/material/Chip';
import gazeteer from "../../data/formated/gazeteer.json";
const instituteModules = [
  {
    id: "academic", title: "शैक्षणिक / Academic", subTitle: "Classes & Curriculum", icon: <SchoolOutlinedIcon />, color: "var(--color-primary)",
    description: "कक्षाओं का कार्यक्रम, पाठ्यक्रम और शैक्षणिक कैलेंडर देखें।", updates: "Ongoing", admin: "Dean Office",
    img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "fees", title: "शुल्क / Fees", subTitle: "Payments & Dues", icon: <PaymentOutlinedIcon />, color: "var(--color-primary)",
    description: "ऑनलाइन शुल्क भुगतान, रसीद डाउनलोड और बकाया विवरण की जांच करें।", updates: "Due Soon", admin: "Accounts",
    img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "library", title: "पुस्तकालय / Library", subTitle: "Books & Resources", icon: <LocalLibraryOutlinedIcon />, color: "var(--color-primary)",
    description: "ई-पुस्तकें खोजें, किताबें जारी करें और पत्रिकाओं तक पहुंचें।", updates: "12 New", admin: "Librarian",
    img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "transport", title: "यातायात / Transport", subTitle: "Routes & Timings", icon: <DirectionsBusOutlinedIcon />, color: "var(--color-primary)",
    description: "संस्थान बस और ई-रिक्शा का समय और मार्ग।", updates: "On Time", admin: "Transport Cell",
    img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "hostels", title: "हॉस्टल / Hostels", subTitle: "Accommodation", icon: <RestaurantOutlinedIcon />, color: "var(--color-primary)",
    description: "आवास प्रबंधन, मेस मेनू और हॉस्टल शिकायत पोर्टल।", updates: "Menu Up", admin: "Warden",
    img: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "exams", title: "परीक्षा / Exams", subTitle: "Results & Admit Cards", icon: <AssignmentTurnedInOutlinedIcon />, color: "var(--color-primary)",
    description: "अपने हालिया परीक्षा परिणाम और ग्रेडिंग विवरण सुरक्षित रूप से देखें।", updates: "Results Out", admin: "Exam Cell",
    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "notice-board", title: "सूचना / Notice Board", subTitle: "Announcements", icon: <CampaignOutlinedIcon />, color: "var(--color-primary)",
    description: "संस्थान की नवीनतम घोषणाएं और महत्वपूर्ण सूचनाएं प्राप्त करें।", updates: "3 New", admin: "Admin Block",
    img: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "placements", title: "प्लेसमेंट / Placements", subTitle: "Career Opportunities", icon: <WorkOutlineOutlinedIcon />, color: "var(--color-primary)",
    description: "करियर अवसर, कंपनी प्रोफाइल और आवेदन प्रक्रिया देखें।", updates: "2 Drives", admin: "CDPC",
    img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "support", title: "सहायता / Support", subTitle: "Helpdesk & Contact", icon: <ContactSupportOutlinedIcon />, color: "var(--color-primary)",
    description: "अधिकारियों से संपर्क और शिकायत निवारण पोर्टल।", updates: "Online", admin: "Registrar",
    img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800"
  },
];

const managementModules = [
  {
    id: "student_affairs", title: "छात्र मामले / Student Affairs", subTitle: "कल्याण और गतिविधियां / Welfare & Activities", icon: <PeopleOutlinedIcon />, color: "var(--color-primary)",
    description: "Manage student welfare, counseling, and extracurricular activities."
  },
  {
    id: "academic_affairs", title: "शैक्षणिक मामले / Academic Affairs", subTitle: "पाठ्यक्रम और नीतियां / Curriculum & Policies", icon: <FactCheckOutlinedIcon />, color: "var(--color-primary)",
    description: "Manage curriculum, academic policies, and examinations."
  },
  {
    id: "administration", title: "प्रशासन / Administration", subTitle: "परिसर संचालन / Campus Operations", icon: <BadgeOutlinedIcon />, color: "var(--color-primary)",
    description: "Manage staff, infrastructure, and institutional operations."
  },
  {
    id: "resources", title: "संसाधन / Resources", subTitle: "सुविधाएं और संपत्तियां / Facilities & Assets", icon: <DomainOutlinedIcon />, color: "var(--color-primary)",
    description: "Manage campus resources, facilities, and physical assets."
  }
];

const managementSubModules = {
  student_affairs: [
    { id: "admissions", title: "नामांकन / Admissions", subTitle: "नए नामांकन / New Enrollments", icon: <PeopleOutlinedIcon />, color: "var(--color-primary)" },
    { id: "attendance", title: "उपस्थिति / Attendance", subTitle: "छात्र रिकॉर्ड / Student Records", icon: <FactCheckOutlinedIcon />, color: "var(--color-primary)" },
    { id: "discipline", title: "अनुशासन / Discipline", subTitle: "कल्याण और आचरण / Welfare & Conduct", icon: <BadgeOutlinedIcon />, color: "var(--color-primary)" },
    { id: "activities", title: "गतिविधियां / Activities", subTitle: "पाठ्येतर गतिविधियां / Extracurriculars", icon: <CampaignOutlinedIcon />, color: "var(--color-primary)" },
  ],
  academic_affairs: [
    { id: "curriculum", title: "पाठ्यक्रम / Curriculum", subTitle: "विषय और पाठ्यक्रम / Subjects & Syllabi", icon: <SchoolOutlinedIcon />, color: "var(--color-primary)" },
    { id: "exams", title: "परीक्षा / Examinations", subTitle: "समय-निर्धारण / Scheduling", icon: <FactCheckOutlinedIcon />, color: "var(--color-primary)" },
    { id: "results", title: "परिणाम / Results", subTitle: "ग्रेडिंग प्रणाली / Grading System", icon: <AnalyticsOutlinedIcon />, color: "var(--color-primary)" },
    { id: "timetable", title: "समय सारणी / Timetable", subTitle: "कक्षा अनुसूची / Class Schedule", icon: <DomainOutlinedIcon />, color: "var(--color-primary)" },
  ],
  administration: [
    { id: "staff", title: "कर्मचारी / Faculty & Staff", subTitle: "प्रोफ़ाइल और रिकॉर्ड / Profiles & Records", icon: <BadgeOutlinedIcon />, color: "var(--color-primary)" },
    { id: "payroll", title: "पेरोल / Payroll & Leaves", subTitle: "वेतन और उपस्थिति / Salary & Attendance", icon: <AccountBalanceWalletOutlinedIcon />, color: "var(--color-primary)" },
    { id: "notices", title: "सूचनाएं / Notices", subTitle: "परिपत्र / Circulars", icon: <CampaignOutlinedIcon />, color: "var(--color-primary)" },
    { id: "settings", title: "सेटिंग्स / Settings", subTitle: "संस्थान प्रोफ़ाइल / Institute Profile", icon: <SettingsOutlinedIcon />, color: "var(--color-primary)" },
  ],
  resources: [
    { id: "library", title: "पुस्तकालय / Library", subTitle: "पुस्तकें और पत्रिकाएं / Books & Journals", icon: <LocalLibraryOutlinedIcon />, color: "var(--color-primary)" },
    { id: "transport", title: "यातायात / Transport", subTitle: "मार्ग और वाहन / Routes & Vehicles", icon: <DirectionsBusOutlinedIcon />, color: "var(--color-primary)" },
    { id: "hostels", title: "हॉस्टल / Hostels", subTitle: "आवास / Accommodation", icon: <DomainOutlinedIcon />, color: "var(--color-primary)" },
    { id: "it", title: "आईटी / IT Infrastructure", subTitle: "नेटवर्क और लैब / Networks & Labs", icon: <HubIcon />, color: "var(--color-primary)" },
  ]
};

export default function InstitutePage() {
  const { profile, loading: actualProfileLoading } = useProfile();

  const profileLoading = actualProfileLoading;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useAccessibility();
  const { t } = useTranslation();

  const categoryQuery = searchParams.get('category');

  const [activeCategoryState, setActiveCategoryState] = React.useState(categoryQuery || null);
  const [navigatingTo, setNavigatingTo] = React.useState(null);
  const [isInstituteModalOpen, setInstituteModalOpen] = React.useState(false);
  const cardsRef = React.useRef(null);

  React.useEffect(() => {
    setActiveCategoryState(categoryQuery || null);
  }, [categoryQuery]);

  const activeCategory = activeCategoryState;

  const setActiveCategory = (category) => {
    setActiveCategoryState(category);
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const isManagement = profile?.role === 'institute' || profile?.role === 'organisation';

  const [userApplications, setUserApplications] = React.useState([]);
  const [loadingApps, setLoadingApps] = React.useState(false);
  const [dynamicInstitute, setDynamicInstitute] = React.useState(null);

  React.useEffect(() => {
    const approvedApp = userApplications?.find(app => app.status === 'approved' || app.status === 'enrolled');
    if (approvedApp && !profile?.institution_name) {
      apiClient.get(`/public/institutes`).then(res => {
        const institutes = res.data?.institutes || res.data || [];
        const matchedInstitute = institutes.find(inst => inst.id === (approvedApp.institute_id || approvedApp.instituteId)) || institutes[0];
        if (matchedInstitute) setDynamicInstitute(matchedInstitute);
      }).catch(err => console.error(err));
    }
  }, [userApplications, profile?.institution_name]);

  const hasApprovedApp = userApplications?.some(app => app.status === 'approved' || app.status === 'enrolled');
  const hasJoinedInstitute = !!profile?.institution_name || hasApprovedApp;

  // An organisation is only set up if it has an institution_name. The admin's personal full_name doesn't count.
  const hasSetupOrganization = !!profile?.institution_name;

  const showStudentEmptyState = !profileLoading && !isManagement && !hasJoinedInstitute;
  const showManagementEmptyState = !profileLoading && isManagement && !hasSetupOrganization;
  const showEmptyState = showStudentEmptyState || showManagementEmptyState;

  React.useEffect(() => {
    if (profile?.id && !isManagement) {
      setLoadingApps(true);
      getUserApplications(profile.id)
        .then(data => {
          if (data && data.applications) {
            setUserApplications(data.applications);
          } else if (Array.isArray(data)) {
            setUserApplications(data);
          }
        })
        .catch(err => console.error("Failed to load applications:", err))
        .finally(() => setLoadingApps(false));
    }
  }, [profile?.id, isManagement]);

  const modulesToShow = isManagement
    ? (activeCategory ? managementSubModules[activeCategory] : managementModules)
    : instituteModules;

  let displayTitle = "";
  let displaySubtitle = "";

  if (showManagementEmptyState) {
    displayTitle = language === 'en' ? "Organization Setup" : "संस्थान सेटअप";
    displaySubtitle = language === 'en' ? "Complete your profile" : "अपनी प्रोफ़ाइल पूरी करें";
  } else if (showStudentEmptyState) {
    displayTitle = profile?.full_name || profile?.username || "Student Portal";
    displaySubtitle = language === 'en' ? "Welcome to Tarang Portal" : "तरंग पोर्टल में आपका स्वागत है";
  } else {
    const rawName = profile?.institution_name || dynamicInstitute?.institution_name || dynamicInstitute?.full_name || dynamicInstitute?.name || dynamicInstitute?.username || "";
    const { localName, englishName } = parseBilingualName(rawName);

    const locationParts = profile?.location ? profile.location.split(', ') : [];
    const country = locationParts.length > 1 ? locationParts[locationParts.length - 1] : "भारत";
    const countryData = gazeteer.Countries.find(c => c.name.toLowerCase() === country.toLowerCase() || (country === "भारत" && c.code === "IN"));
    const nationalLang = countryData ? (Array.isArray(countryData.officialLang) ? countryData.officialLang[0] : countryData.officialLang) : "hi";

    const stateLang = language || 'en';

    const defaultLang1 = getNoNamePlaceholder(stateLang);
    let defaultLang2 = getNoNamePlaceholder(nationalLang);

    if (defaultLang1 === defaultLang2) {
      defaultLang2 = stateLang === 'en' ? getNoNamePlaceholder('hi') : getNoNamePlaceholder('en');
    }

    if (localName && englishName) {
      displayTitle = localName;
      displaySubtitle = englishName;
    } else if (localName || englishName) {
      const nameStr = localName || englishName;
      const isEnglish = /^[A-Za-z0-9\s.,&'()\-]+$/.test(nameStr);
      if (isEnglish && stateLang !== 'en' && nationalLang === 'en') {
        displayTitle = defaultLang1;
        displaySubtitle = nameStr;
      } else {
        displayTitle = nameStr;
        displaySubtitle = defaultLang2;
      }
    } else {
      displayTitle = defaultLang1;
      displaySubtitle = defaultLang2;
    }
  }

  const getTranslatedText = (text) => {
    if (!text) return "";
    const parts = text.split(' / ');
    if (parts.length > 1 && language === 'en') return parts[1].trim();
    return parts[0].trim();
  };

  const rawInstituteName = profile?.institution_name || profile?.full_name || profile?.username || "Institute";
  const breadcrumbInstituteName = formatBreadcrumbName(rawInstituteName);
  const baseBreadcrumbs = [
    {
      labelEn: 'Home',
      labelHi: 'गृह',
      onClick: activeCategory ? () => router.push('/dashboard/home/institute') : undefined
    }
  ];

  const dynamicBreadcrumbs = isManagement && activeCategory ? (() => {
    const title = managementModules.find(m => m.id === activeCategory)?.title || "";
    const parts = title.split(/\s*\/\s*/);
    return [
      ...baseBreadcrumbs,
      {
        labelEn: parts.length > 1 ? parts[1].trim() : title,
        labelHi: parts[0]?.trim() || title
      }
    ];
  })() : baseBreadcrumbs;

  useBreadcrumbs(dynamicBreadcrumbs);

  const isTrulyEmpty = showManagementEmptyState || (showStudentEmptyState && userApplications.length === 0);

  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 72px)", overflowX: "hidden", overflowY: "auto", bgcolor: "transparent", mt: "-1px" }}>
      <UniversalHero
        {...getHeroPropsFromProfile(profile, language)}
        title={displayTitle}
        subtitle={displaySubtitle}
        bannerUrl={(!showEmptyState && (dynamicInstitute?.banner_url || profile?.banner_url)) || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2000"}
        avatarUrl={!showEmptyState ? (dynamicInstitute?.profile_pic_url || profile?.profile_pic_url || undefined) : undefined}
        loading={profileLoading}
        hideAvatar={isTrulyEmpty}
        hideContent={isTrulyEmpty}
        fadeAnchorRef={cardsRef}
        showSpacer={!isTrulyEmpty}
      />

      <Container maxWidth="xl" sx={{
        position: "relative",
        zIndex: 1,
        pb: isTrulyEmpty ? 0 : 10,
        px: { xs: 3, md: 6, lg: 8 },
        ...(isTrulyEmpty && {
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 6
        })
      }}>
        {/* ─── MODULE GRID ─── */}
        {showEmptyState ? (
          <Box ref={cardsRef} sx={{ width: 'var(--size-full)', display: 'flex', flexDirection: 'column' }}>
            {showManagementEmptyState ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: 'var(--size-full)' }}>
                <EmptyState
                  title={language === 'en' ? "Setup Your Organization" : "अपना संस्थान सेट करें"}
                  subtitle={language === 'en'
                    ? "Your organization profile is not set up yet. Create your institute profile to get started."
                    : "आपके संस्थान की प्रोफ़ाइल अभी सेट नहीं हुई है। शुरू करने के लिए अपना संस्थान बनाएं।"}
                  actionLabel={language === 'en' ? "Create Institute" : "संस्थान बनाएं"}
                  actionIcon={
                    <AddCircleOutlineIcon sx={{ fontSize: 20 }} />
                  }
                  onAction={() => setInstituteModalOpen(true)}
                />
              </Box>
            ) : showStudentEmptyState && userApplications.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: 'var(--size-full)' }}>
                <EmptyState
                  title={language === 'en' ? "No Institute Joined" : "कोई संस्थान नहीं जुड़ा"}
                  subtitle={language === 'en'
                    ? "You haven't joined any institute yet. Connect with your educational institution to access your dashboard, courses, and resources."
                    : "आप अभी तक किसी भी संस्थान से नहीं जुड़े हैं। अपने डैशबोर्ड, पाठ्यक्रम और संसाधनों तक पहुंचने के लिए अपने शैक्षणिक संस्थान से जुड़ें।"}
                  actionLabel={language === 'en' ? "Explore Institutes" : "संस्थान खोजें"}
                  actionIcon={
                    <ExploreIcon sx={{ fontSize: 20 }} />
                  }
                  onAction={() => router.push('/dashboard/explore')}
                />
              </Box>
            ) : (
              <Box sx={{ width: 'var(--size-full)' }}>
                <Grid container spacing={3}>
                  {userApplications.map((app) => (
                    <Grid item xs={12} sm={6} md={4} key={app.id}>
                      <PremiumCard
                        onClick={() => {
                          const url = `/dashboard/explore/${app.institute_username || 'institute'}/admission/${app.program_id}?appId=${app.id}`;
                          router.push(url);
                        }}
                        sx={{
                          cursor: "pointer",
                        }}
                      >
                        <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: 'rgba(0, 86, 179, 0.1)', color: 'var(--color-primary)', width: 48, height: 48 }}>
                                <AssignmentTurnedInOutlinedIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', lineHeight: 1.2, mb: 0.5 }}>
                                  Application #{app.id ? (parseInt(app.id.substring(0, 8), 16) % 90000 + 10000) : '00000'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'var(--color-slate-500)', fontWeight: 'var(--font-semibold)' }}>
                                  {new Date(app.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label={app.status?.replace(/_/g, ' ')}
                              size="small"
                              sx={{
                                fontWeight: 'var(--font-bold)',
                                textTransform: 'capitalize',
                                bgcolor: app.status === 'approved' ? 'var(--color-slate-200)' : app.status === 'rejected' ? 'var(--color-slate-200)' : 'var(--color-slate-200)',
                                color: app.status === 'approved' ? 'var(--color-slate-700)' : app.status === 'rejected' ? 'var(--color-error)' : 'var(--color-error)',
                                px: 1,
                                height: 26
                              }}
                            />
                          </Box>
                        </CardContent>
                      </PremiumCard>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            ref={cardsRef}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 2.5
            }}
          >
            <AnimatePresence mode="popLayout">
              {profileLoading ? (
                Array.from(new Array(4)).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    style={{ height: "var(--size-full)", width: "var(--size-full)" }}
                  >
                    <PremiumCard
                      disableHover
                      sx={{
                        height: "var(--size-full)",
                        width: "var(--size-full)",
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        gap: 2
                      }}
                    >
                      <Box className="MuiSkeleton-root" sx={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', flexShrink: 0 }} />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" noWrap sx={{ lineHeight: 1.5, mb: 0.5, fontSize: 'var(--font-base)', py: 0.5, display: 'flex', alignItems: 'center' }}>
                          <Box className="MuiSkeleton-root" sx={{ width: "70%", height: 18, borderRadius: 'var(--radius-sm)' }} />
                        </Typography>
                        <Typography variant="caption" noWrap sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box className="MuiSkeleton-root" sx={{ width: "55%", height: 14, borderRadius: 'var(--radius-sm)' }} />
                        </Typography>
                      </Box>
                      <Box className="MuiSkeleton-root" sx={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0 }} />
                    </PremiumCard>
                  </motion.div>
                ))
              ) : (
                modulesToShow.map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    style={{ height: "var(--size-full)", width: "var(--size-full)" }}
                  >
                    <Card
                      onClick={() => {
                        if (isManagement && !activeCategory) {
                          setActiveCategory(module.id);
                        } else if (isManagement && activeCategory) {
                          if (module.id === 'curriculum') {
                            setNavigatingTo(module.id);
                            router.push('/dashboard/home/institute/courses');
                          } else if (module.id === 'admissions') {
                            setNavigatingTo(module.id);
                            router.push('/dashboard/home/institute/admissions');
                          }
                        }
                      }}
                      sx={{
                        height: "var(--size-full)",
                        width: "var(--size-full)",
                        transition: "var(--transition-slow)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        "&:hover": {
                          transform: 'translateY(-4px)',
                          "& .module-icon": {
                            bgcolor: "transparent",
                            color: module.color,
                            transform: "scale(1.1)"
                          },
                          "& .arrow-icon": {
                            transform: "translateX(4px)",
                            color: module.color
                          }
                        }
                      }}
                    >
                      {/* Icon */}
                      <Box
                        className="module-icon"
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 'var(--radius-lg)',
                          bgcolor: "transparent",
                          color: module.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "var(--transition-slow)",
                          flexShrink: 0,
                          mr: 2
                        }}
                      >
                        {React.cloneElement(module.icon, { sx: { fontSize: 24 } })}
                      </Box>

                      {/* Text */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800, color: "var(--color-slate-900)", lineHeight: 1.5, mb: 0.5, fontSize: 'var(--font-base)', py: 0.5 }}>
                          {getTranslatedText(module.title)}
                        </Typography>
                        <Typography variant="caption" noWrap sx={{ color: "var(--color-slate-500)", fontWeight: 'var(--font-medium)', display: "block" }}>
                          {getTranslatedText(module.subTitle)}
                        </Typography>
                      </Box>

                      {/* Arrow or Loader */}
                      {navigatingTo === module.id ? (
                        <CircularProgress size={16} sx={{ color: module.color, ml: 1 }} />
                      ) : (
                        <ArrowForwardIosIcon
                          className="arrow-icon"
                          sx={{
                            fontSize: 14,
                            color: "var(--color-slate-200)",
                            transition: "var(--transition-slow)",
                            ml: 1
                          }}
                        />
                      )}
                    </Card>
                  </motion.div>
                )))}
            </AnimatePresence>
          </Box>
        )}


      </Container>

      {isInstituteModalOpen && profile && (
        <InstituteSetupModal
          profile={profile}
          onClose={() => setInstituteModalOpen(false)}
        />
      )}
    </Box>
  );
}
