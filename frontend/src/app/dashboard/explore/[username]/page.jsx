"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppRouter as useRouter } from "../../../../hooks/useAppRouter";
import {
  Box, Typography, Container, Card, Button, Skeleton, Grid
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../../../../lib/apiClient";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SendIcon from '@mui/icons-material/Send';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import { useAccessibility } from '../../../../contexts/AccessibilityContext';
import { getAcronym, capitalizeFirstLetter, formatBreadcrumbName } from '../../../../utils/stringUtils';
import UniversalHero from '../../../../components/hero/UniversalHero';
import { getHeroPropsFromProfile } from '../../../../utils/heroUtils';
import { useBreadcrumbs } from "../../../../contexts/BreadcrumbContext";

const MotionDiv = motion.div;

export default function InstituteDetails() {
  const { username } = useParams();
  const router = useRouter();
  const { language } = useAccessibility();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardsRef = React.useRef(null);

  const rawInstituteName = profile?.full_name || profile?.institution_name || profile?.username || username;
  const breadcrumbInstituteName = formatBreadcrumbName(rawInstituteName);

  // Auto-manage breadcrumbs
  useBreadcrumbs([
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home') },
    { labelEn: 'Explore', labelHi: 'खोजें', onClick: () => router.push('/dashboard/explore') },
    { label: loading ? '...' : breadcrumbInstituteName }
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get(`/public/profile/${username}`);
        let apiProfile = response.data;

        // Preload banner image to prevent half-baked rendering
        const imgUrl = apiProfile.banner_url || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=2500";
        const img = new Image();
        img.src = imgUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });

        setProfile(apiProfile);
      } catch {
        setError("Institute not found.");
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfile();
  }, [username]);

  const displayTitle = profile ? capitalizeFirstLetter(profile.full_name || profile.username) : '';
  const displaySubtitle = profile ? (profile.nameLocal || profile.nameHindi || "") : '';

  const exploreModules = [
    { id: "about", title: "संस्थान के बारे में / About Institute", subTitle: "Bio & History", icon: <InfoOutlinedIcon />, color: "#0056b3" },
    { id: "programs", title: "प्रोग्राम्स / Top Programs", subTitle: "B.Tech, M.Tech & More", icon: <SchoolOutlinedIcon />, color: "#0056b3" },
    { id: "achievements", title: "उपलब्धियां / Recognitions", subTitle: "Rankings & Awards", icon: <EmojiEventsOutlinedIcon />, color: "#0056b3" },
    { id: "campus", title: "परिसर / Campus & Location", subTitle: profile?.location || "India", icon: <LocationOnOutlinedIcon />, color: "#0056b3" },
    { id: "community", title: "समुदाय / Student Community", subTitle: "Clubs & Societies", icon: <PeopleOutlinedIcon />, color: "#0056b3" },
    { id: "website", title: "वेबसाइट / Official Website", subTitle: "Visit portal", icon: <LanguageOutlinedIcon />, color: "#0056b3" },
    { id: "contact", title: "संपर्क / Contact Us", subTitle: "Email & Phone", icon: <EmailOutlinedIcon />, color: "#0056b3" },
    { id: "courses", title: "कोर्स और फीस / Courses & Fees", subTitle: "UG, PG & Ph.D", icon: <LibraryBooksOutlinedIcon />, color: "#0056b3" },
    { id: "faculty", title: "फैकल्टी / Faculty & Staff", subTitle: "Professors & Mentors", icon: <GroupWorkOutlinedIcon />, color: "#0056b3" },
    { id: "placement", title: "प्लेसमेंट सेल / Placement Cell", subTitle: "Recruiters & Stats", icon: <WorkOutlineOutlinedIcon />, color: "#0056b3" },
    { id: "facilities", title: "सुविधाएं / Facilities", subTitle: "Labs, Hostels & Library", icon: <ApartmentOutlinedIcon />, color: "#0056b3" },
    { id: "alumni", title: "पूर्व छात्र / Alumni Network", subTitle: "Notable Graduates", icon: <Diversity3OutlinedIcon />, color: "#0056b3" },
    { id: "reviews", title: "समीक्षाएं / Reviews & Ratings", subTitle: "Student Feedback", icon: <StarOutlineOutlinedIcon />, color: "#0056b3" },
  ];

  const getTranslatedText = (text) => {
    if (!text) return "";
    const parts = text.split(' / ');
    if (parts.length > 1 && language === 'en') return parts[1].trim();
    return parts[0].trim();
  };

  if (error || (!loading && !profile)) {
    return (
      <Box sx={{ p: 5, textAlign: "center", mt: 10 }}>
        <Typography variant="h5" color="error">{error || "Institute not found"}</Typography>
        <Button variant="contained" disableElevation onClick={() => router.push('/dashboard/explore')} sx={{ mt: 3, bgcolor: "#0056b3" }}>Return to Explore</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 72px)", overflowX: "hidden", bgcolor: "transparent" }}>
      <UniversalHero
        {...getHeroPropsFromProfile(profile, language)}
        loading={loading}
        fadeAnchorRef={cardsRef}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, pb: 10, px: { xs: 3, md: 6, lg: 8 } }}>
        {/* ─── MODULE GRID ─── */}
        <Box
          ref={cardsRef}
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))'
            },
            gap: 2.5
          }}
        >
          {loading ? (
            <>
              {Array.from(new Array(8)).map((_, idx) => (
                <Card key={idx} sx={{
                  height: "100%", width: "100%", borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.3)", backdropFilter: "blur(30px)",
                  border: "1px solid rgba(30, 79, 163, 0.2)", boxShadow: "none",
                  display: "flex", alignItems: "center", p: 2
                }}>
                  <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2, flexShrink: 0 }} />
                  <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={16} />
                  </Box>
                  <Skeleton variant="circular" width={14} height={14} sx={{ ml: 1 }} />
                </Card>
              ))}
            </>
          ) : (
            <AnimatePresence mode="popLayout">
              {exploreModules.map((module, index) => (
                <MotionDiv
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  style={{ height: "100%", width: "100%" }}
                >
                  <Card
                    onClick={() => { }}
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
                        border: "1px solid rgba(30, 79, 163, 0.5)",
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
                </MotionDiv>
              ))}
            </AnimatePresence>
          )}
        </Box>
      </Container>

      {/* Floating Action Button at Bottom Right */}
      <Box sx={{ position: 'fixed', bottom: { xs: 24, md: 40 }, right: { xs: 24, md: 40 }, zIndex: 50 }}>
        <Button
          variant="contained"
          disableRipple
          onClick={() => router.push(`/dashboard/explore/${username}/admission`)}
          sx={{
            bgcolor: '#0056b3 !important',
            color: '#ffffff !important',
            px: { xs: 3, md: 4 },
            py: { xs: 1.2, md: 1.5 },
            borderRadius: '50px',
            border: '1.5px solid #ffc107',
            textTransform: 'none',
            boxShadow: 'none !important',
            transition: 'all 0.3s ease',
            '&:hover, &:focus, &:active': {
              bgcolor: '#004494 !important',
              boxShadow: 'none !important'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: { xs: '1rem', md: '1.1rem' } }}>
            {language === 'en' ? 'Take Admission' : 'प्रवेश लें'}
            <SendIcon sx={{ ml: 1, fontSize: '1.3rem' }} />
          </Box>
        </Button>
      </Box>
    </Box>
  );
}
