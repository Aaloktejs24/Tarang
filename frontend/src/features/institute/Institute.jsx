/* eslint-disable */
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
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import DirectionsBusOutlinedIcon from '@mui/icons-material/DirectionsBusOutlined';
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import DomainOutlinedIcon from "@mui/icons-material/DomainOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useProfile } from "../../hooks/useProfile";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import { useTranslation } from "../../hooks/useTranslation";
import UniversalHero from '../../components/hero/UniversalHero';
import { capitalizeFirstLetter, getAcronym, formatBreadcrumbName } from "../../utils/stringUtils";
import { getHeroPropsFromProfile } from '../../utils/heroUtils';
import { useBreadcrumbs } from "../../contexts/BreadcrumbContext";

const instituteModules = [
  {
    id: "academic", title: "शैक्षणिक / Academic", subTitle: "Classes & Curriculum", icon: <SchoolOutlinedIcon />, color: "#0056b3",
    description: "कक्षाओं का कार्यक्रम, पाठ्यक्रम और शैक्षणिक कैलेंडर देखें।", updates: "Ongoing", admin: "Dean Office",
    img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "fees", title: "शुल्क / Fees", subTitle: "Payments & Dues", icon: <PaymentOutlinedIcon />, color: "#0056b3",
    description: "ऑनलाइन शुल्क भुगतान, रसीद डाउनलोड और बकाया विवरण की जांच करें।", updates: "Due Soon", admin: "Accounts",
    img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "library", title: "पुस्तकालय / Library", subTitle: "Books & Resources", icon: <LocalLibraryOutlinedIcon />, color: "#0056b3",
    description: "ई-पुस्तकें खोजें, किताबें जारी करें और पत्रिकाओं तक पहुंचें।", updates: "12 New", admin: "Librarian",
    img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "transport", title: "यातायात / Transport", subTitle: "Routes & Timings", icon: <DirectionsBusOutlinedIcon />, color: "#0056b3",
    description: "संस्थान बस और ई-रिक्शा का समय और मार्ग।", updates: "On Time", admin: "Transport Cell",
    img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "hostels", title: "हॉस्टल / Hostels", subTitle: "Accommodation", icon: <RestaurantOutlinedIcon />, color: "#0056b3",
    description: "आवास प्रबंधन, मेस मेनू और हॉस्टल शिकायत पोर्टल।", updates: "Menu Up", admin: "Warden",
    img: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "exams", title: "परीक्षा / Exams", subTitle: "Results & Admit Cards", icon: <AssignmentTurnedInOutlinedIcon />, color: "#0056b3",
    description: "अपने हालिया परीक्षा परिणाम और ग्रेडिंग विवरण सुरक्षित रूप से देखें।", updates: "Results Out", admin: "Exam Cell",
    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "notice-board", title: "सूचना / Notice Board", subTitle: "Announcements", icon: <CampaignOutlinedIcon />, color: "#0056b3",
    description: "संस्थान की नवीनतम घोषणाएं और महत्वपूर्ण सूचनाएं प्राप्त करें।", updates: "3 New", admin: "Admin Block",
    img: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "placements", title: "प्लेसमेंट / Placements", subTitle: "Career Opportunities", icon: <WorkOutlineOutlinedIcon />, color: "#0056b3",
    description: "करियर अवसर, कंपनी प्रोफाइल और आवेदन प्रक्रिया देखें।", updates: "2 Drives", admin: "CDPC",
    img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "support", title: "सहायता / Support", subTitle: "Helpdesk & Contact", icon: <ContactSupportOutlinedIcon />, color: "#0056b3",
    description: "अधिकारियों से संपर्क और शिकायत निवारण पोर्टल।", updates: "Online", admin: "Registrar",
    img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800"
  },
];

