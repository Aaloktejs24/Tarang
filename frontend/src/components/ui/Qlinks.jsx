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

// ── Styled dropdown ─────────────────────────────────────────
const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    transformOrigin={{ vertical: "top", horizontal: "right" }}
    {...props}
  />
))(() => ({
  "& .MuiPaper-root": {
    minWidth: 180,
    borderRadius: "14px",
    border: "1px solid rgba(0, 86, 179, 0.18)",
    boxShadow: "none",
    marginTop: "6px",
    background:
      "linear-gradient(135deg, rgba(0, 86, 179, 0.04) 0%, rgba(40, 167, 69, 0.03) 100%), #ffffff",
    overflow: "hidden",
  },
  // icon container — minWidth controls gap between icon & text
  "& .MuiListItemIcon-root": {
    minWidth: 20,            // ← tight gap
    color: "#475569",
    "& .MuiSvgIcon-root": {
      fontSize: "16px",      // ← matches 14px text baseline
    },
  },
  "& .MuiMenuItem-root": {
    fontSize: "14px",        // ← same as navbar .user_name
    fontWeight: 600,         // ← same as navbar .user_name
    color: "#0056b3",        // ← project blue
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
export default function CustomizedMenus() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick  = (e) => setAnchorEl(e.currentTarget);
  const handleClose  = ()  => setAnchorEl(null);

  const handleLogout = async () => {
    handleClose();
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <div>
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
          color: "#0056b3",
          borderRadius: "8px",
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
              primaryTypographyProps={{ fontSize: "14px", fontWeight: 500, color: "#1e293b" }}
            />
          </MenuItem>
        </Link>

        {/* Logout */}
        <MenuItem
          onClick={handleLogout}
          sx={{
            "&, & .MuiListItemIcon-root": { color: "#ef4444" },
            "&:hover": { backgroundColor: "rgba(239,68,68,0.06)" },
          }}
        >
          <ListItemIcon>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="लॉगआउट"
            primaryTypographyProps={{ fontSize: "14px", fontWeight: 500, color: "#ef4444" }}
          />
        </MenuItem>
      </StyledMenu>
    </div>
  );
}
