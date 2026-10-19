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
// eslint-disable-next-line no-unused-vars
import { logoutUser } from "../../features/auth/authService";
import LogoutIcon from "@mui/icons-material/Logout";
import { IconButton, Tooltip, Avatar, Box } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import SchoolIcon from "@mui/icons-material/School";
import LanguageIcon from "@mui/icons-material/Language";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import Skeleton from "../common/Skeleton";
import MenuIcon from "@mui/icons-material/Menu";
import { useProfile } from "../../hooks/useProfile";
import Loader from "../common/Loader";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, loading } = useProfile();
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
          {profile?.role !== 'institute' && profile?.role !== 'organisation' && profile?.institution_name && (
            <div className="school">
              <div className="user_icon">
                <SchoolIcon sx={{ color: '#0056b3', fontSize: 30 }} />
              </div>
              <div className="name_role_container">
                <div className="user_name">
                  {profile.institution_name}
                </div>
                <div className="user_role">
                  {profile.institution_type || "संबद्ध संस्थान"}
                </div>
              </div>
            </div>
          )}
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
                  {loading ? <Skeleton width={100} /> : (profile?.institution_name || profile?.full_name || profile?.username || "आलोक")}
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