const managementModules = [
  {
    id: "student_affairs", title: "छात्र मामले / Student Affairs", subTitle: "कल्याण और गतिविधियां / Welfare & Activities", icon: <PeopleOutlinedIcon />, color: "#1e4fa3",
    description: "Manage student welfare, counseling, and extracurricular activities."
  },
  {
    id: "academic_affairs", title: "शैक्षणिक मामले / Academic Affairs", subTitle: "पाठ्यक्रम और नीतियां / Curriculum & Policies", icon: <FactCheckOutlinedIcon />, color: "#1e4fa3",
    description: "Manage curriculum, academic policies, and examinations."
  },
  {
    id: "administration", title: "प्रशासन / Administration", subTitle: "परिसर संचालन / Campus Operations", icon: <BadgeOutlinedIcon />, color: "#1e4fa3",
    description: "Manage staff, infrastructure, and institutional operations."
  },
  {
    id: "resources", title: "संसाधन / Resources", subTitle: "सुविधाएं और संपत्तियां / Facilities & Assets", icon: <DomainOutlinedIcon />, color: "#1e4fa3",
    description: "Manage campus resources, facilities, and physical assets."
  }
];

const managementSubModules = {
  student_affairs: [
    { id: "admissions", title: "नामांकन / Admissions", subTitle: "नए नामांकन / New Enrollments", icon: <PeopleOutlinedIcon />, color: "#1e4fa3" },
    { id: "attendance", title: "उपस्थिति / Attendance", subTitle: "छात्र रिकॉर्ड / Student Records", icon: <FactCheckOutlinedIcon />, color: "#1e4fa3" },
    { id: "discipline", title: "अनुशासन / Discipline", subTitle: "कल्याण और आचरण / Welfare & Conduct", icon: <BadgeOutlinedIcon />, color: "#1e4fa3" },
    { id: "activities", title: "गतिविधियां / Activities", subTitle: "पाठ्येतर गतिविधियां / Extracurriculars", icon: <CampaignOutlinedIcon />, color: "#1e4fa3" },
  ],
  academic_affairs: [
    { id: "curriculum", title: "पाठ्यक्रम / Curriculum", subTitle: "विषय और पाठ्यक्रम / Subjects & Syllabi", icon: <SchoolOutlinedIcon />, color: "#1e4fa3" },
    { id: "exams", title: "परीक्षा / Examinations", subTitle: "समय-निर्धारण / Scheduling", icon: <FactCheckOutlinedIcon />, color: "#1e4fa3" },
    { id: "results", title: "परिणाम / Results", subTitle: "ग्रेडिंग प्रणाली / Grading System", icon: <AnalyticsOutlinedIcon />, color: "#1e4fa3" },
    { id: "timetable", title: "समय सारणी / Timetable", subTitle: "कक्षा अनुसूची / Class Schedule", icon: <DomainOutlinedIcon />, color: "#1e4fa3" },
  ],
  administration: [
    { id: "staff", title: "कर्मचारी / Faculty & Staff", subTitle: "प्रोफ़ाइल और रिकॉर्ड / Profiles & Records", icon: <BadgeOutlinedIcon />, color: "#1e4fa3" },
    { id: "payroll", title: "पेरोल / Payroll & Leaves", subTitle: "वेतन और उपस्थिति / Salary & Attendance", icon: <AccountBalanceWalletOutlinedIcon />, color: "#1e4fa3" },
    { id: "notices", title: "सूचनाएं / Notices", subTitle: "परिपत्र / Circulars", icon: <CampaignOutlinedIcon />, color: "#1e4fa3" },
    { id: "settings", title: "सेटिंग्स / Settings", subTitle: "संस्थान प्रोफ़ाइल / Institute Profile", icon: <SettingsOutlinedIcon />, color: "#1e4fa3" },
  ],
  resources: [
    { id: "library", title: "पुस्तकालय / Library", subTitle: "पुस्तकें और पत्रिकाएं / Books & Journals", icon: <LocalLibraryOutlinedIcon />, color: "#1e4fa3" },
    { id: "transport", title: "यातायात / Transport", subTitle: "मार्ग और वाहन / Routes & Vehicles", icon: <DirectionsBusOutlinedIcon />, color: "#1e4fa3" },
    { id: "hostels", title: "हॉस्टल / Hostels", subTitle: "आवास / Accommodation", icon: <DomainOutlinedIcon />, color: "#1e4fa3" },
    { id: "it", title: "आईटी / IT Infrastructure", subTitle: "नेटवर्क और लैब / Networks & Labs", icon: <HubIcon />, color: "#1e4fa3" },
  ]
};

