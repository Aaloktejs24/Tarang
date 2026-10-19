import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import "../../styles/navbar.css";
import Sidebar from "../sidebar/Sidebar.jsx";
import Qlinks from "../ui/Qlinks.jsx";
import logo from "../../assets/logo.svg";
import Search from "../../assets/Search.svg";
import menuIcon from "../../assets/menu.svg";
import userIcon from "../../assets/Account_icon.svg";
import SchoolIconSvg from "../../assets/School.svg";
import languageIcon from "../../assets/language_icon.svg";
import indiaFlag from "../../assets/Flag_of_India.svg";
import gazeteer from "../../data/formated/gazeteer.json";
import AccessibleBadges from "../ui/Notification.jsx";

import { logoutUser } from "../../features/auth/authService";
import LogoutIcon from "@mui/icons-material/Logout";
import { IconButton, Tooltip, Avatar, Box, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Button } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import SchoolIcon from "@mui/icons-material/School";
import LanguageIcon from "@mui/icons-material/Language";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Skeleton from "../common/Skeleton";
import MenuIcon from "@mui/icons-material/Menu";
import { useProfile } from "../../hooks/useProfile";
import { apiClient } from "../../lib/apiClient";
import { getUserApplications } from "../../features/admission/admissionService";
import Loader from "../common/Loader";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import { getNoNamePlaceholder } from "../../utils/stringUtils";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { language = 'en' } = useAccessibility() || {};

  const { profile, loading } = useProfile();
  const [dynamicInstitute, setDynamicInstitute] = React.useState(null);
  const [admittedInstitutes, setAdmittedInstitutes] = React.useState([]);
  const [anchorElInstitute, setAnchorElInstitute] = React.useState(null);

  React.useEffect(() => {
    if (profile?.role === 'student' && !profile.institution_name && profile.id) {
      getUserApplications(profile.id).then(data => {
        const apps = data.applications || data || [];
        const approvedApps = apps.filter(app => app.status === 'approved' || app.status === 'enrolled');
        if (approvedApps.length > 0) {
          apiClient.get(`/public/institutes`).then(res => {
            const institutes = res.data?.institutes || res.data || [];
            const matched = approvedApps.map(app => {
              const targetId = app.institute_id || app.instituteId;
              return institutes.find(inst => String(inst.id) === String(targetId) || String(inst._id) === String(targetId));
            }).filter(Boolean);

            let uniqueMatched = matched.filter((inst, index, self) => index === self.findIndex((t) => (t.id || t._id) === (inst.id || inst._id)));

            if (uniqueMatched.length === 0 && institutes.length > 0) {
              uniqueMatched = [institutes[0]];
            }

            if (uniqueMatched.length > 0) {
              setAdmittedInstitutes(uniqueMatched);
              setDynamicInstitute(uniqueMatched[0]);
            }
          }).catch(err => console.error(err));
        }
      }).catch(err => console.error(err));
    }
  }, [profile?.id, profile?.role, profile?.institution_name]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount] = useState(5);

  const locationParts = profile?.location ? profile.location.split(', ') : [];
  const region = locationParts.length > 0 ? locationParts[0] : "सोनभद्र";
  const country = locationParts.length > 1 ? locationParts[locationParts.length - 1] : "भारत";

  const countryData = gazeteer.Countries.find(c => c.name.toLowerCase() === country.toLowerCase() || (country === "भारत" && c.code === "IN"));
  const flagUrl = countryData ? countryData.flagUrl : indiaFlag.src;

  const toggleDrawer = (open) => () => {
    setSidebarOpen(open);
  };

  return (
    <>
      <nav className="nav" style={{ borderBottom: "1px solid rgba(0, 86, 179, 0.15)" }}>
        <div className="menu_logo_container">
          <div className="logo" onClick={() => router.push("/dashboard/home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
            <img src={logo.src} alt="Tarang" style={{ height: "45px" }} />
            <span style={{ fontFamily: "'Rozha One', serif", color: "#001b3a", fontSize: "2rem", fontWeight: "bold" }}>Tarang</span>
          </div>
          {profile?.role !== 'institute' && profile?.role !== 'organisation' && (profile?.institution_name || dynamicInstitute) && (() => {
            const rawName = profile?.institution_name || dynamicInstitute?.institution_name || dynamicInstitute?.full_name || dynamicInstitute?.name || dynamicInstitute?.username || "";
            const parts = rawName ? rawName.split(' / ') : [];

            const nationalLang = countryData ? countryData.officialLang : "hi";
            const stateLang = language || 'en';

            const defaultLang1 = getNoNamePlaceholder(stateLang);
            const defaultLang2 = stateLang === nationalLang ? "" : getNoNamePlaceholder(nationalLang);

            let line1 = ""; // Local (Top)
            let line2 = ""; // National (Bottom)

            if (parts.length >= 2) {
              line1 = parts[0].trim();
              line2 = parts[1].trim();
            } else if (parts.length === 1 && parts[0].trim() !== "") {
              const nameStr = parts[0].trim();
              // Heuristic: if it's purely English characters and state language is not English,
              // assume this is the National (English) name, so put it on the bottom.
              const isEnglish = /^[A-Za-z0-9\s.,&'()\-]+$/.test(nameStr);
              if (isEnglish && stateLang !== 'en' && nationalLang === 'en') {
                line1 = defaultLang1;
                line2 = nameStr;
              } else {
                line1 = nameStr;
                line2 = defaultLang2;
              }
            } else {
              line1 = defaultLang1;
              line2 = defaultLang2;
            }

            return (
              <>
                <div className="school" onClick={(e) => setAnchorElInstitute(e.currentTarget)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Box className="user_icon" sx={{ borderRadius: '50%', padding: '2px', border: '2px solid #28a745', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, flexShrink: 0 }}>
                    <SchoolIcon sx={{ color: '#0056b3', fontSize: 28 }} />
                  </Box>
                  <div className="name_role_container" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '220px' }}>
                      <div className="user_name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={line1}>
                        {line1}
                      </div>
                      {line2 && (
                        <div className="user_role" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={line2}>
                          {line2}
                        </div>
                      )}
                    </div>
                    <KeyboardArrowDownIcon sx={{ color: '#0056b3', fontSize: 20 }} />
                  </div>
                </div>

                <Menu
                  anchorEl={anchorElInstitute}
                  open={Boolean(anchorElInstitute)}
                  onClose={() => setAnchorElInstitute(null)}
                  PaperProps={{ sx: { mt: 1, minWidth: 220, borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } }}
                >
                  {(() => {
                    const otherInstitutes = admittedInstitutes.filter(inst => inst.id !== dynamicInstitute?.id);
                    if (otherInstitutes.length === 0) {
                      return (
                        <MenuItem disabled sx={{ py: 1.5, px: 2 }}>
                          <ListItemText
                            primary="No other institution"
                            primaryTypographyProps={{ sx: { color: '#6c757d', fontSize: '14px', fontStyle: 'italic', textAlign: 'center' } }}
                          />
                        </MenuItem>
                      );
                    }
                    return otherInstitutes.map((inst, idx) => {
                      const instName = inst.institution_name || inst.full_name || inst.name || "";
                      const instParts = instName.split(' / ');
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
                            <SchoolIcon fontSize="small" sx={{ color: '#0056b3' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={instParts[0] || instName}
                            secondary={instParts[1] || ''}
                            primaryTypographyProps={{ sx: { fontWeight: 600, color: '#0056b3', fontSize: '14px' } }}
                            secondaryTypographyProps={{ sx: { color: '#28a745', fontSize: '12px' } }}
                          />
                        </MenuItem>
                      );
                    });
                  })()}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ px: 2, pb: 1.5 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      disableElevation
                      onClick={() => {
                        setAnchorElInstitute(null);
                        router.push("/dashboard/explore");
                      }}
                      sx={{
                        bgcolor: '#0056b3',
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: "8px",
                        py: 1,
                        fontSize: '14px',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#004494',
                          boxShadow: 'none'
                        }
                      }}
                      startIcon={<SearchIcon fontSize="small" />}
                    >
                      Search institution
                    </Button>
                  </Box>
                </Menu>
              </>
            );
          })()}
          <div className="menu" onClick={toggleDrawer(true)}>
            <MenuIcon sx={{ color: '#0056b3', fontSize: 32 }} />
          </div>
        </div>

        <div className="accessibility_tools">
          <div className="user_info" style={{ cursor: "pointer" }} onClick={() => router.push("/dashboard/home/profile")}>
            <div className="user_icon">
              {loading ? (
                <Box sx={{
                  borderRadius: '50%',
                  border: '2px solid rgba(40, 167, 69, 0.25)',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Skeleton variant="circular" width={32} height={32} />
                </Box>
              ) : profile?.username ? (
                <Box sx={{
                  borderRadius: '50%',
                  border: '2px solid #28a745',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Avatar
                    src={profile.profile_pic_url}
                    imgProps={{ style: { objectFit: "cover", width: "100%", height: "100%" } }}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "#0056b3",
                      color: "#ffffff",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {profile.username.charAt(0).toUpperCase()}
                  </Avatar>
                </Box>
              ) : (
                <PersonIcon sx={{ color: '#0056b3', fontSize: 32 }} />
              )}
            </div>
            <div className="name_role_container">
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <div className="user_name" style={{ color: "#0056b3", fontWeight: "600", fontSize: "14px" }}>
                  {loading ? <Skeleton width={100} /> : (() => {
                    const name = profile?.institution_name || profile?.full_name || profile?.username || "आलोक";
                    return name.split(' / ')[0].trim();
                  })()}
                </div>
                {!loading && profile?.kyc_status === "verified" && (
                  <VerifiedIcon sx={{ color: "#0056b3", fontSize: 14 }} titleAccess="Verified" />
                )}
              </Box>
              <div className="user_role" style={{ color: "#28a745", fontWeight: 500 }}>{loading ? <Skeleton width={60} /> : (profile?.role || "छात्र")}</div>
            </div>
          </div>

          <div className="country">
            <div className="country_icon">
              {loading ? (
                <Box sx={{ border: '2px solid rgba(40, 167, 69, 0.25)', borderRadius: 0, padding: '1px', bgcolor: 'transparent', display: 'flex' }}>
                  <Skeleton variant="rectangular" width={28} height={20} style={{ borderRadius: 0 }} />
                </Box>
              ) : (
                <img src={flagUrl} alt="country" style={{ objectFit: 'cover' }} />
              )}
            </div>
            <div className="country_region_container">
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <div className="region" style={{ color: "#0056b3", fontWeight: "600", fontSize: "14px" }}>{loading ? <Skeleton width={60} /> : region}</div>
              </Box>
              <div className="country_name" style={{ color: "#28a745", fontWeight: 500 }}>{loading ? <Skeleton width={40} /> : country}</div>
            </div>
          </div>
          <div className="notification">
            <AccessibleBadges count={notificationCount} />
          </div>

          <div>
            <Qlinks />
          </div>
        </div>
      </nav>
      <Sidebar open={sidebarOpen} toggleDrawer={toggleDrawer} />
    </>
  );
}
