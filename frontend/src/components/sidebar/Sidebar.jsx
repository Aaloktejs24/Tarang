import { useState } from "react";
import { Box, SwipeableDrawer, Divider, Avatar } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LanguageIcon from "@mui/icons-material/Language";
import SchoolIcon from "@mui/icons-material/School";
import LogoutIcon from "@mui/icons-material/Logout";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import FlagIcon from "@mui/icons-material/Flag";
import PollIcon from "@mui/icons-material/Poll";
import ForumIcon from "@mui/icons-material/Forum";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import indiaFlag from "../../assets/Flag_of_India.svg";
import gazeteer from "../../data/formated/gazeteer.json";
import "../../styles/sidebar.css";

import AccessibleBadges from "../ui/Notification";
import { useProfile } from "../../hooks/useProfile";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser } from "../../features/auth/authService";
import Loader from "../common/Loader";
import Skeleton from "../common/Skeleton";

export default function Sidebar({ open, toggleDrawer }) {
  const { profile, loading } = useProfile();
  const [notificationCount] = useState(5);
  const router = useRouter();

  const locationParts = profile?.location ? profile.location.split(', ') : [];
  const region = locationParts.length > 0 ? locationParts[0] : "सोनभद्र";
  const country = locationParts.length > 1 ? locationParts[locationParts.length - 1] : "भारत";

  const countryData = gazeteer.Countries.find(c => c.name.toLowerCase() === country.toLowerCase() || (country === "भारत" && c.code === "IN"));
  const flagUrl = countryData ? countryData.flagUrl : indiaFlag.src;

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/");
    }
  };

  const list = (
    <Box
      sx={{
        width: "300px",
      }}
      className="sidebar"
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <div
        className="header_sidebar"
        style={{ backgroundColor: "#0056b3", padding: "25px" }}
      >
        <div className="sidebar_user" style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "top",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#ffffff30",
                width: "100%",
                height: "48px",
                borderRadius: "27px",
              }}
            >
              {loading ? (
                <Skeleton variant="circular" width={56} height={56} style={{ border: "3px solid rgba(255,255,255,0.4)" }} />
              ) : profile?.username ? (
                <Avatar
                  src={profile.profile_pic_url}
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: "#ffffff",
                    color: "#0056b3",
                    fontWeight: "bold",
                    border: "3px solid rgba(255,255,255,0.4)",
                    borderRight: "1px solid #E2E8F0",
                  }}
                >
                  {profile.username.charAt(0).toUpperCase()}
                </Avatar>
              ) : (
                <AccountCircleIcon
                  sx={{ width: "48px", height: "48px", color: "#ffffff" }}
                />
              )}
              <div className="name_role_container">
                <div
                  className="user_name_s"
                  style={{
                    color: "#fff",
                    fontSize: "18px",
                    margin: "0 0 0 10px",
                  }}
                >
                  {loading ? <Skeleton width={100} /> : (profile?.full_name || profile?.username || "आलोक")}
                </div>
                <div className="user_role" style={{ margin: "0 0 0 10px" }}>
                  {loading ? <Skeleton width={60} /> : (profile?.role || "छात्र")}
                </div>
              </div>
            </div>
            <Link href="/dashboard/Notification" prefetch={false}>
              <div className="notification" style={{ padding: "0 0 0 6px" }}>
                <AccessibleBadges count={notificationCount} />
              </div>
            </Link>
          </div>
        </div>
        {profile?.institution_name && (
          <div className="school_s">
            <div className="ins_icon">
              <SchoolIcon sx={{ width: "25px", height: "25px", color: "#ffffff" }} />
            </div>
            <div className="name_type_container">
              <div
                className="ins_name"
                style={{ color: "#fff", fontSize: "14px", margin: "0 0 0 3px" }}
              >
                {profile.institution_name}
              </div>
              <div className="user_role" style={{ margin: "0 0 0 3px" }}>
                {profile.institution_type || "संबद्ध संस्थान"}
              </div>
            </div>
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: "30px",
            marginTop: "15px",
          }}
        >
          <div
            className="language_s"
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
            <div className="language_icon">
              <LanguageIcon sx={{ width: "24px", height: "24px", color: "#ffffff" }} />
            </div>
            <div
              className="lang_scri_container"
              style={{ margin: "5px 0 0 0" }}
            >
              <div
                className="language_name"
                style={{ color: "#fff", fontSize: "14px" }}
              >
                हिन्दी
              </div>
              <div className="script_name">देवनागरी</div>
            </div>
          </div>
          <div
            className="country_s"
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
            <div className="country_icon">
              <img style={{ height: "22px" }} src={flagUrl} alt="country" />
            </div>
            <div className="country_region_container">
              <div
                className="region"
                style={{ color: "#fff", fontSize: "14px" }}
              >
                {loading ? <Skeleton width={60} /> : region}
              </div>
              <div className="country_name">{loading ? <Skeleton width={40} /> : country}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="body_sidebar" style={{ height: "100%" }}>
        <div
          className="body_sidebar"
          style={{
            padding: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {" "}
            <Link href="/dashboard/leaderboard" style={{ textDecoration: "none" }}>
              <div
                className="sidebar_menu_item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#0056b3",
                }}
              >
                <EmojiEventsIcon
                  sx={{
                    color: "#FFD700",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: "20px"
                  }}
                />
                <span>उत्कृष्ठता तालिका</span>
              </div>
            </Link>
            <Link href="/dashboard/progress" style={{ textDecoration: "none" }}>
              <div
                className="sidebar_menu_item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#0056b3",
                }}
              >
                <TrendingUpIcon
                  sx={{
                    color: "#28a745",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: "20px"
                  }}
                />
                <span>आपकी प्रगति</span>
              </div>
            </Link>
            <Link href="/dashboard/tasks" style={{ textDecoration: "none" }}>
              <div
                className="sidebar_menu_item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#0056b3",
                }}
              >
                <AssignmentIcon
                  sx={{
                    color: "#8e44ad",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: "20px"
                  }}
                />
                <span>आपके टास्क</span>
              </div>
            </Link>
            <Link href="/dashboard/certificate" style={{ textDecoration: "none" }}>
              <div
                className="sidebar_menu_item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#0056b3",
                }}
              >
                <CardMembershipIcon
                  sx={{
                    color: "#f39c12",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: "20px"
                  }}
                />
                <span>आपके प्रमाण-पत्र</span>
              </div>
            </Link>
            <Link href="/dashboard/saved-content" style={{ textDecoration: "none" }}>
              <div
                className="sidebar_menu_item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#0056b3",
                }}
              >
                <BookmarkIcon
                  sx={{
                    color: "#FF6347",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: "20px"
                  }}
                />
                <span>सहेजल</span>
              </div>
            </Link>
            <Link href="/dashboard/competition" style={{ textDecoration: "none" }}>
              <div
                className="sidebar_menu_item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#0056b3",
                }}
              >
                <FlagIcon
                  sx={{
                    color: "#6c757d",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: "20px"
                  }}
                />
                <span>प्रतियोगिता</span>
              </div>
            </Link>
            <Link href="/dashboard/results" style={{ textDecoration: "none" }}>
              <div
                className="sidebar_menu_item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#0056b3",
                }}
              >
                <PollIcon
                  sx={{
                    color: "#17a2b8",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: "20px"
                  }}
                />
                <span>परिणाम</span>
              </div>
            </Link>
            <Link href="/dashboard/forum" style={{ textDecoration: "none" }}>
              <div
                className="sidebar_menu_item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#0056b3",
                }}
              >
                <ForumIcon
                  sx={{
                    color: "#007bff",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: "20px"
                  }}
                />
                <span>वार्तालाप</span>
              </div>
            </Link>
            <Link href="/dashboard/ranking" style={{ textDecoration: "none" }}>
              <div
                className="sidebar_menu_item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#0056b3",
                }}
              >
                <SortByAlphaIcon
                  sx={{
                    color: "#FF8C00",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: "20px"
                  }}
                />
                <span>क्रमबद्धता</span>
              </div>
            </Link>
            <Link href="/dashboard/settings" style={{ textDecoration: "none" }}>
              <div
                className="sidebar_menu_item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#0056b3",
                }}
              >
                <SettingsIcon
                  sx={{
                    color: "#00000090",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: "20px"
                  }}
                />
                <span>समायोजन</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="footer_sidebar">
        <div
          className="v_c_t&c"
          style={{
            padding: "0 25px 25px 25px",
            color: "#0056b380",
            fontSize: "12px",
          }}
        >
          <div style={{ fontSize: "14px", marginBottom: "5px" }}>
            © 2025 तरंग || सर्वाधिकार सुरक्षित
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div>गोपनीयता नीति</div>
            <div>नियम एवं शर्तें</div>
            <div>संस्करण: 1.0.0</div>
          </div>
        </div>
        <div
          className="logout_logo_label"
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            height: "60px",
            padding: "0 0 0 25px",
            backgroundColor: "#28a745",
            cursor: "pointer",
          }}
        >
          <div className="logout_icon">
            <LogoutIcon sx={{ color: "#ffffff", fontSize: 24 }} />
          </div>
          <div
            className="logout_label"
            style={{ color: "#fff", fontSize: "14px" }}
          >
            लॉगआउट
          </div>
        </div>
      </div>
    </Box>
  );

  return (
    <SwipeableDrawer
      anchor="left"
      open={open}
      onClose={toggleDrawer(false)}
      onOpen={toggleDrawer(true)}
    >
      {list}
    </SwipeableDrawer>
  );
}
