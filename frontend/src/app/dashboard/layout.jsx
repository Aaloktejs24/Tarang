"use client";

import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { Box, SpeedDial, SpeedDialIcon, SpeedDialAction, Fab, Grid } from "@mui/material";

import SchoolIcon from "@mui/icons-material/School";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FilterListIcon from '@mui/icons-material/FilterList';
import InstituteSkeleton from "../../features/institute/InstituteSkeleton";
import ExploreLoading from "./explore/loading";
import FeedSkeleton from "../../features/feed/FeedSkeleton";
import ProfileSkeleton from "../../features/profile/ProfileSkeleton";
import InstituteProfileSkeleton from "../../features/profile/InstituteProfileSkeleton";

import { usePathname } from "next/navigation";
import { useAppRouter } from "../../hooks/useAppRouter";;
import Link from "next/link";
import { BreadcrumbProvider, useBreadcrumbs } from "../../contexts/BreadcrumbContext";
import ProjectBreadcrumbs from "../../components/ui/ProjectBreadcrumbs";
import Loader from "../../components/common/Loader";

const GlobalBreadcrumbs = () => {
  const { breadcrumbs } = useBreadcrumbs();
  return <ProjectBreadcrumbs items={breadcrumbs} floating={true} />;
};

export default function DashboardLayout({ children }) {
  const router = useAppRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth(true);

  const isLoading = authLoading;
  const pathname = usePathname();

  const { profile, loading: profileLoading } = useProfile();

  const isSetupPage = pathname === "/dashboard/home/setup";
  const hideLayoutExtras = isSetupPage && profile && !profile.is_profile_completed;

  if (isLoading) {
    let SkeletonComponent = null;

    const isInstituteProfilePage = pathname === "/dashboard/home/institute-profile";
    const isProfilePage = pathname === "/dashboard/home/profile";
    const isExploreInstitutePage = /^\/dashboard\/explore\/[^/]+$/.test(pathname || "");
    const isInstitutePage = pathname === "/dashboard/home/institute" || isExploreInstitutePage;
    const isFeedPage = pathname === "/dashboard/home/feed";

    if (isInstituteProfilePage) {
      SkeletonComponent = InstituteProfileSkeleton;
    } else if (isProfilePage) {
      SkeletonComponent = ProfileSkeleton;
    } else if (isInstitutePage) {
      SkeletonComponent = InstituteSkeleton;
    } else if (pathname === "/dashboard/explore") {
      SkeletonComponent = ExploreLoading;
    } else if (isFeedPage) {
      SkeletonComponent = FeedSkeleton;
    }

    return (
      <>
        {!hideLayoutExtras && <Navbar />}
        <Box className={!hideLayoutExtras ? "user-content margin-top-72" : ""}>
          {SkeletonComponent ? <SkeletonComponent hideLayoutExtras={hideLayoutExtras} /> : children}
        </Box>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <Loader />
    );
  }

  const isManagement = profile?.role === 'institute' || profile?.role === 'admin';
  const isTopLevelPage = pathname === "/dashboard/home/institute" || pathname === "/dashboard/home/feed";
  const showViewTabs = !profileLoading && !isManagement && isTopLevelPage;

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
              #f1f5f9
            `
          }} />
          <Navbar />
        </>
      )}
      <Box 
        className={!hideLayoutExtras ? "user-content margin-top-72" : ""}
      >
        <GlobalBreadcrumbs />
        {children}
      </Box>

      {/* ─── GLOBAL DOCK PANNEL - CENTERED ─── */}
      {!hideLayoutExtras && showViewTabs && (
        <Box sx={{
          position: 'fixed',
          bottom: { xs: 24, md: 40 },
          right: { xs: 24, md: 40 },
          display: 'flex',
          alignItems: 'end',
          gap: { xs: 2, md: 3 }, // Increased gap gracefully since the bounding pill visual was detached
          zIndex: 'var(--z-tooltip)',
          pointerEvents: 'none', // ensures the invisible box doesn't block underlying clicks
          '& > *': { pointerEvents: 'auto' } // reinstates physical interaction for the buttons inside it!
        }}>

          {/* Direct Mobile Filter FAB (clubbed externally side-by-side) */}
          {pathname.includes("/feed") && (
            <Fab
              sx={{
                display: { xs: "flex", md: "none" },
                bgcolor: 'var(--color-white)',
                color: 'var(--color-primary)',
                border: '1.5px solid var(--color-slate-200)',
                width: { xs: 56, md: 64 },
                height: { xs: 56, md: 64 },
                '&:hover, &:focus, &:active': { bgcolor: 'var(--color-slate-50)', }
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
                bgcolor: 'var(--color-primary)',
                border: "1.5px solid var(--color-warning)",
                '&:hover, &:focus, &:active': { bgcolor: 'var(--color-primary-hover)', }
              }
            }}
          >
            <SpeedDialAction
              icon={<DynamicFeedIcon sx={{ color: pathname.includes("/feed") ? "var(--color-white)" : "var(--color-primary)" }} />}
              tooltipTitle="फ़ीड"
              tooltipOpen
              onClick={() => {
                router.push('/dashboard/home/feed', { scroll: false });
              }}
              FabProps={{
                sx: {
                  bgcolor: pathname.includes("/feed") ? 'var(--color-success)' : 'var(--color-white)',
                  border: pathname.includes("/feed") ? 'none' : '1.5px solid var(--color-slate-200)',
                  '&:hover, &:focus, &:active': {
                    bgcolor: pathname.includes("/feed") ? 'var(--color-success)' : 'var(--color-slate-50)',
                  }
                }
              }}
            />
            <SpeedDialAction
              icon={<SchoolIcon sx={{ color: pathname.includes("/institute") ? "var(--color-white)" : "var(--color-primary)" }} />}
              tooltipTitle="संस्थान"
              tooltipOpen
              onClick={() => {
                router.push('/dashboard/home/institute', { scroll: false });
              }}
              FabProps={{
                sx: {
                  bgcolor: pathname.includes("/institute") ? 'var(--color-success)' : 'var(--color-white)',
                  border: pathname.includes("/institute") ? 'none' : '1.5px solid var(--color-slate-200)',
                  '&:hover, &:focus, &:active': {
                    bgcolor: pathname.includes("/institute") ? 'var(--color-success)' : 'var(--color-slate-50)',
                  }
                }
              }}
            />
          </SpeedDial>
        </Box>
      )}
    </BreadcrumbProvider>
  );
}

