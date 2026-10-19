"use client";

import React, { useState } from "react";
import DashboardNavbar from "../../components/navbar/DashboardNavbar";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import Loader from "../../components/common/Loader";
import { Box, SpeedDial, SpeedDialIcon, SpeedDialAction, Fab, Grid, Skeleton } from "@mui/material";

import SchoolIcon from "@mui/icons-material/School";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FilterListIcon from '@mui/icons-material/FilterList';
import SetupOverlay from "../../features/auth/components/SetupOverlay";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { BreadcrumbProvider, useBreadcrumbs } from "../../contexts/BreadcrumbContext";
import ProjectBreadcrumbs from "../../components/ui/ProjectBreadcrumbs";

const GlobalBreadcrumbs = () => {
  const { breadcrumbs } = useBreadcrumbs();
  return <ProjectBreadcrumbs items={breadcrumbs} floating={true} />;
};

export default function DashboardLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth(true);
  const pathname = usePathname();

  const { profile, loading: profileLoading } = useProfile();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevents SSR Hydration mismatch with MUI Box
  }

  const isSetupPage = pathname === "/dashboard/home/setup";
  const hideLayoutExtras = isSetupPage && profile && !profile.is_profile_completed;

  if (isLoading) {
    return (
      <>
        {!hideLayoutExtras && <DashboardNavbar />}
        <Box className={!hideLayoutExtras ? "user-content margin-top-72" : ""} sx={{ p: { xs: 2, md: 4, lg: 6 }, display: 'flex', flexDirection: 'column', gap: 4, minHeight: 'calc(100vh - 72px)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="rounded" width={100} height={40} sx={{ borderRadius: "20px" }} />
          </Box>
          <Grid container spacing={3}>
            {[1, 2, 3].map(i => (
              <Grid key={i} size={{xs: 12, md: 4}}>
                <Skeleton variant="rounded" height={150} sx={{ borderRadius: "16px" }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: "16px", mt: 2 }} />
        </Box>
      </>
    );
  }

  if (!isAuthenticated) return null; // Component won't render while router redirects to /

  const isManagement = profile?.role === 'institute' || profile?.role === 'organisation';
  const showViewTabs = !isManagement && (pathname?.includes("/institute") || pathname?.includes("/feed"));

  return (
    <BreadcrumbProvider>
      {!hideLayoutExtras && (
        <>
          {/* Solid 'bg' blocker behind Navbar (nav -> bg -> image order) */}
          <Box sx={{ 
            position: 'fixed', top: 0, left: 0, right: 0, height: '72px', 
            zIndex: 500, // Below nav (1000), Above image (0)
            backgroundAttachment: "fixed",
            background: `
              radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.55) 0, transparent 50%), 
              radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.4) 0, transparent 50%), 
              radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.3) 0, transparent 50%),
              radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.3) 0, transparent 50%),
              #eef2f6
            `
          }} />
          <DashboardNavbar />
        </>
      )}
      <Box className={!hideLayoutExtras ? "user-content margin-top-72" : ""}>
        <GlobalBreadcrumbs />
        {children}
      </Box>

      {/* Show Profile Setup Overlay if profile is incomplete */}
      {!profileLoading && profile && !profile.is_profile_completed && (
        <SetupOverlay profile={profile} />
      )}

      {/* ─── GLOBAL DOCK PANNEL - CENTERED ─── */}
      {!hideLayoutExtras && showViewTabs && (
        <Box sx={{
          position: 'fixed',
          bottom: { xs: 24, md: 40 },
          right: { xs: 24, md: 40 },
          display: 'flex',
          alignItems: 'end',
          gap: { xs: 2, md: 3 }, // Increased gap gracefully since the bounding pill visual was detached
          zIndex: 1100,
          pointerEvents: 'none', // ensures the invisible box doesn't block underlying clicks
          '& > *': { pointerEvents: 'auto' } // reinstates physical interaction for the buttons inside it!
        }}>
          
          {/* Direct Mobile Filter FAB (clubbed externally side-by-side) */}
          {pathname.includes("/feed") && (
            <Fab 
              sx={{ 
                display: { xs: "flex", md: "none" },
                bgcolor: '#ffffff',
                color: '#0056b3',
                boxShadow: 'none',
                border: '1.5px solid #e2e8f0',
                width: { xs: 56, md: 64 }, 
                height: { xs: 56, md: 64 },
                '&:hover': { bgcolor: '#f8fafc' } 
              }}
              onClick={() => document.dispatchEvent(new Event('open-feed-filter'))}
            >
              <FilterListIcon />
            </Fab>
          )}

          <SpeedDial
            ariaLabel="Tarang View Switcher"
            sx={{ 
              '& .MuiSpeedDial-fab': { width: { xs: 56, md: 64 }, height: { xs: 56, md: 64 }, m: 0 } 
            }}
            icon={<SpeedDialIcon icon={<DashboardIcon />} openIcon={<ExpandMoreIcon />} />}
            direction="up"
            FabProps={{
              sx: {
                bgcolor: '#0056b3',
                boxShadow: 'none',
                border: "1.5px solid #ffc107",
                '&:hover': { bgcolor: '#004494' }
              }
            }}
          >
            <SpeedDialAction
              icon={<DynamicFeedIcon sx={{ color: pathname.includes("/feed") ? "#ffffff" : "#0056b3" }} />}
              tooltipTitle="फ़ीड"
              tooltipOpen
              onClick={() => {
                router.push('/dashboard/home/feed', { scroll: false });
              }}
              FabProps={{
                sx: { 
                  bgcolor: pathname.includes("/feed") ? '#28a745' : '#ffffff',
                  border: pathname.includes("/feed") ? 'none' : '1.5px solid #e2e8f0',
                  '&:hover': { bgcolor: pathname.includes("/feed") ? '#218838' : '#f8fafc' } 
                }
              }}
            />
            <SpeedDialAction
              icon={<SchoolIcon sx={{ color: pathname.includes("/institute") ? "#ffffff" : "#0056b3" }} />}
              tooltipTitle="संस्थान"
              tooltipOpen
              onClick={() => {
                router.push('/dashboard/home/institute', { scroll: false });
              }}
              FabProps={{
                sx: { 
                  bgcolor: pathname.includes("/institute") ? '#28a745' : '#ffffff',
                  border: pathname.includes("/institute") ? 'none' : '1.5px solid #e2e8f0',
                  '&:hover': { bgcolor: pathname.includes("/institute") ? '#218838' : '#f8fafc' } 
                }
              }}
            />
          </SpeedDial>
        </Box>
      )}
    </BreadcrumbProvider>
  );
}

// Triggering recompile
