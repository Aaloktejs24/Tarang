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
import gazetteer from "../../data/formatted/gazetteer.json";
import "../../styles/sidebar.css";

import NotificationBadge from "../ui/NotificationBadge";
import { useProfile } from "../../hooks/useProfile";
import Link from "next/link";
import { useAppRouter } from '../../hooks/useAppRouter';
import { logoutUser } from "../../features/auth/authService";
import Loader from "../common/Loader";
import { Skeleton } from "@mui/material";

export default function Sidebar({ open, toggleDrawer }) {
  const { profile, loading } = useProfile();
  const [notificationCount] = useState(5);
  const router = useAppRouter();

  const locationParts = profile?.location ? profile.location.split(', ') : [];
  const region = locationParts.length > 0 ? locationParts[0] : "सोनभद्र";
  const country = locationParts.length > 1 ? locationParts[locationParts.length - 1] : "भारत";

  const countryData = gazetteer.Countries.find(c => c.name.toLowerCase() === country.toLowerCase() || (country === "भारत" && c.code === "IN"));
  const flagUrl = countryData?.flagUrl || gazetteer.Countries.find(c => c.code === "IN")?.flagUrl || "https://flagcdn.com/in.svg";

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await Promise.all([
        logoutUser(),
        new Promise(resolve => setTimeout(resolve, 600)) // UX delay to ensure spinner doesn't freeze instantly
      ]);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.href = "/";
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
        style={{ backgroundColor: "var(--color-primary)", padding: "25px" }}
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
                backgroundColor: "color-mix(in srgb, var(--color-white) var(--opacity-md), transparent)",
                width: "var(--size-full)",
                height: 'var(--box-height)',
                borderRadius: "27px",
              }}
            >
              {loading ? (
                <Skeleton variant="circular" sx={{ width: 56, height: 56, border: "3px solid rgba(255,255,255,0.4)" }} />
              ) : profile?.username ? (
                <Avatar
                  src={profile.profile_pic_url}
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)",
                    color: "var(--color-primary)",
                    fontWeight: "var(--font-bold)",
                    border: "3px solid rgba(255,255,255,0.4)",
                    borderRight: "var(--border-thin) solid var(--color-slate-200)",
                  }}
                >
                  {profile.username.charAt(0).toUpperCase()}
                </Avatar>
              ) : (
                <AccountCircleIcon
                  sx={{ width: "48px", height: 'var(--box-height)', color: "var(--color-white)" }}
                />
              )}
              <div className="name_role_container">
                <div
                  className="user_name_s"
                  style={{
                    color: "var(--color-white)",
                    fontSize: 'var(--font-lg)',
                    margin: "0 0 0 10px",
                  }}
                >
                  {loading ? <Skeleton variant="text" sx={{ width: 100 }} /> : (profile?.full_name || profile?.username || "आलोक")}
                </div>
                <div className="user_role" style={{ margin: "0 0 0 10px" }}>
                  {loading ? <Skeleton variant="text" sx={{ width: 60 }} /> : (profile?.role || "छात्र")}
                </div>
              </div>
            </div>
            <Link href="/dashboard/Notification" prefetch={false}>
              <div className="notification" style={{ padding: "0 0 0 6px" }}>
                <NotificationBadge count={notificationCount} />
              </div>
            </Link>
          </div>
        </div>
        {profile?.primary_name && (
          <div className="school_s">
            <div className="ins_icon">
              <SchoolIcon sx={{ width: "25px", height: "25px", color: "var(--color-white)" }} />
            </div>
            <div className="name_type_container">
              <div
                className="ins_name"
                style={{ color: "var(--color-white)", fontSize: 'var(--font-sm)', margin: "0 0 0 3px" }}
              >
                {profile.primary_name}
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
              <LanguageIcon sx={{ width: "24px", height: "24px", color: "var(--color-white)" }} />
            </div>
            <div
              className="lang_scri_container"
              style={{ margin: "5px 0 0 0" }}
            >
              <div
                className="language_name"
                style={{ color: "var(--color-white)", fontSize: 'var(--font-sm)' }}
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
                style={{ color: "var(--color-white)", fontSize: 'var(--font-sm)' }}
              >
                {loading ? <Skeleton variant="text" sx={{ width: 60 }} /> : region}
              </div>
              <div className="country_name">{loading ? <Skeleton variant="text" sx={{ width: 40 }} /> : country}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="body_sidebar" style={{ height: "var(--size-full)" }}>
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
                  color: "var(--color-primary)",
                }}
              >
                <EmojiEventsIcon
                  sx={{
                    color: "var(--color-warning)",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: 'var(--font-lg)'
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
                  color: "var(--color-primary)",
                }}
              >
                <TrendingUpIcon
                  sx={{
                    color: "var(--color-success)",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: 'var(--font-lg)'
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
                  color: "var(--color-primary)",
                }}
              >
                <AssignmentIcon
                  sx={{
                    color: "var(--color-slate-500)",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: 'var(--font-lg)'
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
                  color: "var(--color-primary)",
                }}
              >
                <CardMembershipIcon
                  sx={{
                    color: "var(--color-warning)",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: 'var(--font-lg)'
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
                  color: "var(--color-primary)",
                }}
              >
                <BookmarkIcon
                  sx={{
                    color: "var(--color-error)",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: 'var(--font-lg)'
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
                  color: "var(--color-primary)",
                }}
              >
                <FlagIcon
                  sx={{
                    color: "var(--color-slate-500)",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: 'var(--font-lg)'
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
                  color: "var(--color-primary)",
                }}
              >
                <PollIcon
                  sx={{
                    color: "var(--color-success)",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: 'var(--font-lg)'
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
                  color: "var(--color-primary)",
                }}
              >
                <ForumIcon
                  sx={{
                    color: "var(--color-primary)",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: 'var(--font-lg)'
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
                  color: "var(--color-primary)",
                }}
              >
                <SortByAlphaIcon
                  sx={{
                    color: "var(--color-warning)",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: 'var(--font-lg)'
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
                  color: "var(--color-primary)",
                }}
              >
                <SettingsIcon
                  sx={{
                    color: "color-mix(in srgb, var(--color-black) var(--opacity-lg), transparent)",
                    marginRight: "20px",
                    width: "20px",
                    fontSize: 'var(--font-lg)'
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
            color: "color-mix(in srgb, var(--color-primary) var(--opacity-lg), transparent)",
            fontSize: 'var(--font-xs)',
          }}
        >
          <div style={{ fontSize: 'var(--font-sm)', marginBottom: "5px" }}>
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
            backgroundColor: "var(--color-success)",
            cursor: "pointer",
          }}
        >
          <div className="logout_icon">
            <LogoutIcon sx={{ color: "var(--color-white)", fontSize: 24 }} />
          </div>
          <div
            className="logout_label"
            style={{ color: "var(--color-white)", fontSize: 'var(--font-sm)' }}
          >
            लॉगआउट
          </div>
        </div>
      </div>
    </Box>
  );

  return (
    <>
      {isLoggingOut && <Loader />}
      <SwipeableDrawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        {list}
      </SwipeableDrawer>
    </>
  );
}
