import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import "../../styles/navbar.css";
import Sidebar from "../sidebar/Sidebar.jsx";
import Qlinks from "../ui/Qlinks.jsx";
import SearchBox from "../search/SearchBox.jsx";
import logo from "../../assets/logo.svg";
import Search from "../../assets/Search.svg";
import menuIcon from "../../assets/menu.svg";
import userIcon from "../../assets/Account_icon.svg";
import SchoolIconSvg from "../../assets/School.svg";
import languageIcon from "../../assets/language_icon.svg";
import indiaFlag from "../../assets/Flag_of_India.svg";
import { Country } from "country-state-city";
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
  
  const countryData = Country.getAllCountries().find(c => c.name.toLowerCase() === country.toLowerCase() || (country === "भारत" && c.isoCode === "IN"));
  const flagUrl = countryData ? `https://flagcdn.com/${countryData.isoCode.toLowerCase()}.svg` : indiaFlag.src;

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
          <div className="search_bar" style={{ margin: '0 auto' }}>
            <SearchBox />
          </div>
          {profile?.role !== 'institute' && profile?.role !== 'organisation' && (
            <div className="school">
              <div className="user_icon">
                <SchoolIcon sx={{ color: '#0056b3', fontSize: 30 }} />
              </div>
              <div className="name_role_container">
                <div className="user_name">
                  भारतीय प्रौद्योगिकी संस्थान कानपुर
                </div>
                <div className="user_role">
                  भारत सरकार के तहत स्वायत्त संस्थान
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
              {profile?.username ? (
                <Avatar
                  src={profile.profile_pic_url}
                  imgProps={{ style: { objectFit: "cover", width: "100%", height: "100%" } }}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "#0056b3",
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: 700,
                    boxShadow: "0 2px 6px rgba(0,86,179,0.3)",
                  }}
                >
                  {profile.username.charAt(0).toUpperCase()}
                </Avatar>
              ) : (
                <PersonIcon sx={{ color: '#0056b3', fontSize: 32 }} />
              )}
            </div>
            <div className="name_role_container">
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <div className="user_name" style={{ color: "#0056b3", fontWeight: "600", fontSize: "14px" }}>
                  {loading ? <Loader mini /> : (profile?.institution_name || profile?.full_name || profile?.username || "आलोक")}
                </div>
                {profile?.kyc_status === "verified" && (
                  <VerifiedIcon sx={{ color: "#0056b3", fontSize: 14 }} titleAccess="Verified" />
                )}
              </Box>
              <div className="user_role" style={{ color: "#28a745", fontWeight: 500 }}>{loading ? "---" : (profile?.role || "छात्र")}</div>
            </div>
          </div>

          <div className="country">
            <div className="country_icon">
              <img src={flagUrl} alt="country" style={{ objectFit: 'cover' }} />
            </div>
            <div className="country_region_container">
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <div className="region" style={{ color: "#0056b3", fontWeight: "600", fontSize: "14px" }}>{loading ? "..." : region}</div>
              </Box>
              <div className="country_name" style={{ color: "#28a745", fontWeight: 500 }}>{loading ? "..." : country}</div>
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