export default function InstitutePage() {
  const { profile, loading: profileLoading } = useProfile();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useAccessibility();
  const { t } = useTranslation();

  const categoryQuery = searchParams.get('category');

  const [activeCategoryState, setActiveCategoryState] = React.useState(categoryQuery || null);
  const [navigatingTo, setNavigatingTo] = React.useState(null);
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
  const hasJoinedInstitute = !!profile?.institution_name;
  const showEmptyState = !profileLoading && !isManagement && !hasJoinedInstitute;

  const modulesToShow = isManagement
    ? (activeCategory ? managementSubModules[activeCategory] : managementModules)
    : instituteModules;

  const displayTitle = showEmptyState
    ? (profile?.full_name || profile?.username || "Student Portal")
    : (profile?.full_name || profile?.institution_name || profile?.username || "Institute");

  const displaySubtitle = showEmptyState
    ? (language === 'en' ? "Welcome to Tarang Portal" : "तरंग पोर्टल में आपका स्वागत है")
    : "";

  const getTranslatedText = (text) => {
    if (!text) return "";
    const parts = text.split(' / ');
    if (parts.length > 1 && language === 'en') return parts[1].trim();
    return parts[0].trim();
  };

  const rawInstituteName = profile?.full_name || profile?.institution_name || profile?.username || "Institute";
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

  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 72px)", overflow: "hidden", bgcolor: "transparent", mt: "-1px" }}>
      {/* HERO SECTION */}
      <UniversalHero
        {...getHeroPropsFromProfile(profile, language)}
        loading={profileLoading}
        hideAvatar={showEmptyState}
        hideContent={showEmptyState}
        fadeAnchorRef={cardsRef}
        showSpacer={!showEmptyState}
      />

      <Container maxWidth="xl" sx={{
        position: "relative",
        zIndex: 1,
        pb: showEmptyState ? 0 : 10,
        px: { xs: 2, md: 4 },
        ...(showEmptyState && {
          height: "calc(100vh - 72px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        })
      }}>
        {/* ─── MODULE GRID ─── */}
        {showEmptyState ? (
          <Box ref={cardsRef}>
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
                Array.from(new Array(8)).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        width: "100%",
                        borderRadius: "16px",
                        background: "rgba(255, 255, 255, 0.3)",
                        backdropFilter: "blur(30px)",
                        WebkitBackdropFilter: "blur(30px)",
                        border: "1px solid rgba(30, 79, 163, 0.2)",
                        boxShadow: "none",
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                      }}
                    >
                      <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2, flexShrink: 0 }} />
                      <Box sx={{ width: '100%' }}>
                        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 0.5 }} />
                        <Skeleton variant="text" width="80%" height={16} />
                      </Box>
                    </Card>
                  </motion.div>
                ))
              ) : (
                modulesToShow.map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    style={{ height: "100%", width: "100%" }}
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
                      height: "100%",
                      width: "100%",
                      borderRadius: "16px",
                      background: "rgba(255, 255, 255, 0.3)",
                      backdropFilter: "blur(30px)",
                      WebkitBackdropFilter: "blur(30px)",
                      border: "1px solid rgba(30, 79, 163, 0.2)",
                      boxShadow: "none",
                      transition: "all 0.3s ease",
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
                        borderRadius: "12px",
                        bgcolor: "transparent",
                        color: module.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                        flexShrink: 0,
                        mr: 2
                      }}
                    >
                      {React.cloneElement(module.icon, { sx: { fontSize: 24 } })}
                    </Box>

                    {/* Text */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.5, mb: 0.5, fontSize: "0.95rem", py: 0.5 }}>
                        {getTranslatedText(module.title)}
                      </Typography>
                      <Typography variant="caption" noWrap sx={{ color: "#475569", fontWeight: 500, display: "block" }}>
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
                          color: "#cbd5e1",
                          transition: "all 0.3s ease",
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
    </Box>
  );
}
