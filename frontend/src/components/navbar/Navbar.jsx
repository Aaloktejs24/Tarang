"use client";

import React, { useState } from "react";
import { useAppRouter } from '../../hooks/useAppRouter';
import Link from "next/link";
import "../../styles/navbar.css";
import Sidebar from "../sidebar/Sidebar.jsx";
import Qlinks from "../ui/Qlinks.jsx";
import logo from "../../assets/logo.svg";
import indiaFlag from "../../assets/Flag_of_India.svg";
import gazeteer from "../../data/formated/gazeteer.json";
import AccessibleBadges from "../ui/Notification.jsx";
import { logoutUser } from "../../features/auth/authService";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  IconButton, Tooltip, Avatar, Box, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider, Button, Typography
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuIcon from "@mui/icons-material/Menu";
import { Skeleton } from "@mui/material";
import { useProfile } from "../../hooks/useProfile";
import { apiClient } from "../../lib/apiClient";
import { getUserApplications } from "../../features/admission/admissionService";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import { getNoNamePlaceholder, capitalizeFirstLetter } from "../../utils/stringUtils";
import navTranslations from "../../data/landing_navbar.json";

// ---------------------------------------------------------------------------
// Landing variant — center nav links + right login button
// ---------------------------------------------------------------------------
function LandingContent({ onLoginClick, language }) {
  const nt = (key) => {
    const section = navTranslations[key];
    if (!section) return key;
    return section[language] || section["en"] || key;
  };

  const navLinks = [
    { key: "home" },
    { key: "courses" },
    { key: "institutes" },
    { key: "blogs" },
    { key: "events" },
    { key: "contact" },
  ];

  return (
    <>
      {/* Center nav links */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          gap: 4,
          alignItems: "center",
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {navLinks.map((item) => (
          <Box
            key={item.key}
            component="span"
            sx={{
              fontWeight: 'var(--font-semibold)',
              fontSize: 'var(--font-base)',
              color: "var(--color-primary)",
              cursor: "pointer",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -4,
                left: 0,
                width: "0%",
                height: "2px",
                bgcolor: "var(--color-success)",
                transition: "var(--transition-slow)",
              },
              "&:hover::after": { width: "var(--size-full)" },
              "&:hover": { color: "var(--color-success)" },
              transition: "color 0.3s ease",
            }}
          >
            {nt(item.key)}
          </Box>
        ))}
      </Box>

      {/* Right — login button */}
      <div className="accessibility_tools" style={{ gap: "1.5rem", display: "flex", alignItems: "center" }}>
        <Button
          variant="contained"
          disableElevation
          onClick={() => onLoginClick && onLoginClick()}
          sx={{
            bgcolor: "var(--color-success)",
            "&:hover": { bgcolor: "var(--color-success)" },
            px: 4,
            height: "40px",
            fontWeight: "var(--font-bold)",
            fontSize: 'var(--font-base)',
          }}
        >
          {nt("start")}
        </Button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Dashboard variant — user profile, school info, notifications, etc.
// ---------------------------------------------------------------------------
function DashboardContent({ onSidebarOpen, language }) {
  const router = useAppRouter();
  const { profile, loading } = useProfile();
  const [dynamicInstitute, setDynamicInstitute] = React.useState(null);
  const [admittedInstitutes, setAdmittedInstitutes] = React.useState([]);
  const [anchorElInstitute, setAnchorElInstitute] = React.useState(null);
  const [notificationCount] = React.useState(5);

  React.useEffect(() => {
    if (profile?.role === "student" && !profile.institution_name && profile.id) {
      getUserApplications(profile.id)
        .then((data) => {
          const appsArray = Array.isArray(data?.applications) ? data.applications : (Array.isArray(data) ? data : []);
          const approvedApps = appsArray.filter(
            (app) => app.status === "approved" || app.status === "enrolled"
          );
          if (approvedApps.length > 0) {
            apiClient
              .get(`/public/institutes`)
              .then((res) => {
                const institutes = res.data?.institutes || res.data || [];
                const matched = approvedApps
                  .map((app) => {
                    const targetId = app.institute_id || app.instituteId;
                    return institutes.find(
                      (inst) =>
                        String(inst.id) === String(targetId) ||
                        String(inst._id) === String(targetId)
                    );
                  })
                  .filter(Boolean);

                let uniqueMatched = matched.filter(
                  (inst, index, self) =>
                    index === self.findIndex((t) => (t.id || t._id) === (inst.id || inst._id))
                );
                if (uniqueMatched.length === 0 && institutes.length > 0) {
                  uniqueMatched = [institutes[0]];
                }
                if (uniqueMatched.length > 0) {
                  setAdmittedInstitutes(uniqueMatched);
                  setDynamicInstitute(uniqueMatched[0]);
                }
              })
              .catch((err) => console.error(err));
          }
        })
        .catch((err) => console.error(err));
    }
  }, [profile?.id, profile?.role, profile?.institution_name]);

  const locationParts = profile?.location ? profile.location.split(", ") : [];
  const region = locationParts.length > 0 ? locationParts[0] : "सोनभद्र";
  const country =
    locationParts.length > 1 ? locationParts[locationParts.length - 1] : "भारत";

  const countryData = gazeteer.Countries.find(
    (c) =>
      c.name.toLowerCase() === country.toLowerCase() ||
      (country === "भारत" && c.code === "IN")
  );
  const flagUrl = countryData ? countryData.flagUrl : indiaFlag.src;

  // School info block
  const schoolBlock = (() => {
    const isInstituteOrOrg = profile?.role === "institute" || profile?.role === "organisation";

    if (
      !isInstituteOrOrg &&
      (!profile?.institution_name && !dynamicInstitute)
    )
      return null;

    const rawName =
      profile?.institution_name ||
      dynamicInstitute?.institution_name ||
      dynamicInstitute?.full_name ||
      dynamicInstitute?.name ||
      dynamicInstitute?.username ||
      "";
    const parts = rawName ? rawName.split(' / ') : [];

    // Bilingual naming culture: local/Hindi name on top, English below
    let line1 = '';
    let line2 = '';

    if (isInstituteOrOrg) {
      line1 = rawName ? capitalizeFirstLetter(rawName.trim()) : getNoNamePlaceholder(language || 'en');
      line2 = profile?.role || 'organisation';
    } else {
      if (parts.length >= 2) {
        line1 = capitalizeFirstLetter(parts[0].trim());
        line2 = capitalizeFirstLetter(parts[1].trim());
      } else if (parts.length === 1 && parts[0].trim() !== '') {
        line1 = capitalizeFirstLetter(parts[0].trim());
        line2 = '';
      } else {
        line1 = getNoNamePlaceholder(language || 'en');
        line2 = '';
      }
    }

    return (
      <>
        <div
          className="school"
          onClick={(e) => {
            if (isInstituteOrOrg) {
              router.push("/dashboard/home/institute-profile");
            } else {
              setAnchorElInstitute(e.currentTarget);
            }
          }}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Box
            className="user_icon"
            sx={{
              borderRadius: 'var(--radius-full)',
              padding: "2px",
              border: "var(--border-thick) solid #28a745",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {(dynamicInstitute?.profile_pic_url || profile?.profile_pic_url) ? (
              <img
                src={dynamicInstitute?.profile_pic_url || profile?.profile_pic_url}
                alt="Institute Logo"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <SchoolIcon
              className="fallback-icon"
              sx={{
                color: "var(--color-primary)",
                fontSize: 28,
                display: (dynamicInstitute?.profile_pic_url || profile?.profile_pic_url) ? 'none' : 'block'
              }}
            />
          </Box>
          <div
            className="name_role_container"
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            <div style={{ display: "flex", flexDirection: "column", maxWidth: "220px" }}>
              <div
                className="user_name"
                style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                title={line1}
              >
                {line1}
              </div>
              {line2 && (
                <div
                  className="user_role"
                  style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  title={line2}
                >
                  {line2}
                </div>
              )}
            </div>
            {!isInstituteOrOrg && (
              <KeyboardArrowDownIcon sx={{ color: "var(--color-primary)", fontSize: 20 }} />
            )}
          </div>
        </div>

        {!isInstituteOrOrg && (
          <Menu
            anchorEl={anchorElInstitute}
            open={Boolean(anchorElInstitute)}
            onClose={() => setAnchorElInstitute(null)}
            MenuListProps={{ sx: { py: 0 } }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: anchorElInstitute
                  ? Math.max(280, anchorElInstitute.clientWidth)
                  : 280,
                borderRadius: 'var(--radius-lg)',
              },
            }}
          >
            {(() => {
              const otherInstitutes = admittedInstitutes.filter(
                (inst) => inst.id !== dynamicInstitute?.id
              );
              if (otherInstitutes.length === 0) {
                return (
                  <Box sx={{ py: 3, px: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Typography sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-sm)', fontStyle: "italic", fontWeight: 'var(--font-regular)' }}>
                      No other institution
                    </Typography>
                  </Box>
                );
              }
              return otherInstitutes.map((inst, idx) => {
                const instName = inst.institution_name || inst.full_name || inst.name || "";
                const instParts = instName ? instName.split(' / ') : [];
                const iPrimary = instParts.length >= 1 ? capitalizeFirstLetter(instParts[0].trim()) : capitalizeFirstLetter(instName);
                const iSecondary = instParts.length >= 2 ? capitalizeFirstLetter(instParts[1].trim()) : "";
                return (
                  <MenuItem
                    key={inst.id || idx}
                    onClick={() => {
                      setDynamicInstitute(inst);
                      setAnchorElInstitute(null);
                    }}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <SchoolIcon fontSize="small" sx={{ color: "var(--color-primary)" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={iPrimary}
                      secondary={iSecondary}
                      primaryTypographyProps={{ sx: { fontWeight: 'var(--font-semibold)', color: "var(--color-primary)", fontSize: 'var(--font-sm)' } }}
                      secondaryTypographyProps={{ sx: { color: "var(--color-success)", fontSize: 'var(--font-xs)' } }}
                    />
                  </MenuItem>
                );
              });
            })()}
            <Divider sx={{ my: 0 }} />
            <Box sx={{ p: 2 }}>
              <Button
                fullWidth
                variant="contained"
                disableElevation
                onClick={() => {
                  setAnchorElInstitute(null);
                  router.push("/dashboard/explore");
                }}
                sx={{
                  bgcolor: "var(--color-primary)",
                  color: "white",
                  fontWeight: 'var(--font-medium)',
                  py: 1,
                  fontSize: 'var(--font-base)',
                  "&:hover": { bgcolor: "var(--color-primary-hover)", },
                }}
                startIcon={<SearchIcon fontSize="small" />}
              >
                Search institution
              </Button>
            </Box>
          </Menu>
        )}
      </>
    );
  })();

  return (
    <>
      {/* Left side additions: hamburger */}
      <div className="menu" onClick={onSidebarOpen}>
        <MenuIcon sx={{ color: "var(--color-primary)", fontSize: 32 }} />
      </div>

      {/* Right side: school info, user info, country, notifications, quick links */}
      <div className="accessibility_tools">
        {schoolBlock}
        <div
          className="user_info"
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (profile?.role === "institute" || profile?.role === "organisation") {
              router.push("/dashboard/home/institute-profile");
            } else {
              router.push("/dashboard/home/profile");
            }
          }}
        >
          <div className="user_icon">
            {loading ? (
              <Box
                sx={{
                  borderRadius: 'var(--radius-full)',
                  border: "var(--border-thick) solid rgba(40, 167, 69, 0.25)",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Skeleton variant="circular" sx={{ width: 32, height: 32 }} />
              </Box>
            ) : profile?.username ? (
              <Box
                sx={{
                  borderRadius: 'var(--radius-full)',
                  border: "var(--border-thick) solid #28a745",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Avatar
                  src={profile.profile_pic_url}
                  imgProps={{ style: { objectFit: "cover", width: "var(--size-full)", height: "var(--size-full)" } }}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "var(--color-primary)",
                    color: "var(--color-white)",
                    fontSize: 14,
                    fontWeight: 'var(--font-bold)',
                  }}
                >
                  {profile.username.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            ) : (
              <PersonIcon sx={{ color: "var(--color-primary)", fontSize: 32 }} />
            )}
          </div>
          <div className="name_role_container">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <div className="user_name" style={{ color: "var(--color-primary)", fontWeight: "var(--font-semibold)", fontSize: 'var(--font-sm)' }}>
                {loading ? (
                  <Skeleton variant="text" sx={{ width: 100 }} />
                ) : (() => {
                  const rawProfileName =
                    profile?.full_name ||
                    profile?.username ||
                    "";
                  // Show local/Hindi name (first part before ' / ')
                  const rawName = rawProfileName.split(' / ')[0].trim() || rawProfileName;
                  return capitalizeFirstLetter(rawName);
                })()}
              </div>
              {!loading && profile?.kyc_status === "verified" && (
                <VerifiedIcon sx={{ color: "var(--color-primary)", fontSize: 14 }} titleAccess="Verified" />
              )}
            </Box>
            <div className="user_role" style={{ color: "var(--color-success)", fontWeight: 'var(--font-medium)' }}>
              {loading ? <Skeleton variant="text" sx={{ width: 60 }} /> : (profile?.role === 'institute' || profile?.role === 'organisation' ? 'Admin' : (profile?.role || "छात्र"))}
            </div>
          </div>
        </div>

        <div className="country">
          <div className="country_icon">
            {loading ? (
              <Box
                sx={{
                  border: "var(--border-thick) solid rgba(40, 167, 69, 0.25)",
                  borderRadius: 0,
                  padding: "1px",
                  bgcolor: "transparent",
                  display: "flex",
                }}
              >
                <Skeleton variant="rectangular" sx={{ width: 28, height: 20, borderRadius: 0 }} />
              </Box>
            ) : (
              <img src={flagUrl} alt="country" style={{ objectFit: "cover" }} />
            )}
          </div>
          <div className="country_region_container">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <div className="region" style={{ color: "var(--color-primary)", fontWeight: "var(--font-semibold)", fontSize: 'var(--font-sm)' }}>
                {loading ? <Skeleton variant="text" sx={{ width: 60 }} /> : region}
              </div>
            </Box>
            <div className="country_name" style={{ color: "var(--color-success)", fontWeight: 'var(--font-medium)' }}>
              {loading ? <Skeleton variant="text" sx={{ width: 40 }} /> : country}
            </div>
          </div>
        </div>

        <div className="notification">
          <AccessibleBadges count={notificationCount} />
        </div>

        <div>
          <Qlinks />
        </div>
      </div>
    </>
  );
}


// ---------------------------------------------------------------------------
// Admin variant — admin title, logout button
// ---------------------------------------------------------------------------
function AdminContent({ title, onLogout }) {
  return (
    <>
      <div className="accessibility_tools" style={{ gap: "1.5rem", display: "flex", alignItems: "center", width: "var(--size-full)", justifyContent: "flex-end" }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', display: { xs: 'none', sm: 'block' } }}>
          {title || "Admin Panel"}
        </Typography>
        <Button
          variant="contained"
          disableElevation
          onClick={onLogout}
          sx={{
            bgcolor: "var(--color-error)",
            "&:hover": { bgcolor: "var(--color-error)" },
            borderRadius: 'var(--radius-md)',
            px: 3,
            height: "42px",
            fontWeight: "var(--font-bold)",
            textTransform: "none",
            fontSize: 'var(--font-base)'
          }}
        >
          Log Out
        </Button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Unified Navbar — main export
// ---------------------------------------------------------------------------

export default function Navbar({ variant = "dashboard", onLoginClick, title, onLogout }) {
  const { language = "en" } = useAccessibility() || {};
  const router = useAppRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLanding = variant === "landing";
  const isAdmin = variant === "admin";

  return (
    <>
      <nav
        className="nav"
        style={{ borderBottom: "var(--border-thin) solid rgba(0, 86, 179, 0.15)" }}
      >
        {/* Logo — always shown */}
        <div className="menu_logo_container">
          <div
            className="logo"
            onClick={() => (!isLanding && !isAdmin) && router.push("/dashboard/home")}
            style={{ cursor: (isLanding || isAdmin) ? "default" : "pointer", display: "flex", alignItems: "center", gap: "12px" }}
          >
            <img src={logo.src} alt="Tarang" style={{ height: 'var(--box-height)' }} />
            <span style={{ color: "var(--color-slate-900)", fontSize: "2rem", fontWeight: "var(--font-bold)" }}>
              Tarang
            </span>
          </div>

          {/* Dashboard: school info + hamburger inside menu_logo_container */}
          {!isLanding && !isAdmin && (
            <DashboardContent
              onSidebarOpen={() => setSidebarOpen(true)}
              language={language}
            />
          )}

          {/* Landing: hamburger not needed, but keep empty for CSS grid */}
          {(isLanding || isAdmin) && <div className="menu" style={{ visibility: "hidden" }} />}

          {/* Admin: Right side tools */}
          {isAdmin && (
            <AdminContent title={title} onLogout={onLogout} />
          )}
        </div>

        {/* Landing: center nav links + login button */}
        {isLanding && (
          <LandingContent onLoginClick={onLoginClick} language={language} />
        )}
      </nav>

      {/* Sidebar only for dashboard */}
      {!isLanding && !isAdmin && (
        <Sidebar open={sidebarOpen} toggleDrawer={(open) => () => setSidebarOpen(open)} />
      )}
    </>
  );
}
