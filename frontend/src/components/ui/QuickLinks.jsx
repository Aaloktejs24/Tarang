"use client";
import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Link from "next/link";
import { logoutUser } from "../../features/auth/authService";
import Loader from "../common/Loader";
import { glassPaperSx } from "../../styles/commonStyles";

// ── Styled dropdown ─────────────────────────────────────────
const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    transformOrigin={{ vertical: "top", horizontal: "right" }}
    {...props}
    PaperProps={{
      sx: {
        ...glassPaperSx,
        minWidth: 180,
        overflow: "hidden",
        ...props.PaperProps?.sx
      }
    }}
  />
))(() => ({
  // icon container — minWidth controls gap between icon & text
  "& .MuiListItemIcon-root": {
    minWidth: 20,            // ← tight gap
    color: "var(--color-slate-500)",
    "& .MuiSvgIcon-root": {
      fontSize: 'var(--font-base)',      // ← matches 14px text baseline
    },
  },
  "& .MuiMenuItem-root": {
    fontSize: 'var(--font-sm)',        // ← same as navbar .user_name
    fontWeight: 'var(--font-semibold)',         // ← same as navbar .user_name
    color: "var(--color-primary)",        // ← project blue
    padding: "8px 14px",
    gap: "4px",
    "&:hover": {
      backgroundColor: "rgba(0, 86, 179, 0.06)",
    },
  },
  "& .MuiList-root": {
    padding: "4px",
  },
}));

// ── Component ───────────────────────────────────────────────
export default function QuickLinks() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    handleClose();
    setIsLoggingOut(true);
    try {
      await Promise.all([
        logoutUser(),
        new Promise(resolve => setTimeout(resolve, 600)) // UX delay
      ]);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <div>
      {isLoggingOut && <Loader />}
      {/* ── Trigger button ── */}
      <Button
        id="qlinks-button"
        aria-controls={open ? "qlinks-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="text"
        disableElevation
        onClick={handleClick}
        sx={{
          minWidth: "auto",
          p: "6px",
          color: "var(--color-primary)",
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Trigger icon size is independent — set it here */}
        <WidgetsOutlinedIcon sx={{ fontSize: 22 }} />
      </Button>

      {/* ── Dropdown ── */}
      <StyledMenu
        id="qlinks-menu"
        MenuListProps={{ "aria-labelledby": "qlinks-button" }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {/* Settings */}
        <Link href="/dashboard/settings" style={{ textDecoration: "none" }}>
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <SettingsOutlinedIcon />
            </ListItemIcon>
            <ListItemText
              primary="समायोजन"
              primaryTypographyProps={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--font-medium)', color: "var(--color-slate-900)" }}
            />
          </MenuItem>
        </Link>

        {/* Logout */}
        <MenuItem
          onClick={handleLogout}
          sx={{
            "&, & .MuiListItemIcon-root": { color: "var(--color-error)" },
            "&:hover": { backgroundColor: "rgba(239,68,68,0.06)" },
          }}
        >
          <ListItemIcon>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="लॉगआउट"
            primaryTypographyProps={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--font-medium)', color: "var(--color-error)" }}
          />
        </MenuItem>
      </StyledMenu>
    </div>
  );
}

export const CustomizedMenus = QuickLinks;
export const Qlinks = QuickLinks;
