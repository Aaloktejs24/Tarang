"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppRouter as useRouter } from "../../../../hooks/useAppRouter";
import {
  Box, Typography, Container, Card, Button, Skeleton, Grid
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../../../../lib/apiClient";
import { preserveSignedUrls } from "../../../../utils/imageUtils";
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
import { useTranslation } from '../../../../hooks/useTranslation';
import EmptyState from '../../../../components/ui/EmptyState';
import { DASHBOARD_PAGE_WRAPPER_SX, DASHBOARD_CONTAINER_SX } from '../../../../constants/layout';
import { formatBreadcrumbName } from '../../../../utils/stringUtils';
import UniversalHero from '../../../../components/hero/HeroBanner';
import { getHeroPropsFromProfile } from '../../../../utils/heroUtils';
import { useBreadcrumbs } from "../../../../contexts/BreadcrumbContext";
import InstituteSkeleton from "../../../../features/institute/InstituteSkeleton";

const MotionDiv = motion.div;

export default function InstituteDetails() {
  const { username } = useParams();
  const router = useRouter();
  const { language } = useAccessibility();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardsRef = React.useRef(null);

  const rawInstituteName = profile?.primary_name || profile?.full_name || profile?.username || username;
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

        setProfile(prev => preserveSignedUrls(prev, apiProfile, [
          'profile_pic_url',
          'banner_url',
          'institute_profile.logo_url',
          'institute_profile.banner_url'
        ]));
      } catch {
        setError("Institute not found.");
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfile();
  }, [username]);

  const exploreModules = [
    { id: "about", title: "संस्थान के बारे में / About Institute", subTitle: "Bio & History", icon: <InfoOutlinedIcon />, color: "var(--color-primary)" },
    { id: "programs", title: "प्रोग्राम्स / Top Programs", subTitle: "B.Tech, M.Tech & More", icon: <SchoolOutlinedIcon />, color: "var(--color-primary)" },
    { id: "achievements", title: "उपलब्धियां / Recognitions", subTitle: "Rankings & Awards", icon: <EmojiEventsOutlinedIcon />, color: "var(--color-primary)" },
    { id: "campus", title: "परिसर / Campus & Location", subTitle: profile?.location || "India", icon: <LocationOnOutlinedIcon />, color: "var(--color-primary)" },
    { id: "community", title: "समुदाय / Student Community", subTitle: "Clubs & Societies", icon: <PeopleOutlinedIcon />, color: "var(--color-primary)" },
    { id: "website", title: "वेबसाइट / Official Website", subTitle: "Visit portal", icon: <LanguageOutlinedIcon />, color: "var(--color-primary)" },
    { id: "contact", title: "संपर्क / Contact Us", subTitle: "Email & Phone", icon: <EmailOutlinedIcon />, color: "var(--color-primary)" },
    { id: "courses", title: "कोर्स और फीस / Courses & Fees", subTitle: "UG, PG & Ph.D", icon: <LibraryBooksOutlinedIcon />, color: "var(--color-primary)" },
    { id: "faculty", title: "फैकल्टी / Faculty & Staff", subTitle: "Professors & Mentors", icon: <GroupWorkOutlinedIcon />, color: "var(--color-primary)" },
    { id: "placement", title: "प्लेसमेंट सेल / Placement Cell", subTitle: "Recruiters & Stats", icon: <WorkOutlineOutlinedIcon />, color: "var(--color-primary)" },
    { id: "facilities", title: "सुविधाएं / Facilities", subTitle: "Labs, Hostels & Library", icon: <ApartmentOutlinedIcon />, color: "var(--color-primary)" },
    { id: "alumni", title: "पूर्व छात्र / Alumni Network", subTitle: "Notable Graduates", icon: <Diversity3OutlinedIcon />, color: "var(--color-primary)" },
    { id: "reviews", title: "समीक्षाएं / Reviews & Ratings", subTitle: "Student Feedback", icon: <StarOutlineOutlinedIcon />, color: "var(--color-primary)" },
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
        <Button variant="contained" disableElevation onClick={() => router.push('/dashboard/explore')} sx={{ mt: 3, bgcolor: "var(--color-primary)" }}>Return to Explore</Button>
      </Box>
    );
  }

  return (
    <Box sx={DASHBOARD_PAGE_WRAPPER_SX}>
      <UniversalHero
        {...getHeroPropsFromProfile(profile, language)}
        loading={loading}
        fadeAnchorRef={cardsRef}
      />

      <Container maxWidth={false} sx={DASHBOARD_CONTAINER_SX}>
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
                  height: "var(--size-full)", width: "var(--size-full)", borderRadius: 'var(--radius-lg)',
                  background: 'var(--card-bg)', border: 'var(--border-thin) solid var(--card-border)',
                  display: "flex", alignItems: "center", p: 2, gap: 2
                }}>
                  <Box className="MuiSkeleton-root" sx={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', flexShrink: 0 }} />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" noWrap sx={{ lineHeight: 1.5, mb: 0.5, fontSize: 'var(--font-base)', py: 0.5, display: 'flex', alignItems: 'center' }}>
                      <Box className="MuiSkeleton-root" sx={{ width: "70%", height: 18, borderRadius: 'var(--radius-sm)' }} />
                    </Typography>
                    <Typography variant="caption" noWrap sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box className="MuiSkeleton-root" sx={{ width: "50%", height: 14, borderRadius: 'var(--radius-sm)' }} />
                    </Typography>
                  </Box>
                  <Box className="MuiSkeleton-root" sx={{ width: 14, height: 14, borderRadius: 'var(--radius-full)', flexShrink: 0 }} />
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
                  style={{ height: "var(--size-full)", width: "var(--size-full)" }}
                >
                  <Card
                    onClick={() => { }}
                    sx={{
                      height: "var(--size-full)",
                      width: "var(--size-full)",
                      borderRadius: 'var(--radius-lg)',
                      background: "var(--glass-bg)",
                      backdropFilter: "blur(30px)",
                      WebkitBackdropFilter: "blur(30px)",
                      border: "var(--border-thin) solid rgba(30, 79, 163, 0.2)",
                      transition: "var(--transition-slow)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      p: 2,
                      "&:hover": {
                        border: "var(--border-thin) solid rgba(30, 79, 163, 0.5)",
                        background: "var(--glass-bg)",
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

                    {/* Arrow */}
                    <ArrowForwardIosIcon
                      className="arrow-icon"
                      sx={{
                        fontSize: 14,
                        color: "var(--color-slate-200)",
                        transition: "var(--transition-slow)",
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
      <Box sx={{ position: 'fixed', bottom: { xs: 24, md: 40 }, right: { xs: 24, md: 40 }, zIndex: 'var(--z-sticky)' }}>
        <Button
          variant="contained"
          disableRipple
          onClick={() => router.push(`/dashboard/explore/${username}/admission`)}
          sx={{
            bgcolor: 'var(--color-primary)',
            color: 'var(--color-white)',
            px: { xs: 3, md: 4 },
            py: { xs: 1.2, md: 1.5 },
            borderRadius: 'var(--radius-full)',
            border: '1.5px solid var(--color-warning)',
            textTransform: 'none',
            transition: 'var(--transition-slow)',
            '&:hover, &:focus, &:active': {
              bgcolor: '#004494',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 'var(--font-semibold)', fontSize: { xs: '1rem', md: '1.1rem' } }}>
            {language === 'en' ? 'Take Admission' : 'प्रवेश लें'}
            <SendIcon sx={{ ml: 1, fontSize: '1.3rem' }} />
          </Box>
        </Button>
      </Box>
    </Box>
  );
}
