/* eslint-disable */
"use client";
import React from "react";
import { Box, Typography, Grid, Card, CardContent, Avatar, Button, Container, alpha, Breadcrumbs, Link } from "@mui/material";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import LocalLibraryOutlinedIcon from "@mui/icons-material/LocalLibraryOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
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

const TEXTS = {
  iitKanpur: "IIT Kanpur",
  iitKanpurHindi: "भारतीय प्रौद्योगिकी संस्थान कानपुर",
  iitKanpurEnglishFull: "Indian Institute of Technology Kanpur",
  welcomeEnglish: "Empowering students with seamless access to campus resources, administration, and support services.",
  enterPortal: "Enter Portal",
  portalName: "Tarang Integrated Portal",
  portalDesc: "सभी शैक्षणिक संसाधन अब एक डिजिटल हब में।",
  resources: "RESOURCES",
  students: "STUDENTS",
  support: "SUPPORT"
};

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
  const { profile } = useProfile();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useAccessibility();
  const { t } = useTranslation();
  
  const categoryQuery = searchParams.get('category');
  
  const [textOpacity, setTextOpacity] = React.useState(1);
  const [activeCategoryState, setActiveCategoryState] = React.useState(categoryQuery || null);
  const textRef = React.useRef(null);
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
  const modulesToShow = isManagement 
    ? (activeCategory ? managementSubModules[activeCategory] : managementModules) 
    : instituteModules;
  
  const displayTitle = profile?.institution_name || profile?.full_name || profile?.username || TEXTS.iitKanpur;
  const displaySubtitle = TEXTS.iitKanpurHindi;

  const getTranslatedText = (text) => {
    if (!text) return "";
    const parts = text.split(' / ');
    if (parts.length > 1 && language === 'en') return parts[1].trim();
    return parts[0].trim();
  };

  React.useEffect(() => {
    let rafId;
    const trackPosition = () => {
      if (textRef.current && cardsRef.current) {
        const textRect = textRef.current.getBoundingClientRect();
        const cardsRect = cardsRef.current.getBoundingClientRect();
        
        // Calculate the physical gap between the bottom of the text and the top of the cards
        const gap = cardsRect.top - textRect.bottom;
        
        // We want it to start fading when the gap is around 60px, 
        // and be completely invisible (opacity 0) when gap is 0 or less (touching).
        // If gap is >= 60, opacity is 1. If gap <= 0, opacity is 0.
        const opacity = Math.max(0, Math.min(1, gap / 60));
        
        setTextOpacity(opacity);
      }
      rafId = requestAnimationFrame(trackPosition);
    };
    
    trackPosition();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden", bgcolor: "transparent", mt: "-1px" }}>
      {/* ─── FIXED BACKGROUND LAYER ─── */}
      <Box
        sx={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: -1,
          background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.55) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.4) 0, transparent 50%), 
            radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.3) 0, transparent 50%),
            radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.3) 0, transparent 50%),
            #eef2f6
          `
        }}
      >
        <Box sx={{ position: "absolute", width: "50vw", height: "50vw", top: "-10%", left: "-10%", background: "rgba(16, 185, 129, 0.05)", filter: "blur(120px)", borderRadius: "50%", pointerEvents: "none" }} />
      </Box>

      {/* ─── ENHANCED HERO SECTION WITH INSTITUTE PHOTO (FULL WIDTH) ─── */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 0,
          width: "100%",
          height: { xs: "55vh", md: "75vh" },
          minHeight: "450px",
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden"
        }}
      >
        {/* Background Institute Image */}
        <Box sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=2500")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "scale(1.05)",
          transition: "transform 15s ease-out",
          "&:hover": { transform: "scale(1.1)" },
          maskImage: "linear-gradient(to bottom, black 0%, black 20%, rgba(0,0,0,0.3) 60%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 20%, rgba(0,0,0,0.3) 60%, transparent 90%)"
        }} />

        {/* Subtle Gradient Overlay for Text Readability */}
        <Box sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0) 100%)",
          maskImage: "linear-gradient(to bottom, black 0%, black 20%, rgba(0,0,0,0.3) 60%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 20%, rgba(0,0,0,0.3) 60%, transparent 90%)",
          pointerEvents: "none"
        }} />

        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, pb: { xs: 6, md: 10 }, px: { xs: 3, md: 5 } }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ maxWidth: "1200px", width: "100%" }}
          >
            <motion.div ref={textRef} style={{ opacity: textOpacity, position: 'relative' }}>
              <Typography
                variant="h1"
                sx={{
                  fontFamily: "'Rozha One', serif",
                  fontSize: { xs: "2rem", md: "4rem" },
                  mb: 2,
                  lineHeight: 1.1,
                  background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0px 10px 40px rgba(255, 255, 255, 0.25)"
                }}
              >
                <span style={{ display: 'block' }}>{displayTitle}</span>
                <Box component="span" sx={{ display: 'block', marginTop: '8px', whiteSpace: { md: 'nowrap', xs: 'normal' } }}>
                  {displaySubtitle}
                </Box>
              </Typography>

              <Box sx={{ position: 'absolute', top: '100%', left: 0, width: '100%', mt: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  onClick={() => router.push('/dashboard/home')}
                  sx={{ 
                    color: activeCategory ? '#64748b' : '#0f172a', 
                    fontWeight: 700, 
                    fontSize: "1.2rem", 
                    cursor: 'pointer', 
                    '&:hover': { color: activeCategory ? '#0056b3' : '#0f172a' } 
                  }}
                >
                  {language === 'en' ? 'Dashboard' : 'डैशबोर्ड'}
                </Typography>
                <Typography sx={{ color: '#334155', fontWeight: 900, fontSize: "1.2rem" }}>/</Typography>

                <AnimatePresence>
                  {isManagement && activeCategory && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Typography 
                        sx={{ color: '#0f172a', fontWeight: 700, fontSize: "1.2rem", cursor: 'pointer' }} 
                        onClick={() => setActiveCategory(null)}
                      >
                        {getTranslatedText(managementModules.find(m => m.id === activeCategory)?.title)}
                      </Typography>
                      <Typography sx={{ color: '#334155', fontWeight: 900, fontSize: "1.2rem" }}>/</Typography>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </motion.div>
          </motion.div>
        </Container>
      </Box>

        <Box sx={{ 
          width: "100%", 
          height: { xs: "55vh", md: "75vh" }, 
          minHeight: "450px",
          mb: { xs: -8, md: -16 } 
        }} />   

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, pb: 10, px: { xs: 2, md: 4 } }}>
        {/* ─── BREADCRUMB MOVED TO FIXED HERO SECTION ─── */}

        {/* ─── MODULE GRID ─── */}
        <Box 
          ref={cardsRef}
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, 
            gap: 2.5 
          }}
        >
          <AnimatePresence mode="popLayout">
            {modulesToShow.map((module, index) => (
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
                        router.push('/dashboard/home/institute/courses');
                      } else if (module.id === 'admissions') {
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
                    "&:hover": { border: "1px solid rgba(30, 79, 163, 0.5)",
                      background: "rgba(255, 255, 255, 0.45)",
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

                  {/* Arrow */}
                  <ArrowForwardIosIcon 
                    className="arrow-icon"
                    sx={{ 
                      fontSize: 14, 
                      color: "#cbd5e1", 
                      transition: "all 0.3s ease",
                      ml: 1
                    }} 
                  />
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>


      </Container>
    </Box>
  );
}
